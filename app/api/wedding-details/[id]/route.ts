import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ok, error } from '@/lib/response';

type Params = { params: Promise<{ id: string }> };

export async function GET(_: NextRequest, { params }: Params) {
  const { id } = await params;
  const detail = await prisma.weddingDetail.findUnique({
    where: { id: Number(id) },
  });
  if (!detail) return error('Detail tidak ditemukan', 404);
  return ok(detail);
}

export async function PUT(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const body = await req.json();

  const data: Record<string, unknown> = { ...body };

  // Konversi tanggal, biarkan waktu tetap string
  if (body.akadDate) data.akadDate = new Date(body.akadDate);
  if (body.receptionDate) data.receptionDate = new Date(body.receptionDate);
  if (body.akadTime) data.akadTime = body.akadTime;
  if (body.receptionTime) data.receptionTime = body.receptionTime;

  const detail = await prisma.weddingDetail.update({
    where: { id: Number(id) },
    data,
  });

  return ok(detail);
}

export async function DELETE(_: NextRequest, { params }: Params) {
  const { id } = await params;
  await prisma.weddingDetail.delete({ where: { id: Number(id) } });
  return ok({ message: 'Detail berhasil dihapus' });
}
