// app/api/analytics/route.ts
// GET /api/analytics — Data untuk grafik admin analytics
// Mengembalikan: undangan per bulan, RSVP stats, ucapan per hari

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ok } from '@/lib/response';
import { requireAdmin } from '@/lib/session';

export async function GET(req: NextRequest) {
  const session = await requireAdmin();
  if (session instanceof Response) return session;

  const now = new Date();
  const year = now.getFullYear();

  // ── 1. Undangan baru per bulan (tahun ini) ────────────────────────────────
  const invitations = await prisma.invitation.findMany({
    where: {
      createdAt: {
        gte: new Date(`${year}-01-01`),
        lte: new Date(`${year}-12-31`),
      },
    },
    select: { createdAt: true },
  });

  // Group per bulan
  const invPerMonth = Array.from({ length: 12 }, (_, i) => ({
    bulan: new Date(year, i).toLocaleDateString('id-ID', { month: 'short' }),
    total: 0,
  }));
  invitations.forEach((inv) => {
    const month = new Date(inv.createdAt).getMonth();
    invPerMonth[month].total++;
  });

  // ── 2. Statistik RSVP ─────────────────────────────────────────────────────
  const [hadir, tidakHadir, raguRagu] = await Promise.all([prisma.guestBook.count({ where: { rsvp: 'hadir' } }), prisma.guestBook.count({ where: { rsvp: 'tidak_hadir' } }), prisma.guestBook.count({ where: { rsvp: 'ragu_ragu' } })]);

  const rsvpStats = [
    { label: 'Hadir', value: hadir, color: '#10b981' },
    { label: 'Tidak Hadir', value: tidakHadir, color: '#ef4444' },
    { label: 'Ragu-ragu', value: raguRagu, color: '#f59e0b' },
  ];

  // ── 3. Ucapan tamu per hari (30 hari terakhir) ────────────────────────────
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);

  const guestBooks = await prisma.guestBook.findMany({
    where: { createdAt: { gte: thirtyDaysAgo } },
    select: { createdAt: true },
    orderBy: { createdAt: 'asc' },
  });

  // Buat array 30 hari
  const ucapanPerHari = Array.from({ length: 30 }, (_, i) => {
    const date = new Date(thirtyDaysAgo);
    date.setDate(date.getDate() + i);
    return {
      tanggal: date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
      total: 0,
    };
  });

  guestBooks.forEach((gb) => {
    const gbDate = new Date(gb.createdAt);
    const diffDays = Math.floor((gbDate.getTime() - thirtyDaysAgo.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays >= 0 && diffDays < 30) {
      ucapanPerHari[diffDays].total++;
    }
  });

  // ── 4. Summary stats ──────────────────────────────────────────────────────
  const [totalUsers, totalInvitations, totalThemes, totalGuestBooks] = await Promise.all([prisma.user.count(), prisma.invitation.count(), prisma.theme.count(), prisma.guestBook.count()]);

  return ok({
    invPerMonth,
    rsvpStats,
    ucapanPerHari,
    summary: {
      totalUsers,
      totalInvitations,
      totalThemes,
      totalGuestBooks,
      totalHadir: hadir,
    },
  });
}
