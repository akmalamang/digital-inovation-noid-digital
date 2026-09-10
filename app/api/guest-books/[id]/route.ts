import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ok } from '@/lib/response';
import { requireAdmin } from '@/lib/session';

type Params = { params: Promise<{ id: string }> };

export async function DELETE(_: NextRequest, { params }: Params) {
  const session = await requireAdmin();
  if (session instanceof Response) return session;

  const { id } = await params;
  await prisma.guestBook.delete({ where: { id: Number(id) } });
  return ok({ message: 'Ucapan berhasil dihapus' });
}
