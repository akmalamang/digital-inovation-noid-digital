'use client';
// app/admin/users/page.tsx
// Manajemen pengguna — list semua user, tambah, ubah role, hapus

import { useEffect, useState } from 'react';

type User = {
  id: number;
  username: string;
  email: string;
  role: 'admin' | 'client';
  createdAt: string;
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ username: '', email: '', password: '', role: 'client' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function fetchUsers() {
    const res = await fetch('/api/users');
    const data = await res.json();
    setUsers(data.data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  // Tambah user baru
  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSaving(true);

    const res = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setSaving(false);

    if (!res.ok) {
      setError(data.message ?? 'Gagal menambah user');
      return;
    }

    setShowModal(false);
    setForm({ username: '', email: '', password: '', role: 'client' });
    fetchUsers();
  }

  // Ubah role langsung dari tabel (toggle admin ↔ client)
  async function handleToggleRole(user: User) {
    const newRole = user.role === 'admin' ? 'client' : 'admin';
    await fetch(`/api/users/${user.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: newRole }),
    });
    fetchUsers();
  }

  // Hapus user
  async function handleDelete(user: User) {
    if (!confirm(`Hapus user "${user.username}"?`)) return;
    await fetch(`/api/users/${user.id}`, { method: 'DELETE' });
    fetchUsers();
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-slate-500 text-sm">{users.length} pengguna terdaftar</p>
        <button onClick={() => setShowModal(true)} className="inline-flex items-center gap-2 bg-[#A6B1E1] hover:bg-[#424874] text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Tambah Pengguna
        </button>
      </div>

      {/* Tabel */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-7 h-7 border-2 border-[#424874] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left px-6 py-3 text-slate-400 font-medium">Username</th>
                <th className="text-left px-6 py-3 text-slate-400 font-medium">Email</th>
                <th className="text-left px-6 py-3 text-slate-400 font-medium">Role</th>
                <th className="text-left px-6 py-3 text-slate-400 font-medium">Bergabung</th>
                <th className="text-left px-6 py-3 text-slate-400 font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                    Belum ada pengguna
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {/* Avatar inisial */}
                        <div className="w-8 h-8 rounded-full bg-violet-100 text-[#424874] font-bold text-xs flex items-center justify-center uppercase shrink-0">{user.username[0]}</div>
                        <span className="font-medium text-slate-800">{user.username}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-500">{user.email}</td>
                    <td className="px-6 py-4">
                      {/* Badge role — klik untuk toggle */}
                      <button
                        onClick={() => handleToggleRole(user)}
                        className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors ${
                          user.role === 'admin' ? 'bg-violet-100 text-violet-700 hover:bg-violet-200' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                        }`}
                        title="Klik untuk ubah role"
                      >
                        {user.role}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-slate-400 text-xs">
                      {new Date(user.createdAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <button onClick={() => handleDelete(user)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Hapus">
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

      {/* Modal Tambah User */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 mx-4">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-semibold text-slate-800 text-lg">Tambah Pengguna</h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setError('');
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg">{error}</div>}

            <form onSubmit={handleCreate} className="space-y-4">
              {[
                { label: 'Username', name: 'username', type: 'text' },
                { label: 'Email', name: 'email', type: 'email' },
                { label: 'Password', name: 'password', type: 'password' },
              ].map(({ label, name, type }) => (
                <div key={name}>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
                  <input
                    type={type}
                    name={name}
                    value={form[name as keyof typeof form]}
                    onChange={handleChange}
                    required
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>
              ))}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                <select name="role" value={form.role} onChange={handleChange} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white">
                  <option value="client">Client</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="flex-1 bg-[#424874] hover:bg-[#1f233d] disabled:opacity-60 text-white font-medium py-2.5 rounded-lg text-sm transition-colors">
                  {saving ? 'Menyimpan...' : 'Tambah'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setError('');
                  }}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium py-2.5 rounded-lg text-sm transition-colors"
                >
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
