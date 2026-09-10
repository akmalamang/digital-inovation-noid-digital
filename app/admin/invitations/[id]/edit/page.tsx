'use client';
// app/admin/invitations/[id]/edit/page.tsx
// Form edit detail pernikahan — client component dengan fetch ke API

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';

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

const emptyForm: WeddingForm = {
  bridegroomName: '',
  bridegroomShortName: '',
  bridegroomParent: '',
  brideName: '',
  brideShortName: '',
  brideParent: '',
  akadDate: '',
  akadTime: '',
  akadLocation: '',
  akadMapsUrl: '',
  receptionDate: '',
  receptionTime: '',
  receptionLocation: '',
  receptionMapsUrl: '',
  loveStory: '',
  liveStreamingUrl: '',
};

// ← TARUH DI SINI, di luar EditInvitationPage
function Field({
  label,
  name,
  type = 'text',
  required = false,
  className = '',
  value,
  onChange,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  className?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-slate-700 mb-1">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition"
      />
    </div>
  );
}

export default function EditInvitationPage() {
  const params = useParams();
  const router = useRouter();
  const invitationId = Number(params.id);

  const [form, setForm] = useState<WeddingForm>(emptyForm);
  const [detailId, setDetailId] = useState<number | null>(null); // ID wedding_detail jika sudah ada
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Ambil data existing wedding detail saat halaman dimuat
  useEffect(() => {
    async function fetchDetail() {
      const res = await fetch(`/api/invitations/${invitationId}`);
      const data = await res.json();
      const detail = data.data?.weddingDetail;

      if (detail) {
        setDetailId(detail.id);
        setForm({
          bridegroomName: detail.bridegroomName ?? '',
          bridegroomShortName: detail.bridegroomShortName ?? '',
          bridegroomParent: detail.bridegroomParent ?? '',
          brideName: detail.brideName ?? '',
          brideShortName: detail.brideShortName ?? '',
          brideParent: detail.brideParent ?? '',
          akadDate: detail.akadDate?.slice(0, 10) ?? '',
          akadTime: detail.akadTime?.slice(11, 16) ?? '',
          akadLocation: detail.akadLocation ?? '',
          akadMapsUrl: detail.akadMapsUrl ?? '',
          receptionDate: detail.receptionDate?.slice(0, 10) ?? '',
          receptionTime: detail.receptionTime?.slice(11, 16) ?? '',
          receptionLocation: detail.receptionLocation ?? '',
          receptionMapsUrl: detail.receptionMapsUrl ?? '',
          loveStory: detail.loveStory ?? '',
          liveStreamingUrl: detail.liveStreamingUrl ?? '',
        });
      }
      setLoading(false);
    }
    fetchDetail();
  }, [invitationId]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMsg(null);

    // Jika detail sudah ada → PUT (update), jika belum → POST (buat baru)
    const method = detailId ? 'PUT' : 'POST';
    const url = detailId ? `/api/wedding-details/${detailId}` : `/api/wedding-details`;

    const body = detailId ? form : { ...form, invitationId };

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    setSaving(false);

    if (!res.ok) {
      setMsg({ type: 'error', text: data.message ?? 'Gagal menyimpan' });
    } else {
      setMsg({ type: 'success', text: 'Detail pernikahan berhasil disimpan!' });
      if (!detailId) setDetailId(data.data.id); // Simpan ID baru
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="w-8 h-8 border-2 border-violet-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Komponen field input reusable

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
      {/* Notifikasi */}
      {msg && <div className={`p-4 rounded-lg text-sm font-medium ${msg.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>{msg.text}</div>}

      {/* Section: Pengantin Pria */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <h2 className="font-semibold text-slate-800 text-base flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-sky-400 inline-block" />
          Data Pengantin Pria
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Nama Lengkap" name="bridegroomName" required className="col-span-2" value={form.bridegroomName} onChange={handleChange} />
          <Field label="Nama Panggilan" name="bridegroomShortName" required value={form.bridegroomShortName} onChange={handleChange} />
          <Field label="Nama Orang Tua" name="bridegroomParent" required value={form.bridegroomParent} onChange={handleChange} />
        </div>
      </div>

      {/* Section: Pengantin Wanita */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <h2 className="font-semibold text-slate-800 text-base flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-rose-400 inline-block" />
          Data Pengantin Wanita
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Nama Lengkap" name="brideName" required className="col-span-2" value={form.brideName} onChange={handleChange} />
          <Field label="Nama Panggilan" name="brideShortName" required value={form.brideShortName} onChange={handleChange} />
          <Field label="Nama Orang Tua" name="brideParent" required value={form.brideParent} onChange={handleChange} />
        </div>
      </div>

      {/* Section: Akad */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <h2 className="font-semibold text-slate-800 text-base flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
          Acara Akad Nikah
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Tanggal Akad" name="akadDate" type="date" required value={form.akadDate} onChange={handleChange} />
          <Field label="Waktu Akad" name="akadTime" type="time" required value={form.akadTime} onChange={handleChange} />
          <div className="col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Lokasi Akad <span className="text-red-400">*</span>
            </label>
            <textarea
              name="akadLocation"
              value={form.akadLocation}
              onChange={handleChange}
              required
              rows={2}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition resize-none"
            />
          </div>
          <Field label="Link Google Maps (opsional)" name="akadMapsUrl" className="col-span-2" value={form.akadMapsUrl} onChange={handleChange} />
        </div>
      </div>

      {/* Section: Resepsi */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <h2 className="font-semibold text-slate-800 text-base flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-violet-400 inline-block" />
          Acara Resepsi
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Tanggal Resepsi" name="receptionDate" type="date" required value={form.receptionDate} onChange={handleChange} />
          <Field label="Waktu Resepsi" name="receptionTime" type="time" required value={form.receptionTime} onChange={handleChange} />
          <div className="col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Lokasi Resepsi <span className="text-red-400">*</span>
            </label>
            <textarea
              name="receptionLocation"
              value={form.receptionLocation}
              onChange={handleChange}
              required
              rows={2}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition resize-none"
            />
          </div>
          <Field label="Link Google Maps (opsional)" name="receptionMapsUrl" className="col-span-2" value={form.receptionMapsUrl} onChange={handleChange} />
        </div>
      </div>

      {/* Section: Fitur Tambahan */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <h2 className="font-semibold text-slate-800 text-base flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
          Fitur Tambahan
        </h2>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Love Story</label>
          <textarea
            name="loveStory"
            value={form.loveStory}
            onChange={handleChange}
            rows={4}
            placeholder="Ceritakan perjalanan cinta kalian..."
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition resize-none"
          />
        </div>
        <Field label="URL Live Streaming (opsional)" name="liveStreamingUrl" value={form.liveStreamingUrl} onChange={handleChange} />
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-3 pb-6">
        <button type="submit" disabled={saving} className="bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white font-medium px-6 py-2.5 rounded-lg text-sm transition-colors">
          {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
        </button>
        <button type="button" onClick={() => router.push('/admin/invitations')} className="text-slate-500 hover:text-slate-700 text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-slate-100 transition-colors">
          Batal
        </button>
      </div>
    </form>
  );
}
