// // app/api/upload/route.ts
// // POST /api/upload — Terima file foto, simpan ke public/uploads
// // Mengembalikan URL path yang bisa langsung disimpan ke tabel galleries

// import { NextRequest, NextResponse } from 'next/server';
// import { writeFile, mkdir } from 'fs/promises';
// import { join } from 'path';
// import { existsSync } from 'fs';

// export async function POST(req: NextRequest) {
//   try {
//     const formData = await req.formData();
//     const file = formData.get('file') as File;

//     if (!file) {
//       return NextResponse.json({ success: false, message: 'File tidak ditemukan' }, { status: 400 });
//     }

//     // Validasi tipe file — hanya gambar
//     const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
//     if (!allowedTypes.includes(file.type)) {
//       return NextResponse.json({ success: false, message: 'Hanya file gambar yang diizinkan (jpg, png, webp, gif)' }, { status: 400 });
//     }

//     // Validasi ukuran — maksimal 5MB
//     const maxSize = 5 * 1024 * 1024;
//     if (file.size > maxSize) {
//       return NextResponse.json({ success: false, message: 'Ukuran file maksimal 5MB' }, { status: 400 });
//     }

//     // Buat nama file unik — timestamp + nama asli (tanpa spasi)
//     const timestamp = Date.now();
//     const originalName = file.name.replace(/\s+/g, '-').toLowerCase();
//     const fileName = `${timestamp}-${originalName}`;

//     // Pastikan folder uploads ada
//     const uploadDir = join(process.cwd(), 'public', 'uploads');
//     if (!existsSync(uploadDir)) {
//       await mkdir(uploadDir, { recursive: true });
//     }

//     // Simpan file ke disk
//     const bytes = await file.arrayBuffer();
//     const buffer = Buffer.from(bytes);
//     await writeFile(join(uploadDir, fileName), buffer);

//     // Return URL path yang bisa diakses dari browser
//     const url = `/uploads/${fileName}`;

//     return NextResponse.json({ success: true, data: { url, fileName } }, { status: 201 });
//   } catch (err) {
//     console.error('Upload error:', err);
//     return NextResponse.json({ success: false, message: 'Gagal mengupload file' }, { status: 500 });
//   }
// }

// app/api/upload/route.ts
// POST /api/upload — Upload file ke Cloudinary
// Mengembalikan URL Cloudinary yang bisa langsung disimpan ke tabel galleries

import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ success: false, message: 'File tidak ditemukan' }, { status: 400 });
    }

    // Validasi tipe file
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ success: false, message: 'Hanya file gambar yang diizinkan (jpg, png, webp, gif)' }, { status: 400 });
    }

    // Validasi ukuran — maksimal 10MB
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json({ success: false, message: 'Ukuran file maksimal 10MB' }, { status: 400 });
    }

    // Convert ke base64 dan upload ke Cloudinary
    const buffer = Buffer.from(await file.arrayBuffer());
    const base64 = buffer.toString('base64');
    const dataUri = `data:${file.type};base64,${base64}`;

    const result = await cloudinary.uploader.upload(dataUri, {
      folder: 'undangan-digital/galleries',
      resource_type: 'image',
    });

    return NextResponse.json({ success: true, data: { url: result.secure_url, fileName: result.public_id } }, { status: 201 });
  } catch (err) {
    console.error('Upload error:', err);
    return NextResponse.json({ success: false, message: 'Gagal mengupload file' }, { status: 500 });
  }
}
