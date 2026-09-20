import { NextRequest } from 'next/server';
import { mkdir, writeFile, unlink } from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';

import { prisma } from '@/lib/prisma';
import { ok, error } from '@/lib/response';
import { requireAdmin } from '@/lib/session';

type Params = {
  params: Promise<{ id: string }>;
};

type MediaItem = {
  url: string;
  type: 'image' | 'video';
};

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm', 'video/quicktime'];

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB

function getMediaType(mimeType: string): 'image' | 'video' {
  return mimeType.startsWith('video/') ? 'video' : 'image';
}

function getExtension(fileName: string, mimeType: string) {
  const originalExt = path.extname(fileName);

  if (originalExt) {
    return originalExt.toLowerCase();
  }

  const mimeMap: Record<string, string> = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
    'image/gif': '.gif',
    'video/mp4': '.mp4',
    'video/webm': '.webm',
    'video/quicktime': '.mov',
  };

  return mimeMap[mimeType] ?? '';
}

async function deleteUploadedFile(url: string) {
  try {
    // Hanya hapus file yang berasal dari folder upload kita
    if (!url.startsWith('/uploads/themes/')) {
      return;
    }

    const filePath = path.join(process.cwd(), 'public', url);

    await unlink(filePath);
  } catch {
    // File mungkin sudah tidak ada.
    // Jangan membuat proses utama gagal.
  }
}

export async function GET(_: NextRequest, { params }: Params) {
  const { id } = await params;

  const themeId = Number(id);

  if (!Number.isInteger(themeId)) {
    return error('ID tema tidak valid', 400);
  }

  const theme = await prisma.theme.findUnique({
    where: { id: themeId },
  });

  if (!theme) {
    return error('Tema tidak ditemukan', 404);
  }

  return ok(theme);
}

