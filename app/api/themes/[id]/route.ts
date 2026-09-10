import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ok, error } from '@/lib/response';
import { requireAdmin } from '@/lib/session';

type Params = { params: Promise<{ id: string }> };

export async function GET(_: NextRequest, { params }: Params) {
  const { id } = await params;
  const theme = await prisma.theme.findUnique({
    where: { id: Number(id) },
  });
  if (!theme) return error('Tema tidak ditemukan', 404);
  return ok(theme);
}

export async function PUT(req: NextRequest, { params }: Params) {
  const session = await requireAdmin();
  if (session instanceof Response) return session;

  const { id } = await params;
  const body = await req.json();

  const theme = await prisma.theme.update({
    where: { id: Number(id) },
    data: body,
  });
  return ok(theme);
}

export async function DELETE(_: NextRequest, { params }: Params) {
  const session = await requireAdmin();
  if (session instanceof Response) return session;

  const { id } = await params;
  await prisma.theme.delete({ where: { id: Number(id) } });
  return ok({ message: 'Tema berhasil dihapus' });
}
