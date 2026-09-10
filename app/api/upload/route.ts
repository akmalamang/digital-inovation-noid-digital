// app/api/upload/route.ts
// POST /api/upload — Terima file foto, simpan ke public/uploads
// Mengembalikan URL path yang bisa langsung disimpan ke tabel galleries

import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ success: false, message: 'File tidak ditemukan' }, { status: 400 });
    }

    // Validasi tipe file — hanya gambar
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ success: false, message: 'Hanya file gambar yang diizinkan (jpg, png, webp, gif)' }, { status: 400 });
    }

    // Validasi ukuran — maksimal 5MB
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json({ success: false, message: 'Ukuran file maksimal 5MB' }, { status: 400 });
    }

    // Buat nama file unik — timestamp + nama asli (tanpa spasi)
    const timestamp = Date.now();
    const originalName = file.name.replace(/\s+/g, '-').toLowerCase();
    const fileName = `${timestamp}-${originalName}`;

    // Pastikan folder uploads ada
    const uploadDir = join(process.cwd(), 'public', 'uploads');
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Simpan file ke disk
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(join(uploadDir, fileName), buffer);

    // Return URL path yang bisa diakses dari browser
    const url = `/uploads/${fileName}`;

    return NextResponse.json({ success: true, data: { url, fileName } }, { status: 201 });
  } catch (err) {
    console.error('Upload error:', err);
    return NextResponse.json({ success: false, message: 'Gagal mengupload file' }, { status: 500 });
  }
}
