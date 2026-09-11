// app/api/invitations/slug/[slug]/route.ts
// GET /api/invitations/slug/:slug
// Dipakai oleh halaman publik undangan — visitor akses via domain.com/budi-riri

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ok, error } from '@/lib/response';

type Params = { params: Promise<{ slug: string }> };

export async function GET(_: NextRequest, { params }: Params) {
  const { slug } = await params;
  const invitation = await prisma.invitation.findUnique({
    where: { slug },
    include: {
      theme: true, // Untuk tahu folder template mana yang dirender
      weddingDetail: true, // Data pernikahan lengkap
      galleries: true, // Foto-foto
      digitalWallets: true, // Rekening angpao
      guestBooks: {
        orderBy: { createdAt: 'desc' },
        take: 20, // Batasi 20 ucapan terbaru
      },
    },
  });

  // Jika tidak ditemukan atau tidak aktif, tampilkan 404
  if (!invitation) return error('Undangan tidak ditemukan', 404);
  if (!invitation.isActive) return error('Undangan tidak aktif', 403);

  return ok(invitation);
}
