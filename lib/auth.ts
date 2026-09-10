// lib/auth.ts
// Konfigurasi NextAuth: provider, callback, session strategy

import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export const authOptions: NextAuthOptions = {
  // Pakai JWT — tidak perlu tabel session di database
  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60, // Session berlaku 7 hari
  },

  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },

      // Fungsi ini dipanggil saat user submit form login
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email dan password wajib diisi');
        }

        // Cari user di database berdasarkan email
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          throw new Error('Email tidak ditemukan');
        }

        // Bandingkan password yang diinput dengan hash di database
        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

        if (!isPasswordValid) {
          throw new Error('Password salah');
        }

        // Return data user yang akan disimpan di token
        return {
          id: String(user.id),
          name: user.username,
          email: user.email,
          role: user.role, // Simpan role untuk keperluan proteksi route
        };
      },
    }),
  ],

  callbacks: {
    // jwt callback: dipanggil saat token dibuat atau diperbarui
    // Tambahkan data custom (id, role) ke dalam token JWT
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role: string }).role;
      }
      return token;
    },

    // session callback: dipanggil saat session diakses di frontend
    // Ekspos data dari token ke object session
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },

  pages: {
    signIn: '/auth/login', // Redirect ke halaman login custom
    error: '/auth/login', // Error ditampilkan di halaman login
  },

  // Secret untuk enkripsi JWT — wajib di-set di .env
  secret: process.env.NEXTAUTH_SECRET,
};
