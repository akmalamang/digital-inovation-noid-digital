import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ok, error } from '@/lib/response';
import { requireAuth } from '@/lib/session';

export async function GET(req: NextRequest) {
  const session = await requireAuth();
  if (session instanceof Response) return session;

  const { searchParams } = new URL(req.url);
  const invitationId = searchParams.get('invitationId');

  const galleries = await prisma.gallery.findMany({
    where: invitationId ? { invitationId: Number(invitationId) } : undefined,
    orderBy: { id: 'asc' },
  });
  return ok(galleries);
}

export async function POST(req: NextRequest) {
  const session = await requireAuth();
  if (session instanceof Response) return session;

  const body = await req.json();
  const { invitationId, filePath, type } = body;

  if (!invitationId || !filePath || !type) {
    return error('invitationId, filePath, dan type wajib diisi');
  }

  const gallery = await prisma.gallery.create({
    data: { invitationId, filePath, type },
  });
  return ok(gallery, 201);
}
