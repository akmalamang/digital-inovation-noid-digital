'use client';

import { useState } from 'react';

type WeddingForm = {
  bridegroomName: string;
  bridegroomShortName: string;
  bridegroomParent: string;
  brideName: string;
  brideShortName: string;
  brideParent: string;
  akadDate: string;
  akadTime: string;
  akadLocation: string;
  akadMapsUrl: string;
  receptionDate: string;
  receptionTime: string;
  receptionLocation: string;
  receptionMapsUrl: string;
  loveStory: string;
  liveStreamingUrl: string;
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

type Invitation = {
  id: number;
  weddingDetail: WeddingDetail | null;
};

export default function TabDetail({ inv, onRefresh }: { inv: Invitation; onRefresh: () => void }) {
  console.log('TabDetail render'); // ← tambah ini
  const d = inv.weddingDetail;
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<WeddingForm>({
    bridegroomName: d?.bridegroomName ?? '',
    bridegroomShortName: d?.bridegroomShortName ?? '',
    bridegroomParent: d?.bridegroomParent ?? '',
    brideName: d?.brideName ?? '',
    brideShortName: d?.brideShortName ?? '',
    brideParent: d?.brideParent ?? '',

    akadDate: d?.akadDate ? new Date(d.akadDate).toISOString().slice(0, 10) : '',

    akadTime: d?.akadTime?.slice(0, 5) ?? '',
    akadLocation: d?.akadLocation ?? '',
    akadMapsUrl: d?.akadMapsUrl ?? '',

    receptionDate: d?.receptionDate ? new Date(d.receptionDate).toISOString().slice(0, 10) : '',

    receptionTime: d?.receptionTime?.slice(0, 5) ?? '',
    receptionLocation: d?.receptionLocation ?? '',
    receptionMapsUrl: d?.receptionMapsUrl ?? '',
    loveStory: d?.loveStory ?? '',
    liveStreamingUrl: d?.liveStreamingUrl ?? '',
  });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMsg('');
    const method = d ? 'PUT' : 'POST';
    const url = d ? `/api/wedding-details/${d.id}` : `/api/wedding-details`;
    const body = d ? form : { ...form, invitationId: inv.id };
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    setSaving(false);
    if (res.ok) {
      setMsg('Tersimpan!');
      setEditing(false);
      onRefresh();
    } else {
      setMsg('Gagal menyimpan.');
    }
  }

  if (!editing) {
    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-slate-800">Detail Pernikahan</h3>
          <button onClick={() => setEditing(true)} className="text-sm text-rose-500 hover:underline font-medium">
            Edit
          </button>
        </div>
        {!d ? (
          <div className="text-center py-8">
            <p className="text-slate-400 mb-3">Detail pernikahan belum diisi.</p>
            <button onClick={() => setEditing(true)} className="bg-rose-500 text-white text-sm px-4 py-2 rounded-lg hover:bg-rose-600">
              Isi Sekarang
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 text-sm">
            {[
              ['Pengantin Pria', d.bridegroomName],
              ['Pengantin Wanita', d.brideName],
              ['Orang Tua Pria', d.bridegroomParent],
              ['Orang Tua Wanita', d.brideParent],
              ['Tanggal Akad', d.akadDate ? new Date(d.akadDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'],
              ['Lokasi Akad', d.akadLocation],
              ['Tanggal Resepsi', d.receptionDate ? new Date(d.receptionDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'],
              ['Lokasi Resepsi', d.receptionLocation],
            ].map(([label, val]) => (
              <div key={label} className="bg-slate-50 rounded-lg p-3">
                <p className="text-xs text-slate-400 mb-0.5">{label}</p>
                <p className="font-medium text-slate-700">{val || '-'}</p>
              </div>
            ))}
          </div>
        )}
        {msg && <p className="text-emerald-600 text-sm">{msg}</p>}
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-slate-800">Edit Detail Pernikahan</h3>
        <button type="button" onClick={() => setEditing(false)} className="text-sm text-slate-400 hover:text-slate-600">
          Batal
        </button>
      </div>

      {/* Pengantin Pria */}
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Pengantin Pria</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-slate-500 mb-1">Nama Lengkap</label>
            <input name="bridegroomName" value={form.bridegroomName} onChange={handleChange} required className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400" />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">Nama Panggilan</label>
            <input name="bridegroomShortName" value={form.bridegroomShortName} onChange={handleChange} required className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400" />
          </div>
          <div className="col-span-2">
            <label className="block text-xs text-slate-500 mb-1">Nama Orang Tua</label>
            <input name="bridegroomParent" value={form.bridegroomParent} onChange={handleChange} required className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400" />
          </div>
        </div>
      </div>

      {/* Pengantin Wanita */}
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Pengantin Wanita</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-slate-500 mb-1">Nama Lengkap</label>
            <input name="brideName" value={form.brideName} onChange={handleChange} required className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400" />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">Nama Panggilan</label>
            <input name="brideShortName" value={form.brideShortName} onChange={handleChange} required className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400" />
          </div>
          <div className="col-span-2">
            <label className="block text-xs text-slate-500 mb-1">Nama Orang Tua</label>
            <input name="brideParent" value={form.brideParent} onChange={handleChange} required className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400" />
          </div>
        </div>
      </div>

      {/* Akad */}
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Akad Nikah</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-slate-500 mb-1">Tanggal</label>
            <input type="date" name="akadDate" value={form.akadDate} onChange={handleChange} required className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400" />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">Waktu</label>
            <input type="time" name="akadTime" value={form.akadTime} onChange={handleChange} required className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400" />
          </div>
          <div className="col-span-2">
            <label className="block text-xs text-slate-500 mb-1">Lokasi</label>
            <textarea
              name="akadLocation"
              value={form.akadLocation}
              onChange={handleChange}
              rows={2}
              required
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 resize-none"
            />
          </div>
          <div className="col-span-2">
            <label className="block text-xs text-slate-500 mb-1">Link Google Maps (opsional)</label>
            <input name="akadMapsUrl" value={form.akadMapsUrl} onChange={handleChange} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400" />
          </div>
        </div>
      </div>

      {/* Resepsi */}
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Resepsi</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-slate-500 mb-1">Tanggal</label>
            <input type="date" name="receptionDate" value={form.receptionDate} onChange={handleChange} required className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400" />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">Waktu</label>
            <input type="time" name="receptionTime" value={form.receptionTime} onChange={handleChange} required className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400" />
          </div>
          <div className="col-span-2">
            <label className="block text-xs text-slate-500 mb-1">Lokasi</label>
            <textarea
              name="receptionLocation"
              value={form.receptionLocation}
              onChange={handleChange}
              rows={2}
              required
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 resize-none"
            />
          </div>
          <div className="col-span-2">
            <label className="block text-xs text-slate-500 mb-1">Link Google Maps (opsional)</label>
            <input name="receptionMapsUrl" value={form.receptionMapsUrl} onChange={handleChange} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400" />
          </div>
        </div>
      </div>

      {/* Tambahan */}
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Tambahan</p>
        <div>
          <label className="block text-xs text-slate-500 mb-1">Love Story</label>
          <textarea
            name="loveStory"
            value={form.loveStory}
            onChange={handleChange}
            rows={4}
            placeholder="Ceritakan perjalanan cinta kalian..."
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 resize-none"
          />
        </div>
        <div>
          <label className="block text-xs text-slate-500 mb-1">URL Live Streaming (opsional)</label>
          <input name="liveStreamingUrl" value={form.liveStreamingUrl} onChange={handleChange} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400" />
        </div>
      </div>

      {msg && <p className="text-sm text-rose-500">{msg}</p>}
      <button type="submit" disabled={saving} className="bg-rose-500 hover:bg-rose-600 disabled:opacity-60 text-white font-medium px-6 py-2.5 rounded-lg text-sm transition-colors">
        {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
      </button>
    </form>
  );
}
