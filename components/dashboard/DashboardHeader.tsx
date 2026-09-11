'use client';
// components/dashboard/DashboardHeader.tsx
// Palette: F4EEFF / A6B1E1 / DCD6F7

import { signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

const pageTitles: Record<string, string> = {
  '/dashboard': 'Beranda',
  '/dashboard/invitations': 'Undangan Saya',
};

type Props = {
  user: { name?: string | null; email?: string | null; role: string };
};

export default function DashboardHeader({ user }: Props) {
  const pathname = usePathname();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const title =
    Object.entries(pageTitles)
      .filter(([key]) => pathname === key || pathname.startsWith(key + '/'))
      .sort((a, b) => b[0].length - a[0].length)[0]?.[1] ?? 'Dashboard';

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const initials = user.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'U';

  return (
    <header
      className="h-16 px-4 lg:px-6 flex items-center justify-between shrink-0"
      style={{
        background: '#ffffff',
        borderBottom: '1px solid #DCD6F7',
        boxShadow: '0 1px 8px rgba(166,177,225,0.12)',
      }}
    >
      {/* ── Kiri: Logo mobile + Judul halaman ── */}
      <div className="flex items-center gap-3">
        {/* Logo hanya muncul di mobile */}
        <div className="flex lg:hidden items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(135deg, #A6B1E1, #8a96d4)' }}>
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
            </svg>
          </div>
          <span className="font-semibold text-sm" style={{ color: '#3d2c6e' }}>
            UndanganDigital
          </span>
        </div>

        {/* Judul halaman — hanya di desktop */}
        <h1 className="hidden lg:block font-semibold text-lg" style={{ color: '#3d2c6e' }}>
          {title}
        </h1>
      </div>

      {/* ── Kanan: Profile avatar + dropdown ── */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setDropdownOpen((o) => !o)}
          className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-xl transition-colors"
          onMouseEnter={(e) => (e.currentTarget.style.background = '#F4EEFF')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
        >
          {/* Avatar */}
          <div
            className="w-8 h-8 rounded-full text-white font-bold text-xs flex items-center justify-center shrink-0"
            style={{
              background: 'linear-gradient(135deg, #A6B1E1, #6b72b8)',
              boxShadow: '0 2px 6px rgba(166,177,225,0.4)',
            }}
          >
            {initials}
          </div>

          {/* Info user — hanya di desktop */}
          <div className="hidden lg:block text-left">
            <p className="text-sm font-medium leading-tight" style={{ color: '#3d2c6e' }}>
              {user.name}
            </p>
            <p className="text-xs leading-tight" style={{ color: '#8b7fb5' }}>
              {user.email}
            </p>
          </div>

          {/* Chevron */}
          <svg className={`w-4 h-4 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} style={{ color: '#A6B1E1' }} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* ── Dropdown Menu ── */}
        {dropdownOpen && (
          <div
            className="absolute right-0 top-full mt-2 w-64 rounded-2xl overflow-hidden z-50"
            style={{
              background: '#ffffff',
              border: '1px solid #DCD6F7',
              boxShadow: '0 8px 32px rgba(166,177,225,0.25)',
            }}
          >
            {/* Profile card */}
            <div
              className="px-4 py-4 border-b"
              style={{
                background: 'linear-gradient(135deg, #F4EEFF, #ffffff)',
                borderColor: '#DCD6F7',
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-11 h-11 rounded-full text-white font-bold text-sm flex items-center justify-center shrink-0"
                  style={{
                    background: 'linear-gradient(135deg, #A6B1E1, #6b72b8)',
                    boxShadow: '0 2px 8px rgba(166,177,225,0.4)',
                  }}
                >
                  {initials}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-sm truncate" style={{ color: '#3d2c6e' }}>
                    {user.name}
                  </p>
                  <p className="text-xs truncate" style={{ color: '#8b7fb5' }}>
                    {user.email}
                  </p>
                  <span className="inline-flex items-center mt-0.5 px-2 py-0.5 rounded-full text-xs font-medium capitalize" style={{ background: '#DCD6F7', color: '#3d2c6e' }}>
                    {user.role}
                  </span>
                </div>
              </div>
            </div>

            {/* Menu items */}
            <div className="p-1.5">
              {[
                {
                  href: '/dashboard',
                  label: 'Beranda',
                  icon: <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />,
                },
                {
                  href: '/dashboard/invitations',
                  label: 'Undangan Saya',
                  icon: <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />,
                },
                {
                  href: '/',
                  label: 'Lihat Situs',
                  icon: <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />,
                },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors"
                  style={{ color: '#4a3f6b' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#F4EEFF')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <svg className="w-4 h-4" style={{ color: '#A6B1E1' }} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    {item.icon}
                  </svg>
                  {item.label}
                </Link>
              ))}
            </div>

            {/* Logout */}
            <div className="p-1.5" style={{ borderTop: '1px solid #DCD6F7' }}>
              <button
                onClick={() => signOut({ callbackUrl: '/auth/login' })}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors"
                style={{ color: '#ef4444' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#fef2f2')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Keluar dari Akun
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
