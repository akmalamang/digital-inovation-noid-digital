// app/api/guest-books/route.ts
// GET  /api/guest-books?invitationId=1  — Ambil ucapan (dipakai di halaman undangan publik)
// POST /api/guest-books                 — Tamu kirim ucapan & RSVP

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ok, error } from '@/lib/response';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const invitationId = searchParams.get('invitationId');

  if (!invitationId) return error('invitationId wajib diisi');

  const guestBooks = await prisma.guestBook.findMany({
    where: { invitationId: Number(invitationId) },
    orderBy: { createdAt: 'desc' },
  });

  return ok(guestBooks);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { invitationId, guestName, rsvp, wishes } = body;

  if (!invitationId || !guestName || !rsvp || !wishes) {
    return error('Semua field wajib diisi');
  }

  const validRsvp = ['hadir', 'tidak_hadir', 'ragu_ragu'];
  if (!validRsvp.includes(rsvp)) {
    return error(`rsvp harus salah satu dari: ${validRsvp.join(', ')}`);
  }

  // Pastikan undangan aktif sebelum menerima ucapan
  const invitation = await prisma.invitation.findUnique({
    where: { id: Number(invitationId) },
    select: { isActive: true },
  });

  if (!invitation) return error('Undangan tidak ditemukan', 404);
  if (!invitation.isActive) return error('Undangan tidak aktif', 403);

  const entry = await prisma.guestBook.create({
    data: { invitationId, guestName, rsvp, wishes },
  });

  return ok(entry, 201);
}
