'use client';
// components/ImageUploader.tsx
// Komponen upload foto — drag & drop, preview, bisa multi-file
// Dipakai di dashboard client dan admin panel

import { useRef, useState } from 'react';

type UploadedFile = {
  url: string;
  fileName: string;
  preview: string; // Object URL untuk preview lokal
};

type Props = {
  onUploaded: (url: string) => void; // Callback setelah upload berhasil
  maxFiles?: number;
  accept?: string;
};

export default function ImageUploader({ onUploaded, maxFiles = 10, accept = 'image/*' }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [uploads, setUploads] = useState<(UploadedFile & { status: 'uploading' | 'done' | 'error' })[]>([]);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files).slice(0, maxFiles);

    for (const file of fileArray) {
      // Buat preview lokal sebelum upload
      const preview = URL.createObjectURL(file);
      const tempId = `${Date.now()}-${file.name}`;

      // Tambah ke list dengan status uploading
      setUploads((prev) => [...prev, { url: '', fileName: file.name, preview, status: 'uploading' }]);

      try {
        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch('/api/upload', { method: 'POST', body: formData });
        const data = await res.json();

        if (res.ok && data.success) {
          // Update status jadi done + simpan URL server
          setUploads((prev) => prev.map((u) => (u.preview === preview ? { ...u, url: data.data.url, fileName: data.data.fileName, status: 'done' } : u)));
          onUploaded(data.data.url); // Panggil callback dengan URL hasil upload
        } else {
          setUploads((prev) => prev.map((u) => (u.preview === preview ? { ...u, status: 'error' } : u)));
        }
      } catch {
        setUploads((prev) => prev.map((u) => (u.preview === preview ? { ...u, status: 'error' } : u)));
      }
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  }

  function handleRemove(preview: string) {
    setUploads((prev) => prev.filter((u) => u.preview !== preview));
    URL.revokeObjectURL(preview);
  }

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${dragging ? 'border-violet-400 bg-violet-50' : 'border-slate-200 hover:border-violet-300 hover:bg-slate-50'}`}
      >
        <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
          </svg>
        </div>
        <p className="text-sm font-medium text-slate-700">{dragging ? 'Lepaskan file di sini' : 'Klik atau drag & drop foto'}</p>
        <p className="text-xs text-slate-400 mt-1">JPG, PNG, WebP — Maks. 5MB per file</p>

        <input ref={inputRef} type="file" accept={accept} multiple={maxFiles > 1} className="hidden" onChange={(e) => handleFiles(e.target.files)} />
      </div>

      {/* Preview grid */}
      {uploads.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {uploads.map((u) => (
            <div key={u.preview} className="relative aspect-square rounded-lg overflow-hidden bg-slate-100 group">
              <img src={u.preview} alt="" className="w-full h-full object-cover" />

              {/* Overlay status */}
              {u.status === 'uploading' && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                </div>
              )}
              {u.status === 'error' && (
                <div className="absolute inset-0 bg-red-500/70 flex items-center justify-center">
                  <p className="text-white text-xs font-medium">Gagal</p>
                </div>
              )}
              {u.status === 'done' && (
                <div className="absolute top-1.5 right-1.5">
                  <span className="bg-emerald-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">✓</span>
                </div>
              )}

              {/* Tombol hapus dari preview (tidak hapus dari server) */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove(u.preview);
                }}
                className="absolute bottom-1.5 right-1.5 bg-black/60 text-white text-xs w-5 h-5 rounded-full hidden group-hover:flex items-center justify-center"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
