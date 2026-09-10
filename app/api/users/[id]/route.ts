import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ok, error } from '@/lib/response';
import { requireAdmin } from '@/lib/session';
import bcrypt from 'bcryptjs';

type Params = { params: Promise<{ id: string }> };

export async function GET(_: NextRequest, { params }: Params) {
  const session = await requireAdmin();
  if (session instanceof Response) return session;

  const { id } = await params;
  const user = await prisma.user.findUnique({
    where: { id: Number(id) },
    select: { id: true, username: true, email: true, role: true, createdAt: true },
  });
  if (!user) return error('User tidak ditemukan', 404);
  return ok(user);
}

export async function PUT(req: NextRequest, { params }: Params) {
  const session = await requireAdmin();
  if (session instanceof Response) return session;

  const { id } = await params;
  const body = await req.json();
  const { username, email, password, role } = body;

  const data: Record<string, unknown> = {};
  if (username) data.username = username;
  if (email) data.email = email;
  if (role) data.role = role;
  if (password) data.password = await bcrypt.hash(password, 10);

  const user = await prisma.user.update({
    where: { id: Number(id) },
    data,
    select: { id: true, username: true, email: true, role: true },
  });
  return ok(user);
}

export async function DELETE(_: NextRequest, { params }: Params) {
  const session = await requireAdmin();
  if (session instanceof Response) return session;

  const { id } = await params;
  await prisma.user.delete({ where: { id: Number(id) } });
  return ok({ message: 'User berhasil dihapus' });
}
