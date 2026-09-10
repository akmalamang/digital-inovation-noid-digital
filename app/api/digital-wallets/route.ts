import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ok, error } from '@/lib/response';
import { requireAuth } from '@/lib/session';

export async function GET(req: NextRequest) {
  const session = await requireAuth();
  if (session instanceof Response) return session;

  const { searchParams } = new URL(req.url);
  const invitationId = searchParams.get('invitationId');

  const wallets = await prisma.digitalWallet.findMany({
    where: invitationId ? { invitationId: Number(invitationId) } : undefined,
  });
  return ok(wallets);
}

export async function POST(req: NextRequest) {
  const session = await requireAuth();
  if (session instanceof Response) return session;

  const body = await req.json();
  const { invitationId, bankName, accountNumber, accountOwner } = body;

  if (!invitationId || !bankName || !accountNumber || !accountOwner) {
    return error('Semua field wajib diisi');
  }

  const wallet = await prisma.digitalWallet.create({
    data: { invitationId, bankName, accountNumber, accountOwner },
  });
  return ok(wallet, 201);
}
