import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ok } from '@/lib/response';
import { requireAuth } from '@/lib/session';

type Params = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, { params }: Params) {
  const session = await requireAuth();
  if (session instanceof Response) return session;

  const { id } = await params;
  const body = await req.json();
  const wallet = await prisma.digitalWallet.update({
    where: { id: Number(id) },
    data: body,
  });
  return ok(wallet);
}

export async function DELETE(_: NextRequest, { params }: Params) {
  const session = await requireAuth();
  if (session instanceof Response) return session;

  const { id } = await params;
  await prisma.digitalWallet.delete({ where: { id: Number(id) } });
  return ok({ message: 'Rekening berhasil dihapus' });
}
