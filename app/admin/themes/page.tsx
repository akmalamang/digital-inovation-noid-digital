'use client';

import { useEffect, useState } from 'react';

type MediaItem = {
  url: string;
  type: 'image' | 'video';
};

type Theme = {
  id: number;
  themeName: string;
  folderPath: string;
  thumbnail: string;
  thumbnails?: string;
};

type SelectedFile = {
  file: File;
  preview: string;
  type: 'image' | 'video';
};

function getMediaType(url: string): 'image' | 'video' {
  const cleanUrl = url.split('?')[0].toLowerCase();

  if (cleanUrl.endsWith('.mp4') || cleanUrl.endsWith('.webm') || cleanUrl.endsWith('.mov') || cleanUrl.endsWith('.m4v') || cleanUrl.endsWith('.avi')) {
    return 'video';
  }

  return 'image';
}

function ThemeCard({ theme, onEdit, onDelete }: { theme: Theme; onEdit: (t: Theme) => void; onDelete: (t: Theme) => void }) {
  let media: MediaItem[] = [];

  try {
    if (theme.thumbnails) {
      const parsed = JSON.parse(theme.thumbnails);

      if (Array.isArray(parsed)) {
        media = parsed.map((item) => {
          if (typeof item === 'string') {
            return {
              url: item,
              type: getMediaType(item),
            };
          }

          return item;
        });
      }
    } else if (theme.thumbnail) {
      media = [
        {
          url: theme.thumbnail,
          type: getMediaType(theme.thumbnail),
        },
      ];
    }
  } catch {
    media = theme.thumbnail
      ? [
          {
            url: theme.thumbnail,
            type: getMediaType(theme.thumbnail),
          },
        ]
      : [];
  }

  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (media.length < 2) return;

    const t = setInterval(() => {
      setCurrent((c) => (c + 1) % media.length);
    }, 3000);

    return () => clearInterval(t);
  }, [media.length]);

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:border-violet-300 hover:shadow-sm transition-all group">
      {/* Media preview */}
      <div className="relative h-40 bg-slate-100 overflow-hidden">
        {media.length > 0 ? (
          <>
            {media.map((item, i) => (
              <div
                key={i}
                className="absolute inset-0 transition-all duration-500"
                style={{
                  opacity: i === current ? 1 : 0,
                  pointerEvents: i === current ? 'auto' : 'none',
                }}
              >
                {item.type === 'video' ? (
                  <video src={item.url} muted loop autoPlay playsInline className="w-full h-full object-cover" />
                ) : (
                  <img src={item.url} alt={theme.themeName} className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110" />
                )}
              </div>
            ))}

            {/* Dot indicator */}
            {media.length > 1 && (
              <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1 z-10">
                {media.map((_, i) => (
                  <div
                    key={i}
                    className="w-1.5 h-1.5 rounded-full transition-colors"
                    style={{
                      background: i === current ? '#fff' : 'rgba(255,255,255,0.4)',
                    }}
                  />
                ))}
              </div>
            )}

            {/* Media counter */}
            {media.length > 1 && (
              <div className="absolute top-2 right-2 bg-black/50 text-white text-[10px] px-2 py-1 rounded-full z-10">
                {current + 1}/{media.length}
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

  const [form, setForm] = useState({
    themeName: '',
    folderPath: '',
  });

  const [selectedFiles, setSelectedFiles] = useState<SelectedFile[]>([]);
  const [existingMedia, setExistingMedia] = useState<MediaItem[]>([]);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function fetchThemes() {
    try {
      const res = await fetch('/api/themes');
      // const data = await res.json();

      const text = await res.text();

      let data: any = {};

      if (text) {
        try {
          data = JSON.parse(text);
        } catch {
          data = {
            message: text,
          };
        }
      }

      if (!res.ok) {
        setError(data.message ?? `Gagal menyimpan tema (${res.status})`);
        return;
      }

      setThemes(data.data ?? []);
    } catch {
      setError('Gagal mengambil data tema');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchThemes();
  }, []);

  function openCreate() {
    setEditTarget(null);

    setForm({
      themeName: '',
      folderPath: '',
    });

    setSelectedFiles([]);
    setExistingMedia([]);

    setError('');
    setShowModal(true);
  }

  function openEdit(theme: Theme) {
    setEditTarget(theme);

    setForm({
      themeName: theme.themeName,
      folderPath: theme.folderPath,
    });

    let media: MediaItem[] = [];

    try {
      if (theme.thumbnails) {
        const parsed = JSON.parse(theme.thumbnails);

        if (Array.isArray(parsed)) {
          media = parsed.map((item) => {
            if (typeof item === 'string') {
              return {
                url: item,
                type: getMediaType(item),
              };
            }

            return item;
          });
        }
      } else if (theme.thumbnail) {
        media = [
          {
            url: theme.thumbnail,
            type: getMediaType(theme.thumbnail),
          },
        ];
      }
    } catch {
      media = [];
    }

    setExistingMedia(media);
    setSelectedFiles([]);

    setError('');
    setShowModal(true);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);

    if (files.length === 0) return;

    const newFiles: SelectedFile[] = files.map((file) => {
      const type = file.type.startsWith('video/') ? 'video' : 'image';

      return {
        file,
        preview: URL.createObjectURL(file),
        type,
      };
    });

    setSelectedFiles((prev) => [...prev, ...newFiles]);

    // Reset input supaya file yang sama bisa dipilih lagi
    e.target.value = '';
  }

  function removeSelectedFile(index: number) {
    setSelectedFiles((prev) => {
      const file = prev[index];

      if (file) {
        URL.revokeObjectURL(file.preview);
      }

      return prev.filter((_, i) => i !== index);
    });
  }

  function removeExistingMedia(index: number) {
    setExistingMedia((prev) => prev.filter((_, i) => i !== index));
  }

  function closeModal() {
    selectedFiles.forEach((item) => {
      URL.revokeObjectURL(item.preview);
    });

    setSelectedFiles([]);
    setExistingMedia([]);
    setShowModal(false);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();

    setError('');
    setSaving(true);

    console.log('selectedFiles:', selectedFiles);
    console.log('form:', form);

    try {
      const formData = new FormData();

      formData.append('themeName', form.themeName);
      formData.append('folderPath', form.folderPath);

      // Existing media yang masih dipertahankan
      formData.append('existingMedia', JSON.stringify(existingMedia));

      // File baru
      selectedFiles.forEach((item) => {
        formData.append('files', item.file);
      });

      const isEdit = !!editTarget;

      const url = isEdit ? `/api/themes/${editTarget!.id}` : '/api/themes';

      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        body: formData,
      });

      const text = await res.text();

      let data: any = {};

      if (text) {
        try {
          data = JSON.parse(text);
        } catch {
          data = {
            message: text,
          };
        }
      }

      if (!res.ok) {
        setError(data.message ?? `Gagal menyimpan tema (${res.status})`);
        return;
      }

      closeModal();
      await fetchThemes();
    } catch (err) {
      console.error(err);
      setError('Terjadi kesalahan saat upload file');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(theme: Theme) {
    if (!confirm(`Hapus tema "${theme.themeName}"?`)) return;

    try {
      await fetch(`/api/themes/${theme.id}`, {
        method: 'DELETE',
      });

      fetchThemes();
    } catch {
      setError('Gagal menghapus tema');
    }
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

      {/* Modal Tambah / Edit */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 mx-4 max-h-[90vh] overflow-y-auto">
            {/* Header modal */}
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-semibold text-slate-800 text-lg">{editTarget ? 'Edit Tema' : 'Tambah Tema'}</h2>

              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600">
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
                  value={form.themeName}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      themeName: e.target.value,
                    }))
                  }
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
                  value={form.folderPath}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      folderPath: e.target.value,
                    }))
                  }
                  required
                  placeholder="views/templates/elegant-gold"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>

              {/* Existing Media */}
              {editTarget && existingMedia.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Media Saat Ini</label>

                  <div className="grid grid-cols-3 gap-2">
                    {existingMedia.map((item, index) => (
                      <div key={index} className="relative h-24 rounded-lg overflow-hidden border border-slate-200 bg-slate-100">
                        {item.type === 'video' ? <video src={item.url} muted className="w-full h-full object-cover" /> : <img src={item.url} alt={`Media ${index + 1}`} className="w-full h-full object-cover" />}

                        <button type="button" onClick={() => removeExistingMedia(index)} className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full text-xs hover:bg-red-600">
                          ✕
                        </button>

                        <div className="absolute bottom-1 left-1">
                          <span className="bg-black/60 text-white text-[9px] px-1.5 py-0.5 rounded">{item.type}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Upload */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Upload Image / Video</label>

                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer bg-slate-50 hover:bg-violet-50 hover:border-violet-300 transition-colors">
                  <svg className="w-8 h-8 text-slate-400 mb-2" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 16V4m0 0L8 8m4-4l4 4M4 16v3a1 1 0 001 1h14a1 1 0 001-1v-3" />
                  </svg>

                  <span className="text-sm text-slate-500">Klik untuk memilih file</span>

                  <span className="text-xs text-slate-400 mt-1">Bisa pilih banyak image / video</span>

                  <input type="file" accept="image/*,video/*" multiple onChange={handleFileChange} className="hidden" />
                </label>
              </div>

              {/* Preview file baru */}
              {selectedFiles.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">File Baru ({selectedFiles.length})</label>

                  <div className="grid grid-cols-3 gap-2">
                    {selectedFiles.map((item, index) => (
                      <div key={index} className="relative h-24 rounded-lg overflow-hidden border border-slate-200 bg-slate-100">
                        {item.type === 'video' ? <video src={item.preview} muted controls className="w-full h-full object-cover" /> : <img src={item.preview} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />}

                        <button type="button" onClick={() => removeSelectedFile(index)} className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full text-xs hover:bg-red-600">
                          ✕
                        </button>

                        <div className="absolute bottom-1 left-1">
                          <span className="bg-black/60 text-white text-[9px] px-1.5 py-0.5 rounded">{item.type}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Info */}
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
                <p className="text-xs text-blue-700">
                  <strong>Format:</strong> JPG, PNG, WEBP, GIF, MP4, WEBM, MOV, dan format image/video lainnya yang didukung browser.
                </p>
              </div>

              {/* Button */}
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="flex-1 bg-[#424874] hover:bg-[#353a58] disabled:opacity-60 text-white font-medium py-2.5 rounded-lg text-sm transition-colors">
                  {saving ? 'Mengupload...' : editTarget ? 'Simpan Perubahan' : 'Tambah Tema'}
                </button>

                <button type="button" onClick={closeModal} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium py-2.5 rounded-lg text-sm transition-colors">
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
