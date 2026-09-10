'use client';
// app/admin/invitations/create/page.tsx
// Form buat undangan baru — pilih user, tema, dan slug

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type User = { id: number; username: string; email: string };
type Theme = { id: number; themeName: string; thumbnail: string };

export default function CreateInvitationPage() {
  const router = useRouter();

  const [users, setUsers] = useState<User[]>([]);
  const [themes, setThemes] = useState<Theme[]>([]);
  const [form, setForm] = useState({ userId: '', themeId: '', slug: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Ambil daftar user dan tema untuk pilihan dropdown
  useEffect(() => {
    async function fetchOptions() {
      const [usersRes, themesRes] = await Promise.all([fetch('/api/users'), fetch('/api/themes')]);
      const [usersData, themesData] = await Promise.all([usersRes.json(), themesRes.json()]);
      setUsers(usersData.data ?? []);
      setThemes(themesData.data ?? []);
      setLoading(false);
    }
    fetchOptions();
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  // Auto-generate slug dari nama user yang dipilih (bisa diedit manual)
  function handleUserChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const userId = e.target.value;
    const user = users.find((u) => u.id === Number(userId));
    setForm((prev) => ({
      ...prev,
      userId,
      slug: user ? user.username.toLowerCase().replace(/\s+/g, '-') : prev.slug,
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSaving(true);

    const res = await fetch('/api/invitations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: Number(form.userId),
        themeId: Number(form.themeId),
        slug: form.slug.toLowerCase().trim(),
      }),
    });

    const data = await res.json();
    setSaving(false);

    if (!res.ok) {
      setError(data.message ?? 'Gagal membuat undangan');
      return;
    }

    // Langsung arahkan ke halaman edit detail setelah berhasil dibuat
    router.push(`/admin/invitations/${data.data.id}/edit`);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="w-8 h-8 border-2 border-violet-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-xl">
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="font-semibold text-slate-800 text-base mb-5">Informasi Undangan</h2>

        {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Pilih User / Pemilik */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Pemilik Undangan <span className="text-red-400">*</span>
            </label>
            <select name="userId" value={form.userId} onChange={handleUserChange} required className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white">
              <option value="">— Pilih pengguna —</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.username} ({u.email})
                </option>
              ))}
            </select>
          </div>

          {/* Pilih Tema */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Tema Undangan <span className="text-red-400">*</span>
            </label>
            <select name="themeId" value={form.themeId} onChange={handleChange} required className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white">
              <option value="">— Pilih tema —</option>
              {themes.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.themeName}
                </option>
              ))}
            </select>

            {/* Preview thumbnail tema yang dipilih */}
            {form.themeId &&
              (() => {
                const theme = themes.find((t) => t.id === Number(form.themeId));
                return theme?.thumbnail ? <img src={theme.thumbnail} alt={theme.themeName} className="mt-2 w-full h-28 object-cover rounded-lg border border-slate-200" /> : null;
              })()}
          </div>

          {/* Slug URL */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Slug URL <span className="text-red-400">*</span>
            </label>
            <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-violet-500">
              <span className="px-3 py-2 bg-slate-50 text-slate-400 text-sm border-r border-slate-200 select-none">domain.com/</span>
              <input
                type="text"
                name="slug"
                value={form.slug}
                onChange={handleChange}
                required
                placeholder="budi-riri"
                pattern="[a-z0-9\-]+"
                title="Hanya huruf kecil, angka, dan tanda hubung"
                className="flex-1 px-3 py-2 text-sm focus:outline-none"
              />
            </div>
            <p className="text-xs text-slate-400 mt-1">Hanya huruf kecil, angka, dan tanda hubung (-)</p>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button type="submit" disabled={saving} className="bg-[#424874] hover:bg-[#2e345c] disabled:opacity-60 text-white font-medium px-6 py-2.5 rounded-lg text-sm transition-colors">
              {saving ? 'Membuat...' : 'Buat & Isi Detail →'}
            </button>
            <button type="button" onClick={() => router.push('/admin/invitations')} className="text-slate-500 hover:text-slate-700 text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-slate-100 transition-colors">
              Batal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
