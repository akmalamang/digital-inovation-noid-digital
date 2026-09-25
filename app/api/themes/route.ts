// import { NextRequest } from 'next/server';
// import { writeFile, mkdir } from 'fs/promises';
// import path from 'path';
// import { randomUUID } from 'crypto';

// import { prisma } from '@/lib/prisma';
// import { ok, error } from '@/lib/response';
// import { requireAdmin } from '@/lib/session';

// const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm', 'video/quicktime'];

// const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB

// // GET terbuka — dipakai halaman publik undangan
// export async function GET() {
//   const themes = await prisma.theme.findMany({
//     orderBy: { id: 'asc' },
//   });

//   return ok(themes);
// }

// // POST — hanya admin
// export async function POST(req: NextRequest) {
//   const session = await requireAdmin();

//   if (session instanceof Response) {
//     return session;
//   }

//   try {
//     const formData = await req.formData();

//     const themeName = formData.get('themeName');
//     const folderPath = formData.get('folderPath');

//     const files = formData.getAll('files');

//     // =========================
//     // VALIDASI DATA
//     // =========================

//     if (typeof themeName !== 'string' || !themeName.trim()) {
//       return error('themeName wajib diisi');
//     }

//     if (typeof folderPath !== 'string' || !folderPath.trim()) {
//       return error('folderPath wajib diisi');
//     }

//     if (files.length === 0) {
//       return error('Minimal upload 1 file');
//     }

//     // =========================
//     // FOLDER UPLOAD
//     // =========================

//     const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'themes');

//     await mkdir(uploadDir, {
//       recursive: true,
//     });

//     // =========================
//     // UPLOAD FILE
//     // =========================

//     const media: {
//       url: string;
//       type: 'image' | 'video';
//     }[] = [];

//     for (const file of files) {
//       if (!(file instanceof File)) {
//         continue;
//       }

//       // Validasi MIME type
//       if (!ALLOWED_TYPES.includes(file.type)) {
//         return error(`Format file tidak didukung: ${file.name}`);
//       }

//       // Validasi ukuran
//       if (file.size > MAX_FILE_SIZE) {
//         return error(`File terlalu besar: ${file.name}. Maksimal 50 MB`);
//       }

//       const extension = path.extname(file.name);

//       const filename = `${randomUUID()}${extension}`;

//       const filePath = path.join(uploadDir, filename);

//       const buffer = Buffer.from(await file.arrayBuffer());

//       await writeFile(filePath, buffer);

//       const fileUrl = `/uploads/themes/${filename}`;

//       const type = file.type.startsWith('video/') ? 'video' : 'image';

//       media.push({
//         url: fileUrl,
//         type,
//       });
//     }

//     // =========================
//     // VALIDASI HASIL UPLOAD
//     // =========================

//     if (media.length === 0) {
//       return error('Tidak ada file yang berhasil diupload');
//     }

//     // =========================
//     // THUMBNAIL UTAMA
//     // =========================

//     const thumbnail = media[0].url;

//     // =========================
//     // SIMPAN DATABASE
//     // =========================

//     const theme = await prisma.theme.create({
//       data: {
//         themeName: themeName.trim(),
//         folderPath: folderPath.trim(),
//         thumbnail,
//         thumbnails: JSON.stringify(media),
//       },
//     });

//     return ok(theme, 201);
//   } catch (err) {
//     console.error('POST /api/themes error:', err);

//     return error('Gagal membuat theme');
//   }
// }

// import { NextRequest } from 'next/server';
// import { v2 as cloudinary } from 'cloudinary';
// import { prisma } from '@/lib/prisma';
// import { ok, error } from '@/lib/response';
// import { requireAdmin } from '@/lib/session';

// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });

// const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
// const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB per file

// export async function GET() {
//   const themes = await prisma.theme.findMany({ orderBy: { id: 'asc' } });
//   return ok(themes);
// }

// export async function POST(req: NextRequest) {
//   const session = await requireAdmin();
//   if (session instanceof Response) return session;

//   try {
//     const formData = await req.formData();
//     const themeName = formData.get('themeName');
//     const folderPath = formData.get('folderPath');
//     const files = formData.getAll('files');

//     if (typeof themeName !== 'string' || !themeName.trim()) return error('themeName wajib diisi');
//     if (typeof folderPath !== 'string' || !folderPath.trim()) return error('folderPath wajib diisi');
//     if (files.length === 0) return error('Minimal upload 1 file');

//     const media: { url: string; type: 'image' | 'video' }[] = [];

