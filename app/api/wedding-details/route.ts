// app/api/wedding-details/route.ts
// POST /api/wedding-details  — Buat detail pernikahan baru untuk sebuah undangan

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ok, error } from '@/lib/response';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    invitationId,
    bridegroomName,
    bridegroomShortName,
    bridegroomParent,
    brideName,
    brideShortName,
    brideParent,
    akadDate,
    akadTime,
    akadLocation,
    akadMapsUrl,
    receptionDate,
    receptionTime,
    receptionLocation,
    receptionMapsUrl,
    loveStory,
    liveStreamingUrl,
  } = body;

  // Validasi field wajib
  if (!invitationId || !bridegroomName || !brideName || !akadDate || !receptionDate) {
    return error('Field wajib belum lengkap');
  }

  // Cek apakah wedding detail sudah ada untuk undangan ini
  const existing = await prisma.weddingDetail.findUnique({ where: { invitationId } });
  if (existing) return error('Detail pernikahan sudah ada. Gunakan PUT untuk update.', 409);

  const detail = await prisma.weddingDetail.create({
    data: {
      invitationId,
      bridegroomName,
      bridegroomShortName,
      bridegroomParent,
      brideName,
      brideShortName,
      brideParent,
      akadDate: new Date(akadDate),
      akadTime: akadTime, // Format: "09:00:00"
      akadLocation,
      akadMapsUrl,
      receptionDate: new Date(receptionDate),
      receptionTime: receptionTime,
      receptionLocation,
      receptionMapsUrl,
      loveStory,
      liveStreamingUrl,
    },
  });

  return ok(detail, 201);
}
