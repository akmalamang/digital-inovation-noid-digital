'use client';
// components/admin/InvitationActions.tsx
// Tombol aksi per baris undangan: Edit detail, Toggle aktif/nonaktif, Hapus

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';

type Props = { id: number; slug: string; isActive: boolean };

export default function InvitationActions({ id, slug, isActive }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Toggle aktif/nonaktif undangan
  async function handleToggle() {
    setLoading(true);
    await fetch(`/api/invitations/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !isActive }),
    });
    router.refresh(); // Re-fetch data Server Component
    setLoading(false);
  }

  // Hapus undangan (dengan konfirmasi)
  async function handleDelete() {
    if (!confirm(`Hapus undangan "${slug}"? Semua data terkait akan ikut terhapus.`)) return;
    setLoading(true);
    await fetch(`/api/invitations/${id}`, { method: 'DELETE' });
    router.refresh();
    setLoading(false);
  }

  return (
    <div className="flex items-center gap-2">
      {/* Edit detail pernikahan */}
      <Link href={`/admin/invitations/${id}/edit`} className="p-1.5 text-slate-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-colors" title="Edit">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      </Link>

      {/* Toggle aktif/nonaktif */}
      <button
        onClick={handleToggle}
        disabled={loading}
        className={`p-1.5 rounded-lg transition-colors ${isActive ? 'text-emerald-500 hover:text-slate-400 hover:bg-slate-100' : 'text-slate-400 hover:text-emerald-500 hover:bg-emerald-50'}`}
        title={isActive ? 'Nonaktifkan' : 'Aktifkan'}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      </button>

      {/* Hapus */}
      <button onClick={handleDelete} disabled={loading} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Hapus">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </div>
  );
}
