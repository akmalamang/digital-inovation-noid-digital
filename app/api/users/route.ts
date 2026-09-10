import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ok, error } from '@/lib/response';
import { requireAdmin } from '@/lib/session';
import bcrypt from 'bcryptjs';

// GET — hanya admin
export async function GET() {
  const session = await requireAdmin();
  if (session instanceof Response) return session;

  const users = await prisma.user.findMany({
    select: { id: true, username: true, email: true, role: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
  });
  return ok(users);
}

// POST — hanya admin
export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (session instanceof Response) return session;

  const body = await req.json();
  const { username, email, password, role } = body;

  if (!username || !email || !password) {
    return error('username, email, dan password wajib diisi');
  }

  const existingEmail = await prisma.user.findUnique({ where: { email } });
  if (existingEmail) return error('Email sudah terdaftar', 409);

  const existingUsername = await prisma.user.findUnique({ where: { username } });
  if (existingUsername) return error('Username sudah digunakan', 409);

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { username, email, password: hashedPassword, role: role ?? 'client' },
    select: { id: true, username: true, email: true, role: true, createdAt: true },
  });

  return ok(user, 201);
}
