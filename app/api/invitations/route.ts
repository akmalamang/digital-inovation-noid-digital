import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ok, error } from '@/lib/response';
import { requireAuth, requireAdmin } from '@/lib/session';

export async function GET() {
  const session = await requireAuth();
  if (session instanceof Response) return session;

  // Admin lihat semua, client hanya punyanya sendiri
  const where = session.user.role === 'admin' ? {} : { userId: Number(session.user.id) };

  const invitations = await prisma.invitation.findMany({
    where,
    include: {
      user: { select: { id: true, username: true, email: true } },
      theme: { select: { id: true, themeName: true, thumbnail: true } },
      weddingDetail: true,
      _count: { select: { galleries: true, guestBooks: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
  return ok(invitations);
}

export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (session instanceof Response) return session;

  const body = await req.json();
  const { userId, themeId, slug } = body;

  if (!userId || !themeId || !slug) {
    return error('userId, themeId, dan slug wajib diisi');
  }

  const existing = await prisma.invitation.findUnique({ where: { slug } });
  if (existing) return error('Slug sudah digunakan', 409);

  const invitation = await prisma.invitation.create({
    data: { userId, themeId, slug },
    include: {
      user: { select: { username: true } },
      theme: { select: { themeName: true } },
    },
  });
  return ok(invitation, 201);
}
