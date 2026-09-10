import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ok, error } from '@/lib/response';
import { requireAdmin } from '@/lib/session';

// GET terbuka — dipakai halaman publik undangan
export async function GET() {
  const themes = await prisma.theme.findMany({ orderBy: { id: 'asc' } });
  return ok(themes);
}

export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (session instanceof Response) return session;

  const body = await req.json();
  const { themeName, folderPath, thumbnail } = body;

  if (!themeName || !folderPath || !thumbnail) {
    return error('themeName, folderPath, dan thumbnail wajib diisi');
  }

  const theme = await prisma.theme.create({ data: { themeName, folderPath, thumbnail } });
  return ok(theme, 201);
}
