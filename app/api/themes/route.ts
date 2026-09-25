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

const ALLOWED_TYPES = [
  // Image
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',

  // Video
  'video/mp4',
  'video/webm',
  'video/quicktime',
];

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB per file

export async function GET() {
  const themes = await prisma.theme.findMany({
    orderBy: { id: 'asc' },
  });

  return ok(themes);
}

// export async function POST(req: NextRequest) {
//   const session = await requireAdmin();

//   if (session instanceof Response) return session;

//   try {
//     const formData = await req.formData();

//     const themeName = formData.get('themeName');
//     const folderPath = formData.get('folderPath');
//     const files = formData.getAll('files');

//     if (typeof themeName !== 'string' || !themeName.trim()) {
//       return error('themeName wajib diisi');
//     }

//     if (typeof folderPath !== 'string' || !folderPath.trim()) {
//       return error('folderPath wajib diisi');
//     }

//     if (files.length === 0) {
//       return error('Minimal upload 1 file');
//     }

//     const media: {
//       url: string;
//       type: 'image' | 'video';
//     }[] = [];

//     for (const file of files) {
//       if (!(file instanceof File)) continue;

//       // Validasi tipe file
//       if (!ALLOWED_TYPES.includes(file.type)) {
//         return error(`Format tidak didukung: ${file.name}. Gunakan JPG, PNG, WEBP, GIF, MP4, WEBM, atau MOV.`);
//       }

//       // Validasi ukuran
//       if (file.size > MAX_FILE_SIZE) {
//         return error(`File terlalu besar: ${file.name}. Maksimal 50MB per file.`);
//       }

//       // Tentukan tipe media
//       const mediaType: 'image' | 'video' = file.type.startsWith('video/') ? 'video' : 'image';

//       // Convert file ke base64
//       const buffer = Buffer.from(await file.arrayBuffer());

//       const base64 = buffer.toString('base64');

//       const dataUri = `data:${file.type};base64,${base64}`;

//       // Upload ke Cloudinary
//       const result = await cloudinary.uploader.upload(dataUri, {
//         folder: 'undangan-digital/themes',
//         resource_type: mediaType,
//       });

//       media.push({
//         url: result.secure_url,
//         type: mediaType,
//       });
//     }

//     if (media.length === 0) {
//       return error('Tidak ada file yang berhasil diupload');
//     }

//     // File pertama dijadikan thumbnail utama
//     const theme = await prisma.theme.create({
//       data: {
//         themeName: themeName.trim(),
//         folderPath: folderPath.trim(),
//         thumbnail: media[0].url,

//         // Simpan URL + type
//         thumbnails: JSON.stringify(media),
//       },
//     });

//     return ok(theme, 201);
//   } catch (err) {
//     console.error('POST /api/themes error:', err);

//     return error('Gagal membuat theme');
//   }
// }

export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (session instanceof Response) return session;

  try {
    const body = await req.json();
    const { themeName, folderPath, thumbnail, thumbnails } = body;

    if (!themeName?.trim()) return error('themeName wajib diisi');
    if (!folderPath?.trim()) return error('folderPath wajib diisi');
    if (!thumbnail) return error('Minimal 1 gambar');

    const theme = await prisma.theme.create({
      data: {
        themeName: themeName.trim(),
        folderPath: folderPath.trim(),
        thumbnail,
        thumbnails: thumbnails ?? JSON.stringify([thumbnail]),
      },
    });

    return ok(theme, 201);
  } catch (err) {
    console.error('POST /api/themes error:', err);
    return error('Gagal membuat theme');
  }
}
