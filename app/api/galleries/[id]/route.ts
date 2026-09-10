import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ok, error } from '@/lib/response';
import { requireAuth } from '@/lib/session';

type Params = { params: Promise<{ id: string }> };

export async function GET(_: NextRequest, { params }: Params) {
  const session = await requireAuth();
  if (session instanceof Response) return session;

  const { id } = await params;
  const gallery = await prisma.gallery.findUnique({ where: { id: Number(id) } });
  if (!gallery) return error('Foto tidak ditemukan', 404);
  return ok(gallery);
}

export async function PUT(req: NextRequest, { params }: Params) {
  const session = await requireAuth();
  if (session instanceof Response) return session;

  const { id } = await params;
  const body = await req.json();
  const gallery = await prisma.gallery.update({
    where: { id: Number(id) },
    data: body,
  });
  return ok(gallery);
}

export async function DELETE(_: NextRequest, { params }: Params) {
  const session = await requireAuth();
  if (session instanceof Response) return session;

  const { id } = await params;
  await prisma.gallery.delete({ where: { id: Number(id) } });
  return ok({ message: 'Foto berhasil dihapus' });
}