//     for (const file of files) {
//       if (!(file instanceof File)) continue;

//       if (!ALLOWED_TYPES.includes(file.type)) return error(`Format tidak didukung: ${file.name}`);
//       if (file.size > MAX_FILE_SIZE) return error(`File terlalu besar: ${file.name}. Maks 10MB`);

//       // Convert file ke base64 untuk Cloudinary
//       const buffer = Buffer.from(await file.arrayBuffer());
//       const base64 = buffer.toString('base64');
//       const dataUri = `data:${file.type};base64,${base64}`;

//       // Upload ke Cloudinary
//       const result = await cloudinary.uploader.upload(dataUri, {
//         folder: `undangan-digital/themes`,
//         resource_type: 'image',
//       });

//       media.push({ url: result.secure_url, type: 'image' });
//     }

//     if (media.length === 0) return error('Tidak ada file yang berhasil diupload');

//     const theme = await prisma.theme.create({
//       data: {
//         themeName: themeName.trim(),
//         folderPath: folderPath.trim(),
//         thumbnail: media[0].url,
//         thumbnails: JSON.stringify(media.map((m) => m.url)),
//       },
//     });

//     return ok(theme, 201);
//   } catch (err) {
//     console.error('POST /api/themes error:', err);
//     console.error('Error detail:', JSON.stringify(err, null, 2));
//     return error('Gagal membuat theme');
//   }
// }

import { NextRequest } from 'next/server';

import { v2 as cloudinary } from 'cloudinary';

import { prisma } from '@/lib/prisma';

import { ok, error } from '@/lib/response';

import { requireAdmin } from '@/lib/session';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB per file

// GET terbuka — dipakai halaman publik undangan
export async function GET() {
  const themes = await prisma.theme.findMany({
    orderBy: {
      id: 'asc',
    },
  });

  return ok(themes);
}

// POST — hanya admin
export async function POST(req: NextRequest) {
  const session = await requireAdmin();

  if (session instanceof Response) {
    return session;
  }

  try {
    const formData = await req.formData();

    const themeName = formData.get('themeName');
    const folderPath = formData.get('folderPath');
    const files = formData.getAll('files');

    // =========================
    // VALIDASI DATA
    // =========================

    if (typeof themeName !== 'string' || !themeName.trim()) {
      return error('themeName wajib diisi');
    }

    if (typeof folderPath !== 'string' || !folderPath.trim()) {
      return error('folderPath wajib diisi');
    }

    if (files.length === 0) {
      return error('Minimal upload 1 file');
    }

    // =========================
    // MEDIA
    // =========================

    const media: {
      url: string;
      type: 'image' | 'video';
    }[] = [];

    // =========================
    // UPLOAD KE CLOUDINARY
    // =========================

    for (const file of files) {
      if (!(file instanceof File)) {
        continue;
      }

      // Validasi tipe file
      if (!ALLOWED_TYPES.includes(file.type)) {
        return error(`Format tidak didukung: ${file.name}`);
      }

      // Validasi ukuran
      if (file.size > MAX_FILE_SIZE) {
        return error(`File terlalu besar: ${file.name}. Maks 10MB`);
      }

      // =========================
      // FILE → BUFFER
      // =========================

      const buffer = Buffer.from(await file.arrayBuffer());

      // =========================
      // BUFFER → BASE64
      // =========================

      const base64 = buffer.toString('base64');

      const dataUri = `data:${file.type};base64,${base64}`;

      // =========================
      // CLOUDINARY
      // =========================

      const result = await cloudinary.uploader.upload(dataUri, {
        folder: 'undangan-digital/themes',
        resource_type: 'image',
      });

      // =========================
      // SIMPAN URL
      // =========================

      media.push({
        url: result.secure_url,
        type: 'image',
      });
    }

    // =========================
    // VALIDASI HASIL
    // =========================

    if (media.length === 0) {
      return error('Tidak ada file yang berhasil diupload');
    }

    // =========================
    // SIMPAN DATABASE
    // =========================

    const theme = await prisma.theme.create({
      data: {
        themeName: themeName.trim(),

        folderPath: folderPath.trim(),

        // File pertama menjadi thumbnail
        thumbnail: media[0].url,

        // Simpan URL + type
        thumbnails: JSON.stringify(media),
      },
    });

    return ok(theme, 201);
  } catch (err) {
    console.error('POST /api/themes error:', err);

    return error(err instanceof Error ? err.message : 'Gagal membuat theme');
  }
}
