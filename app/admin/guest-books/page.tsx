'use client';
// app/admin/guest-books/page.tsx
// Manajemen buku tamu — tampilkan ucapan dari semua undangan, bisa filter & hapus

import * as XLSX from 'xlsx';

import { useEffect, useState } from 'react';

type GuestBook = {
  id: number;
  guestName: string;
  rsvp: 'hadir' | 'tidak_hadir' | 'ragu_ragu';
  wishes: string;
  createdAt: Date;
  invitation: {
    slug: string;
    weddingDetail: { bridegroomShortName: string; brideShortName: string } | null;
  };
};

type Invitation = { id: number; slug: string };

// Label RSVP yang readable
const rsvpLabel: Record<string, { text: string; color: string }> = {
  hadir: { text: 'Hadir', color: 'bg-emerald-50 text-emerald-700' },
  tidak_hadir: { text: 'Tidak Hadir', color: 'bg-red-50 text-red-500' },
  ragu_ragu: { text: 'Ragu-ragu', color: 'bg-amber-50 text-amber-600' },
};

function DeleteModal({ guestName, onConfirm, onCancel, loading }: { guestName: string; onConfirm: () => void; onCancel: () => void; loading: boolean }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Icon */}
        <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </div>

        {/* Text */}
        <h3 className="text-center font-semibold text-slate-800 text-lg mb-1">Hapus Ucapan?</h3>
        <p className="text-center text-slate-500 text-sm mb-6">
          Ucapan dari <span className="font-medium text-slate-700">"{guestName}"</span> akan dihapus permanen dan tidak bisa dikembalikan.
        </p>

        {/* Buttons */}
        <div className="flex gap-3">
          <button onClick={onCancel} disabled={loading} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium py-2.5 rounded-xl text-sm transition-colors disabled:opacity-60">
            Batal
          </button>
          <button onClick={onConfirm} disabled={loading} className="flex-1 bg-red-500 hover:bg-red-600 text-white font-medium py-2.5 rounded-xl text-sm transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Menghapus...
              </>
            ) : (
              'Ya, Hapus'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function GuestBooksPage() {
  const [entries, setEntries] = useState<GuestBook[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterInvId, setFilterInvId] = useState('');
  const [filterRsvp, setFilterRsvp] = useState('');
  const [search, setSearch] = useState('');
  // Tambah state untuk modal
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; guestName: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [selected, setSelected] = useState<number[]>([]);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);

  async function fetchData() {
    setLoading(true);

    // Fetch semua undangan untuk dropdown filter
    const invRes = await fetch('/api/invitations');
    const invData = await invRes.json();
    setInvitations(invData.data ?? []);

    // Fetch guest books — jika ada filter invitationId, gunakan query param
    const url = filterInvId ? `/api/guest-books?invitationId=${filterInvId}` : '/api/guest-books/all'; // endpoint khusus admin (lihat catatan di bawah)

    const res = await fetch(url);
    const data = await res.json();
    setEntries(data.data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    fetchData();
  }, [filterInvId]);

  // Ganti fungsi handleDelete
  async function handleDelete(id: number, guestName: string) {
    setDeleteTarget({ id, guestName });
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    await fetch(`/api/guest-books/${deleteTarget.id}`, { method: 'DELETE' });
    setDeleting(false);
    setDeleteTarget(null);
    fetchData();
  }

  // Filter di sisi client — RSVP dan pencarian nama
  const filtered = entries.filter((e) => {
    const matchRsvp = !filterRsvp || e.rsvp === filterRsvp;
    const matchSearch = !search || e.guestName.toLowerCase().includes(search.toLowerCase());
    return matchRsvp && matchSearch;
  });

  // Hitung statistik RSVP
  const stats = {
    hadir: entries.filter((e) => e.rsvp === 'hadir').length,
    tidak_hadir: entries.filter((e) => e.rsvp === 'tidak_hadir').length,
    ragu_ragu: entries.filter((e) => e.rsvp === 'ragu_ragu').length,
  };

  function handleExport() {
    if (entries.length === 0) return;

    // Format data untuk Excel
    const data = entries.map((e) => ({
      'Nama Tamu': e.guestName,
      RSVP: rsvpLabel[e.rsvp]?.text ?? e.rsvp,
      Ucapan: e.wishes,
      Undangan: `/${e.invitation?.slug}`,
      Pasangan: e.invitation?.weddingDetail ? `${e.invitation.weddingDetail.bridegroomShortName} & ${e.invitation.weddingDetail.brideShortName}` : '-',
      Waktu: new Date(e.createdAt).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
    }));

    // Buat worksheet dan workbook
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Daftar Tamu');

    // Auto width kolom
    const colWidths = [
      { wch: 25 }, // Nama Tamu
      { wch: 15 }, // RSVP
      { wch: 50 }, // Ucapan
      { wch: 20 }, // Undangan
      { wch: 25 }, // Pasangan
      { wch: 25 }, // Waktu
    ];
    ws['!cols'] = colWidths;

    // Download file
    XLSX.writeFile(wb, `daftar-tamu-${new Date().toISOString().slice(0, 10)}.xlsx`);
  }

  function toggleSelect(id: number) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  }

  function toggleSelectAll() {
    if (selected.length === filtered.length) {
      setSelected([]);
    } else {
      setSelected(filtered.map((e) => e.id));
    }
  }

  async function handleBulkDelete() {
    setBulkDeleting(true);
    await Promise.all(selected.map((id) => fetch(`/api/guest-books/${id}`, { method: 'DELETE' })));
    setSelected([]);
    setBulkDeleting(false);
    setShowBulkModal(false);
    fetchData();
  }

  return (
    <div className="space-y-4">
      {/* Stat mini RSVP */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { key: 'hadir', label: 'Hadir', color: 'text-emerald-600 bg-emerald-50' },
          { key: 'tidak_hadir', label: 'Tidak Hadir', color: 'text-red-500 bg-red-50' },
          { key: 'ragu_ragu', label: 'Ragu-ragu', color: 'text-amber-600 bg-amber-50' },
        ].map(({ key, label, color }) => (
          <div key={key} className="bg-white rounded-xl border border-slate-200 px-5 py-4 flex items-center justify-between">
            <span className="text-sm text-slate-500">{label}</span>
            <span className={`text-xl font-bold rounded-lg px-2 py-0.5 ${color}`}>{stats[key as keyof typeof stats]}</span>
          </div>
        ))}
      </div>

      {/* Filter bar */}
      <div className="bg-white rounded-xl border border-slate-200 px-4 py-3 flex flex-wrap items-center gap-3">
        {/* Search nama tamu */}
        <div className="relative flex-1 min-w-48">
          <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Cari nama tamu..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
        </div>

        {/* Filter undangan */}
        <select value={filterInvId} onChange={(e) => setFilterInvId(e.target.value)} className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-violet-500">
          <option value="">Semua undangan</option>
          {invitations.map((inv) => (
            <option key={inv.id} value={inv.id}>
              /{inv.slug}
            </option>
          ))}
        </select>

        {/* Filter RSVP */}
        <select value={filterRsvp} onChange={(e) => setFilterRsvp(e.target.value)} className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-violet-500">
          <option value="">Semua RSVP</option>
          <option value="hadir">Hadir</option>
          <option value="tidak_hadir">Tidak Hadir</option>
          <option value="ragu_ragu">Ragu-ragu</option>
        </select>

        <span className="text-xs text-slate-400 ml-auto">{filtered.length} ucapan</span>
      </div>

      {/* Bulk action bar — muncul saat ada yang diseleksi */}
      {selected.length > 0 && (
        <div className="bg-violet-50 border border-violet-200 rounded-xl px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center">
              <span className="text-violet-700 font-bold text-sm">{selected.length}</span>
            </div>
            <p className="text-sm text-violet-700 font-medium">{selected.length} ucapan dipilih</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setSelected([])} className="text-xs text-violet-500 hover:text-violet-700 px-3 py-1.5 rounded-lg hover:bg-violet-100 transition-colors">
              Batal Pilih
            </button>
            <button onClick={() => setShowBulkModal(true)} className="flex items-center gap-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Hapus {selected.length} Ucapan
            </button>
          </div>
        </div>
      )}

      <button
        onClick={handleExport}
        disabled={filtered.length === 0}
        className="ml-auto flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors shrink-0"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        Export Excel
      </button>

      {/* Tabel ucapan */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-7 h-7 border-2 border-violet-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                {/* Checkbox select all */}
                <th className="px-4 py-3 w-10">
                  <input
                    type="checkbox"
                    checked={filtered.length > 0 && selected.length === filtered.length}
                    ref={(el) => {
                      if (el) el.indeterminate = selected.length > 0 && selected.length < filtered.length;
                    }}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-slate-300 text-violet-600 cursor-pointer"
                  />
                </th>
                <th className="text-left px-6 py-3 text-slate-400 font-medium">Tamu</th>
                <th className="text-left px-6 py-3 text-slate-400 font-medium">Undangan</th>
                <th className="text-left px-6 py-3 text-slate-400 font-medium">RSVP</th>
                <th className="text-left px-6 py-3 text-slate-400 font-medium">Ucapan</th>
                <th className="text-left px-6 py-3 text-slate-400 font-medium">Waktu</th>
                <th className="text-left px-6 py-3 text-slate-400 font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    <p className="font-medium">Belum ada ucapan</p>
                    <p className="text-xs mt-1">Ucapan dari tamu akan muncul di sini</p>
                  </td>
                </tr>
              ) : (
                filtered.map((entry) => (
                  <tr key={entry.id} className={`border-b border-slate-50 transition-colors ${selected.includes(entry.id) ? 'bg-violet-50/60' : 'hover:bg-slate-50/60'}`}>
                    {/* Checkbox per baris */}
                    <td className="px-4 py-4">
                      <input type="checkbox" checked={selected.includes(entry.id)} onChange={() => toggleSelect(entry.id)} className="w-4 h-4 rounded border-slate-300 text-violet-600 cursor-pointer" />
                    </td>
                    {/* Nama tamu */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 font-bold text-xs flex items-center justify-center uppercase shrink-0">{entry.guestName[0]}</div>
                        <span className="font-medium text-slate-800">{entry.guestName}</span>
                      </div>
                    </td>

                    {/* Slug undangan */}
                    <td className="px-6 py-4 font-mono text-violet-600 text-xs">/{entry.invitation?.slug}</td>

                    {/* Badge RSVP */}
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${rsvpLabel[entry.rsvp]?.color}`}>{rsvpLabel[entry.rsvp]?.text}</span>
                    </td>

                    {/* Ucapan — truncate panjang */}
                    <td className="px-6 py-4 text-slate-600 max-w-xs">
                      <p className="line-clamp-2 leading-relaxed">{entry.wishes}</p>
                    </td>

                    {/* Waktu */}
                    <td className="px-6 py-4 text-slate-400 text-xs whitespace-nowrap">
                      {new Date(entry.createdAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>

                    {/* Hapus */}
                    <td className="px-6 py-4">
                      <button onClick={() => handleDelete(entry.id, entry.guestName)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Hapus ucapan">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Delete Modal */}
      {deleteTarget && <DeleteModal guestName={deleteTarget.guestName} onConfirm={confirmDelete} onCancel={() => setDeleteTarget(null)} loading={deleting} />}

      {/* Bulk Delete Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowBulkModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <h3 className="text-center font-semibold text-slate-800 text-lg mb-1">Hapus {selected.length} Ucapan?</h3>
            <p className="text-center text-slate-500 text-sm mb-6">Semua ucapan yang dipilih akan dihapus permanen dan tidak bisa dikembalikan.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowBulkModal(false)} disabled={bulkDeleting} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium py-2.5 rounded-xl text-sm transition-colors disabled:opacity-60">
                Batal
              </button>
              <button
                onClick={handleBulkDelete}
                disabled={bulkDeleting}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-medium py-2.5 rounded-xl text-sm transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {bulkDeleting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Menghapus...
                  </>
                ) : (
                  'Ya, Hapus Semua'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
