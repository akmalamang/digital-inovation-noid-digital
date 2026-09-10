'use client';
// app/admin/themes/page.tsx
// Manajemen tema undangan — tampilkan sebagai grid kartu, bisa tambah dan hapus

import { useEffect, useState } from 'react';

type Theme = {
  id: number;
  themeName: string;
  folderPath: string;
  thumbnail: string;
  thumbnails?: string; // JSON string
};

function ThemeCard({ theme, onEdit, onDelete }: { theme: Theme; onEdit: (t: Theme) => void; onDelete: (t: Theme) => void }) {
  const images: string[] = theme.thumbnails ? JSON.parse(theme.thumbnails) : theme.thumbnail ? [theme.thumbnail] : [];

  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (images.length < 2) return;
    const t = setInterval(() => {
      setCurrent((c) => (c + 1) % images.length);
    }, 3000);
    return () => clearInterval(t);
  }, [images.length]);

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:border-violet-300 hover:shadow-sm transition-all group">
      {/* Slideshow thumbnail */}
      <div className="relative h-40 bg-slate-100 overflow-hidden">
        {images.length > 0 ? (
          <>
            {images.map((src, i) => (
              <img key={i} src={src} alt={theme.themeName} className="absolute inset-0 w-full h-full object-cover transition-all duration-500 group-hover:scale-110" style={{ opacity: i === current ? 1 : 0 }} />
            ))}
            {/* Dot indicator */}
            {images.length > 1 && (
              <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1 z-10">
                {images.map((_, i) => (
                  <div key={i} className="w-1.5 h-1.5 rounded-full transition-colors" style={{ background: i === current ? '#fff' : 'rgba(255,255,255,0.4)' }} />
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-slate-300">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
      </div>

      {/* Info tema */}
      <div className="p-4">
        <p className="font-semibold text-slate-800 text-sm">{theme.themeName}</p>
        <p className="text-slate-400 text-xs mt-0.5 font-mono truncate">{theme.folderPath}</p>
        <div className="flex items-center gap-2 mt-3">
          <button onClick={() => onEdit(theme)} className="flex-1 text-center text-xs font-medium text-violet-600 hover:text-violet-700 py-1.5 rounded-lg hover:bg-violet-50 transition-colors">
            Edit
          </button>
          <button onClick={() => onDelete(theme)} className="flex-1 text-center text-xs font-medium text-slate-400 hover:text-red-500 py-1.5 rounded-lg hover:bg-red-50 transition-colors">
            Hapus
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ThemesPage() {
  const [themes, setThemes] = useState<Theme[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState<Theme | null>(null);
  const [form, setForm] = useState({ themeName: '', folderPath: '', thumbnail: '', thumbnailInputs: [''] });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function fetchThemes() {
    const res = await fetch('/api/themes');
    const data = await res.json();
    setThemes(data.data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    fetchThemes();
  }, []);

  function openCreate() {
    setEditTarget(null);
    setForm({ themeName: '', folderPath: '', thumbnail: '', thumbnailInputs: [''] });
    setError('');
    setShowModal(true);
  }

  function openEdit(theme: Theme) {
    setEditTarget(theme);
    const parsed = theme.thumbnails ? JSON.parse(theme.thumbnails) : [theme.thumbnail];
    setForm({
      themeName: theme.themeName,
      folderPath: theme.folderPath,
      thumbnail: theme.thumbnail,
      thumbnailInputs: parsed.length > 0 ? parsed : [''],
    });
    setError('');
    setShowModal(true);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSaving(true);

    const validThumbnails = form.thumbnailInputs.filter((u) => u.trim() !== '');

    const isEdit = !!editTarget;
    const url = isEdit ? `/api/themes/${editTarget!.id}` : '/api/themes';
    const method = isEdit ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        themeName: form.themeName,
        folderPath: form.folderPath,
        thumbnail: validThumbnails[0] ?? '',
        thumbnails: JSON.stringify(validThumbnails),
      }),
    });

    const data = await res.json();
    setSaving(false);

    if (!res.ok) {
      setError(data.message ?? 'Gagal menyimpan tema');
      return;
    }
    setShowModal(false);
    fetchThemes();
  }

  async function handleDelete(theme: Theme) {
    if (!confirm(`Hapus tema "${theme.themeName}"?`)) return;
    await fetch(`/api/themes/${theme.id}`, { method: 'DELETE' });
    fetchThemes();
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-slate-500 text-sm">{themes.length} tema tersedia</p>
        <button onClick={openCreate} className="inline-flex items-center gap-2 bg-[#A6B1E1] hover:bg-[#424874] text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Tambah Tema
        </button>
      </div>

      {/* Grid tema */}
      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-7 h-7 border-2 border-violet-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : themes.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-16 text-center">
          <p className="text-slate-400 font-medium">Belum ada tema</p>
          <p className="text-slate-400 text-sm mt-1">Tambahkan tema pertama dengan klik tombol di atas</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {themes.map((theme) => (
            <ThemeCard key={theme.id} theme={theme} onEdit={openEdit} onDelete={handleDelete} />
          ))}
        </div>
      )}

      {/* Modal Tambah / Edit Tema */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 mx-4">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-semibold text-slate-800 text-lg">{editTarget ? 'Edit Tema' : 'Tambah Tema'}</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg">{error}</div>}

            <form onSubmit={handleSave} className="space-y-4">
              {/* Nama Tema */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nama Tema</label>
                <input
                  type="text"
                  name="themeName"
                  value={form.themeName}
                  onChange={handleChange}
                  required
                  placeholder="Elegant Gold"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>

              {/* Folder Path */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Folder Path</label>
                <input
                  type="text"
                  name="folderPath"
                  value={form.folderPath}
                  onChange={handleChange}
                  required
                  placeholder="views/templates/elegant-gold"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>

              {/* Multiple thumbnail URLs */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">URL Thumbnail (bisa lebih dari 1)</label>
                {form.thumbnailInputs.map((url, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={url}
                      onChange={(e) => {
                        const newInputs = [...form.thumbnailInputs];
                        newInputs[index] = e.target.value;
                        setForm((p) => ({ ...p, thumbnailInputs: newInputs, thumbnail: newInputs[0] }));
                      }}
                      placeholder={`https://... gambar ${index + 1}`}
                      className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                    />
                    {form.thumbnailInputs.length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          const newInputs = form.thumbnailInputs.filter((_, i) => i !== index);
                          setForm((p) => ({ ...p, thumbnailInputs: newInputs, thumbnail: newInputs[0] }));
                        }}
                        className="text-red-400 hover:text-red-600 px-2"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
                <button type="button" onClick={() => setForm((p) => ({ ...p, thumbnailInputs: [...p.thumbnailInputs, ''] }))} className="text-[#424874] text-xs font-medium hover:underline">
                  + Tambah gambar
                </button>
              </div>

              {/* Preview thumbnail pertama */}
              {form.thumbnailInputs[0] && <img src={form.thumbnailInputs[0]} alt="Preview" className="w-full h-32 object-cover rounded-lg border border-slate-200" onError={(e) => ((e.target as HTMLImageElement).style.display = 'none')} />}

              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="flex-1 bg-[#424874] hover:bg-[#353a58] disabled:opacity-60 text-white font-medium py-2.5 rounded-lg text-sm transition-colors">
                  {saving ? 'Menyimpan...' : editTarget ? 'Simpan Perubahan' : 'Tambah Tema'}
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium py-2.5 rounded-lg text-sm transition-colors">
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
