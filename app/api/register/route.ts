// app/api/auth/register/route.ts
// POST /api/auth/register — Daftarkan user baru
// Endpoint ini terbuka (tidak butuh login)

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ok, error } from '@/lib/response';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { username, email, password } = body;

  // Validasi input
  if (!username || !email || !password) {
    return error('username, email, dan password wajib diisi');
  }

  if (password.length < 8) {
    return error('Password minimal 8 karakter');
  }

  // Cek apakah email sudah terdaftar
  const existingEmail = await prisma.user.findUnique({ where: { email } });
  if (existingEmail) return error('Email sudah terdaftar', 409);

  // Cek apakah username sudah dipakai
  const existingUsername = await prisma.user.findUnique({ where: { username } });
  if (existingUsername) return error('Username sudah digunakan', 409);

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Simpan user baru — role default: "client"
  const user = await prisma.user.create({
    data: { username, email, password: hashedPassword, role: 'client' },
    select: { id: true, username: true, email: true, role: true, createdAt: true },
  });

  return ok(user, 201);
}
