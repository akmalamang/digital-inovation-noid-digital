'use client';
// app/dashboard/invitations/[id]/page.tsx
// Halaman kelola undangan — tab: Detail, Galeri, Rekening, Buku Tamu

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import ImageUploader from '@/components/ImageUploader';
import TabDetail from './TabDetail';

// ── Types ─────────────────────────────────────────────────────────────────────
type Invitation = {
  id: number;
  slug: string;
  isActive: boolean;
  theme: { themeName: string; thumbnail: string };
  weddingDetail: WeddingDetail | null;
  galleries: Gallery[];
  digitalWallets: Wallet[];
  guestBooks: GuestEntry[];
};
type WeddingDetail = {
  id: number;
  bridegroomName: string;
  bridegroomShortName: string;
  bridegroomParent: string;
  brideName: string;
  brideShortName: string;
  brideParent: string;
  akadDate: Date;
  akadTime: string;
  akadLocation: string;
  akadMapsUrl: string;
  receptionDate: Date;
  receptionTime: string;
  receptionLocation: string;
  receptionMapsUrl: string;
  loveStory: string;
  liveStreamingUrl: string;
};
type Gallery = { id: number; filePath: string; type: string };
type Wallet = { id: number; bankName: string; accountNumber: string; accountOwner: string };
type GuestEntry = { id: number; guestName: string; rsvp: string; wishes: string; createdAt: string };

const TABS = ['Detail', 'Galeri', 'Rekening', 'Buku Tamu', 'Bagikan'] as const;
type Tab = (typeof TABS)[number];

const rsvpLabel: Record<string, { text: string; color: string }> = {
  hadir: { text: 'Hadir', color: 'bg-emerald-50 text-emerald-700' },
  tidak_hadir: { text: 'Tidak Hadir', color: 'bg-red-50 text-red-500' },
  ragu_ragu: { text: 'Ragu-ragu', color: 'bg-amber-50 text-amber-600' },
};

