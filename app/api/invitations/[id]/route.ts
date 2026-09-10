import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ok, error } from '@/lib/response';
import { requireAuth, requireAdmin } from '@/lib/session';

type Params = { params: Promise<{ id: string }> };

export async function GET(_: NextRequest, { params }: Params) {
  const session = await requireAuth();
  if (session instanceof Response) return session;

  const { id } = await params;
  const invitation = await prisma.invitation.findUnique({
    where: { id: Number(id) },
    include: {
      user: { select: { id: true, username: true, email: true } },
      theme: true,
      weddingDetail: true,
      galleries: true,
      digitalWallets: true,
      guestBooks: { orderBy: { createdAt: 'desc' } },
    },
  });

  if (!invitation) return error('Undangan tidak ditemukan', 404);

  // Client hanya bisa lihat undangan miliknya sendiri
  if (session.user.role !== 'admin' && invitation.userId !== Number(session.user.id)) {
    return error('Forbidden', 403);
  }

  return ok(invitation);
}

export async function PUT(req: NextRequest, { params }: Params) {
  const session = await requireAdmin();
  if (session instanceof Response) return session;

  const { id } = await params;
  const body = await req.json();
  const { themeId, slug, isActive } = body;

  if (slug) {
    const existing = await prisma.invitation.findFirst({
      where: { slug, NOT: { id: Number(id) } },
    });
    if (existing) return error('Slug sudah digunakan', 409);
  }

  const invitation = await prisma.invitation.update({
    where: { id: Number(id) },
    data: { themeId, slug, isActive },
  });
  return ok(invitation);
}

export async function DELETE(_: NextRequest, { params }: Params) {
  const session = await requireAdmin();
  if (session instanceof Response) return session;

  const { id } = await params;
  await prisma.invitation.delete({ where: { id: Number(id) } });
  return ok({ message: 'Undangan berhasil dihapus' });
}
