// lib/session.ts
// Helper untuk ambil session di Server Component atau API Route
// dan utilitas proteksi berdasarkan role

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { error } from '@/lib/response';

// Ambil session aktif di Server Component atau API Route
export async function getSession() {
  return await getServerSession(authOptions);
}

// Gunakan ini di API route yang butuh user sudah login
// Contoh: const session = await requireAuth(); if (session instanceof Response) return session;
export async function requireAuth() {
  const session = await getSession();
  if (!session) return error('Unauthorized — silakan login', 401);
  return session;
}

// Gunakan ini di API route khusus admin
export async function requireAdmin() {
  const session = await getSession();
  if (!session) return error('Unauthorized — silakan login', 401);
  if (session.user.role !== 'admin') return error('Forbidden — akses ditolak', 403);
  return session;
}