// ── Komponen utama ─────────────────────────────────────────────────────────────
export default function InvitationDetailPage() {
  const params = useParams();
  const id = Number(params.id);

  const [inv, setInv] = useState<Invitation | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('Detail');

  // ← Tambah useCallback supaya fungsi tidak dibuat ulang setiap render
  const fetchInvitation = useCallback(async () => {
    const res = await fetch(`/api/invitations/${id}`);
    const data = await res.json();
    setInv(data.data);
    setLoading(false);
  }, [id]);

  useEffect(() => {
    fetchInvitation();
  }, [fetchInvitation]);
  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="w-8 h-8 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!inv) return <p className="text-slate-400 text-center mt-12">Undangan tidak ditemukan.</p>;

  return (
    <div className="space-y-5 max-w-3xl">
      {/* Header undangan */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center gap-4">
        {inv.theme.thumbnail && <img src={inv.theme.thumbnail} alt={inv.theme.themeName} className="w-16 h-16 rounded-xl object-cover shrink-0" />}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-slate-800 text-lg">{inv.weddingDetail ? `${inv.weddingDetail.bridegroomShortName} & ${inv.weddingDetail.brideShortName}` : 'Detail belum diisi'}</p>
          <p className="font-mono text-rose-500 text-sm mt-0.5">/{inv.slug}</p>
          <div className="flex items-center gap-3 mt-1">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${inv.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>{inv.isActive ? 'Aktif' : 'Nonaktif'}</span>
            <span className="text-xs text-slate-400">{inv.theme.themeName}</span>
          </div>
        </div>
        <a href={`/${inv.slug}`} target="_blank" rel="noopener noreferrer" className="shrink-0 text-sm text-rose-500 border border-rose-200 hover:bg-rose-50 px-3 py-1.5 rounded-lg transition-colors font-medium">
          Buka →
        </a>
      </div>

      {/* Tab navigasi */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
        {TABS.map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === tab ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
            {tab}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        {activeTab === 'Detail' && <TabDetail inv={inv} onRefresh={fetchInvitation} />}
        {activeTab === 'Galeri' && <TabGaleri inv={inv} onRefresh={fetchInvitation} />}
        {activeTab === 'Rekening' && <TabRekening inv={inv} onRefresh={fetchInvitation} />}
        {activeTab === 'Buku Tamu' && <TabBukuTamu inv={inv} />}
        {activeTab === 'Bagikan' && <TabBagikan inv={inv} />}
      </div>
    </div>
  );
}

// ── Tab Galeri ─────────────────────────────────────────────────────────────────
function TabGaleri({ inv, onRefresh }: { inv: Invitation; onRefresh: () => void }) {
  const [type, setType] = useState('gallery');
  const [pendingUrls, setPendingUrls] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  function handleUploaded(url: string) {
    setPendingUrls((prev) => [...prev, url]);
  }

  async function handleSave() {
    if (pendingUrls.length === 0) return;
    setSaving(true);
    await Promise.all(
      pendingUrls.map((filePath) =>
        fetch('/api/galleries', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ invitationId: inv.id, filePath, type }),
        }),
      ),
    );
    setPendingUrls([]);
    setSaving(false);
    setMsg(`${pendingUrls.length} foto berhasil disimpan!`);
    setTimeout(() => setMsg(''), 3000);
    onRefresh();
  }

  async function handleDelete(galleryId: number) {
    await fetch(`/api/galleries/${galleryId}`, { method: 'DELETE' });
    onRefresh();
  }

  return (
    <div className="space-y-5">
      <h3 className="font-semibold text-slate-800">Galeri Foto</h3>

      {/* Pilih tipe foto */}
      <div className="flex items-center gap-3">
        <label className="text-sm text-slate-600 font-medium shrink-0">Tipe foto:</label>
        <select value={type} onChange={(e) => setType(e.target.value)} className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-rose-400">
          <option value="gallery">Gallery (foto biasa)</option>
          <option value="slider">Slider (foto utama halaman)</option>
          <option value="background">Background (latar belakang)</option>
        </select>
      </div>

      {/* Upload drag & drop */}
      <ImageUploader onUploaded={handleUploaded} maxFiles={10} />

      {/* Tombol simpan */}
      {pendingUrls.length > 0 && (
        <div className="flex items-center gap-3 p-3 bg-rose-50 border border-rose-200 rounded-xl">
          <p className="text-sm text-rose-700 flex-1">
            {pendingUrls.length} foto siap disimpan sebagai <strong>{type}</strong>
          </p>
          <button onClick={handleSave} disabled={saving} className="bg-rose-500 hover:bg-rose-600 text-white text-sm font-medium px-4 py-2 rounded-lg disabled:opacity-60 transition-colors shrink-0">
            {saving ? 'Menyimpan...' : 'Simpan ke Galeri'}
          </button>
        </div>
      )}

      {msg && <p className="text-emerald-600 text-sm font-medium">{msg}</p>}

      {/* Grid foto yang sudah tersimpan */}
      {inv.galleries.length === 0 ? (
        <p className="text-center text-slate-400 py-8 text-sm">Belum ada foto ditambahkan.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {inv.galleries.map((g) => (
            <div key={g.id} className="relative group rounded-xl overflow-hidden aspect-square bg-slate-100">
              <img src={g.filePath} alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <span className="text-white text-xs bg-black/50 px-2 py-0.5 rounded-full">{g.type}</span>
                <button onClick={() => handleDelete(g.id)} className="text-white bg-red-500 hover:bg-red-600 text-xs px-2 py-0.5 rounded-full transition-colors">
                  Hapus
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Tab Rekening ───────────────────────────────────────────────────────────────
function TabRekening({ inv, onRefresh }: { inv: Invitation; onRefresh: () => void }) {
  const [form, setForm] = useState({ bankName: '', accountNumber: '', accountOwner: '' });
  const [saving, setSaving] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await fetch('/api/digital-wallets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ invitationId: inv.id, ...form }),
    });
    setForm({ bankName: '', accountNumber: '', accountOwner: '' });
    setSaving(false);
    onRefresh();
  }

  async function handleDelete(walletId: number) {
    await fetch(`/api/digital-wallets/${walletId}`, { method: 'DELETE' });
    onRefresh();
  }

  return (
    <div className="space-y-5">
      <h3 className="font-semibold text-slate-800">Rekening / Angpao Digital</h3>

      {/* Form tambah */}
      <form onSubmit={handleAdd} className="grid grid-cols-2 gap-3">
        {[
          ['Nama Bank', 'bankName', 'BCA / GoPay'],
          ['No. Rekening', 'accountNumber', '0123456789'],
          ['Nama Pemilik', 'accountOwner', 'Nama Lengkap'],
        ].map(([label, name, ph]) => (
          <div key={name} className={name === 'accountOwner' ? 'col-span-2' : ''}>
            <label className="block text-xs text-slate-500 mb-1">{label}</label>
            <input
              name={name}
              value={form[name as keyof typeof form]}
              onChange={handleChange}
              placeholder={ph as string}
              required
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
            />
          </div>
        ))}
        <div className="col-span-2">
          <button type="submit" disabled={saving} className="bg-rose-500 hover:bg-rose-600 text-white text-sm font-medium px-5 py-2.5 rounded-lg disabled:opacity-60 transition-colors">
            {saving ? 'Menambahkan...' : 'Tambah Rekening'}
          </button>
        </div>
      </form>

      {/* Daftar rekening */}
      {inv.digitalWallets.length === 0 ? (
        <p className="text-center text-slate-400 py-6 text-sm">Belum ada rekening ditambahkan.</p>
      ) : (
        <div className="space-y-3">
          {inv.digitalWallets.map((w) => (
            <div key={w.id} className="flex items-center justify-between bg-slate-50 rounded-xl p-4">
              <div>
                <p className="font-semibold text-slate-800 text-sm">{w.bankName}</p>
                <p className="font-mono text-slate-600 text-sm">{w.accountNumber}</p>
                <p className="text-slate-400 text-xs">{w.accountOwner}</p>
              </div>
              <button onClick={() => handleDelete(w.id)} className="text-slate-400 hover:text-red-500 p-1.5 hover:bg-red-50 rounded-lg transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Tab Buku Tamu ──────────────────────────────────────────────────────────────
function TabBukuTamu({ inv }: { inv: Invitation }) {
  const stats = {
    hadir: inv.guestBooks.filter((g) => g.rsvp === 'hadir').length,
    tidak_hadir: inv.guestBooks.filter((g) => g.rsvp === 'tidak_hadir').length,
    ragu_ragu: inv.guestBooks.filter((g) => g.rsvp === 'ragu_ragu').length,
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-slate-800">Buku Tamu</h3>
        <span className="text-slate-400 text-sm">{inv.guestBooks.length} ucapan</span>
      </div>

      {/* Stat RSVP */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { key: 'hadir', label: 'Hadir', color: 'bg-emerald-50 text-emerald-700' },
          { key: 'tidak_hadir', label: 'Tidak Hadir', color: 'bg-red-50 text-red-500' },
          { key: 'ragu_ragu', label: 'Ragu-ragu', color: 'bg-amber-50 text-amber-600' },
        ].map(({ key, label, color }) => (
          <div key={key} className={`rounded-xl p-3 text-center ${color}`}>
            <p className="text-2xl font-bold">{stats[key as keyof typeof stats]}</p>
            <p className="text-xs mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* List ucapan */}
      {inv.guestBooks.length === 0 ? (
        <p className="text-center text-slate-400 py-8 text-sm">Belum ada ucapan dari tamu.</p>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
          {inv.guestBooks.map((g) => (
            <div key={g.id} className="bg-slate-50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-rose-100 text-rose-600 text-xs font-bold flex items-center justify-center uppercase">{g.guestName[0]}</div>
                  <p className="font-medium text-slate-800 text-sm">{g.guestName}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${rsvpLabel[g.rsvp]?.color}`}>{rsvpLabel[g.rsvp]?.text}</span>
              </div>
              <p className="text-slate-600 text-sm leading-relaxed">{g.wishes}</p>
              <p className="text-slate-400 text-xs mt-2">{new Date(g.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TabBagikan({ inv }: { inv: Invitation }) {
  const [namaInput, setNamaInput] = useState('');
  const [daftarTamu, setDaftarTamu] = useState<string[]>([]);
  const [copied, setCopied] = useState<string | null>(null);

  const baseUrl = typeof window !== 'undefined' ? `${window.location.origin}/${inv.slug}` : `/${inv.slug}`;

  function generateLink(nama: string) {
    return `${baseUrl}?to=${encodeURIComponent(nama)}`;
  }

  function handleTambah() {
    const nama = namaInput.trim();
    if (!nama || daftarTamu.includes(nama)) return;
    setDaftarTamu((prev) => [...prev, nama]);
    setNamaInput('');
  }

  function handleHapus(nama: string) {
    setDaftarTamu((prev) => prev.filter((n) => n !== nama));
  }

  function handleCopy(link: string, nama: string) {
    navigator.clipboard.writeText(link);
    setCopied(nama);
    setTimeout(() => setCopied(null), 2000);
  }

  function handleWhatsApp(nama: string) {
    const link = generateLink(nama);
    const text = encodeURIComponent(`Assalamu'alaikum ${nama},\n\nKami mengundang kehadiran Anda di pernikahan kami 💕\n\nSilakan buka undangan digital kami di:\n${link}\n\nAtas kehadiran dan doa restu Anda, kami ucapkan terima kasih 🙏`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleTambah();
  }

  return (
    <div className="space-y-6">
      <h3 className="font-semibold text-slate-800">Bagikan Undangan</h3>

      {/* Preview link tanpa nama */}
      <div className="bg-slate-50 rounded-xl p-4">
        <p className="text-xs text-slate-400 mb-1">Link undangan umum:</p>
        <div className="flex items-center gap-2">
          <p className="font-mono text-sm text-rose-500 flex-1 break-all">{baseUrl}</p>
          <button onClick={() => handleCopy(baseUrl, '__base')} className="shrink-0 text-xs bg-white border border-slate-200 hover:border-rose-300 text-slate-500 hover:text-rose-500 px-3 py-1.5 rounded-lg transition-colors">
            {copied === '__base' ? '✓ Disalin!' : 'Salin'}
          </button>
        </div>
      </div>

      {/* Input nama tamu */}
      <div>
        <p className="text-sm font-medium text-slate-700 mb-2">Generate link per nama tamu</p>
        <div className="flex gap-2">
          <input
            type="text"
            value={namaInput}
            onChange={(e) => setNamaInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ketik nama tamu, tekan Enter"
            className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
          />
          <button onClick={handleTambah} disabled={!namaInput.trim()} className="bg-rose-500 hover:bg-rose-600 disabled:opacity-40 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
            Tambah
          </button>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Link akan jadi: <span className="font-mono text-rose-400">{baseUrl}?to=NamaTamu</span>
        </p>
      </div>

      {/* Daftar tamu + link */}
      {daftarTamu.length === 0 ? (
        <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
          <p className="text-slate-400 text-sm">Tambahkan nama tamu untuk generate link personal.</p>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">{daftarTamu.length} tamu</p>
          {daftarTamu.map((nama) => {
            const link = generateLink(nama);
            return (
              <div key={nama} className="bg-white border border-slate-200 rounded-xl p-4 hover:border-rose-200 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium text-slate-800 text-sm">{nama}</p>
                  <button onClick={() => handleHapus(nama)} className="text-slate-300 hover:text-red-400 text-xs transition-colors">
                    ✕
                  </button>
                </div>
                <p className="font-mono text-xs text-rose-400 break-all mb-3">{link}</p>
                <div className="flex gap-2">
                  {/* Salin link */}
                  <button
                    onClick={() => handleCopy(link, nama)}
                    className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium border border-slate-200 hover:border-rose-300 text-slate-500 hover:text-rose-500 py-2 rounded-lg transition-colors"
                  >
                    {copied === nama ? (
                      <>✓ Disalin!</>
                    ) : (
                      <>
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        Salin Link
                      </>
                    )}
                  </button>

                  {/* Kirim WhatsApp */}
                  <button onClick={() => handleWhatsApp(nama)} className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg transition-colors">
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                    WhatsApp
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Salin semua link sekaligus */}
      {daftarTamu.length > 1 && (
        <button
          onClick={() => {
            const semua = daftarTamu.map((nama) => `${nama}: ${generateLink(nama)}`).join('\n');
            navigator.clipboard.writeText(semua);
            setCopied('__all');
            setTimeout(() => setCopied(null), 2000);
          }}
          className="w-full border border-dashed border-slate-300 hover:border-rose-300 text-slate-500 hover:text-rose-500 text-sm py-2.5 rounded-xl transition-colors"
        >
          {copied === '__all' ? '✓ Semua link disalin!' : 'Salin Semua Link Sekaligus'}
        </button>
      )}
    </div>
  );
}