export async function PUT(req: NextRequest, { params }: Params) {
  const session = await requireAdmin();

  if (session instanceof Response) {
    return session;
  }

  const { id } = await params;

  const themeId = Number(id);

  if (!Number.isInteger(themeId)) {
    return error('ID tema tidak valid', 400);
  }

  try {
    // =========================
    // CARI TEMA
    // =========================

    const existingTheme = await prisma.theme.findUnique({
      where: { id: themeId },
    });

    if (!existingTheme) {
      return error('Tema tidak ditemukan', 404);
    }

    // =========================
    // PARSE FORM DATA
    // =========================

    const formData = await req.formData();

    const themeName = formData.get('themeName');
    const folderPath = formData.get('folderPath');
    const existingMediaRaw = formData.get('existingMedia');

    // =========================
    // VALIDASI TEXT
    // =========================

    if (typeof themeName !== 'string' || !themeName.trim()) {
      return error('Nama tema wajib diisi', 400);
    }

    if (typeof folderPath !== 'string' || !folderPath.trim()) {
      return error('Folder path wajib diisi', 400);
    }

    // =========================
    // PARSE MEDIA LAMA
    // =========================

    let existingMedia: MediaItem[] = [];

    if (typeof existingMediaRaw === 'string') {
      try {
        const parsed = JSON.parse(existingMediaRaw);

        if (Array.isArray(parsed)) {
          existingMedia = parsed.filter((item): item is MediaItem => item && typeof item.url === 'string' && (item.type === 'image' || item.type === 'video'));
        }
      } catch {
        return error('Format existingMedia tidak valid', 400);
      }
    }

    // =========================
    // AMBIL FILE BARU
    // =========================

    const files = formData.getAll('files').filter((item): item is File => item instanceof File);

    // =========================
    // VALIDASI SEMUA FILE
    // SEBELUM MENULIS KE DISK
    // =========================

    for (const file of files) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        return error(`Format file tidak didukung: ${file.name}`, 400);
      }

      if (file.size > MAX_FILE_SIZE) {
        return error(`File terlalu besar: ${file.name}. Maksimal 50MB`, 400);
      }
    }

    // =========================
    // FOLDER UPLOAD
    // =========================

    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'themes');

    await mkdir(uploadDir, {
      recursive: true,
    });

    // =========================
    // UPLOAD FILE BARU
    // =========================

    const newMedia: MediaItem[] = [];

    for (const file of files) {
      const extension = getExtension(file.name, file.type);

      const fileName = `${randomUUID()}${extension}`;

      const filePath = path.join(uploadDir, fileName);

      const buffer = Buffer.from(await file.arrayBuffer());

      await writeFile(filePath, buffer);

      newMedia.push({
        url: `/uploads/themes/${fileName}`,
        type: getMediaType(file.type),
      });
    }

    // =========================
    // GABUNG MEDIA LAMA + BARU
    // =========================

    const finalMedia: MediaItem[] = [...existingMedia, ...newMedia];

    // =========================
    // CARI MEDIA YANG DIHAPUS
    // =========================

    let oldMedia: MediaItem[] = [];

    if (existingTheme.thumbnails) {
      try {
        const parsed = JSON.parse(existingTheme.thumbnails);

        if (Array.isArray(parsed)) {
          oldMedia = parsed
            .map((item) => {
              if (typeof item === 'string') {
                return {
                  url: item,
                  type: item.match(/\.(mp4|webm|mov|m4v|avi)$/i) ? 'video' : 'image',
                };
              }

              return item;
            })
            .filter((item): item is MediaItem => item && typeof item.url === 'string');
        }
      } catch {
        oldMedia = [];
      }
    }

    const finalUrls = new Set(finalMedia.map((item) => item.url));

    const deletedMedia = oldMedia.filter((item) => !finalUrls.has(item.url));

    // =========================
    // HAPUS FILE MEDIA LAMA
    // =========================

    for (const media of deletedMedia) {
      await deleteUploadedFile(media.url);
    }

    // =========================
    // THUMBNAIL UTAMA
    // =========================

    const thumbnail = finalMedia.length > 0 ? finalMedia[0].url : '';

    // =========================
    // UPDATE DATABASE
    // =========================

    const theme = await prisma.theme.update({
      where: { id: themeId },

      data: {
        themeName: themeName.trim(),
        folderPath: folderPath.trim(),
        thumbnail,
        thumbnails: JSON.stringify(finalMedia),
      },
    });

    return ok(theme);
  } catch (err) {
    console.error('PUT /api/themes/[id] error:', err);

    return error('Gagal memperbarui tema', 500);
  }
}

export async function DELETE(_: NextRequest, { params }: Params) {
  const session = await requireAdmin();

  if (session instanceof Response) {
    return session;
  }

  const { id } = await params;

  const themeId = Number(id);

  if (!Number.isInteger(themeId)) {
    return error('ID tema tidak valid', 400);
  }

  try {
    const theme = await prisma.theme.findUnique({
      where: { id: themeId },
    });

    if (!theme) {
      return error('Tema tidak ditemukan', 404);
    }

    // =========================
    // HAPUS MEDIA
    // =========================

    let media: MediaItem[] = [];

    if (theme.thumbnails) {
      try {
        const parsed = JSON.parse(theme.thumbnails);

        if (Array.isArray(parsed)) {
          media = parsed.map((item) => {
            if (typeof item === 'string') {
              return {
                url: item,
                type: item.match(/\.(mp4|webm|mov|m4v|avi)$/i) ? 'video' : 'image',
              };
            }

            return item;
          });
        }
      } catch {
        media = [];
      }
    }

    for (const item of media) {
      await deleteUploadedFile(item.url);
    }

    // =========================
    // HAPUS DATABASE
    // =========================

    await prisma.theme.delete({
      where: { id: themeId },
    });

    return ok({
      message: 'Tema berhasil dihapus',
    });
  } catch (err) {
    console.error('DELETE /api/themes/[id] error:', err);

    return error('Gagal menghapus tema', 500);
  }
}
