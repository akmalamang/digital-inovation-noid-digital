'use client';
// components/admin/AdminHeader.tsx
// Header atas panel admin — tampilkan nama user dan tombol logout

import { signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';

// Mapping pathname ke judul halaman yang readable
const pageTitles: Record<string, string> = {
  '/admin': 'Dashboard',
  '/admin/invitations': 'Manajemen Undangan',
  '/admin/users': 'Manajemen Pengguna',
  '/admin/themes': 'Manajemen Tema',
  '/admin/guest-books': 'Buku Tamu',
};

type Props = {
  user: { name?: string | null; email?: string | null; role: string };
};

export default function AdminHeader({ user }: Props) {
  const pathname = usePathname();

  // Cari judul yang paling spesifik cocok dengan pathname aktif
  const title =
    Object.entries(pageTitles)
      .filter(([key]) => pathname === key || pathname.startsWith(key + '/'))
      .sort((a, b) => b[0].length - a[0].length)[0]?.[1] ?? 'Admin';

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0">
      {/* Judul halaman aktif */}
      <h1 className="text-slate-800 font-semibold text-lg">{title}</h1>

      {/* Info user + logout */}
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-sm font-medium text-slate-700 leading-tight">{user.name}</p>
          <p className="text-xs text-slate-400">{user.email}</p>
        </div>

        {/* Avatar inisial */}
        <div className="w-9 h-9 rounded-full bg-violet-100 text-violet-700 font-bold text-sm flex items-center justify-center uppercase">{user.name?.[0] ?? 'A'}</div>

        {/* Tombol logout */}
        <button onClick={() => signOut({ callbackUrl: '/auth/login' })} className="text-slate-400 hover:text-red-500 transition-colors" title="Keluar">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </div>
    </header>
  );
}
