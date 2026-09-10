'use client';
// components/dashboard/DashboardSidebar.tsx
// Desktop: sidebar kiri | Mobile: bottom navigation bar (seperti Instagram)

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  {
    href: '/dashboard',
    label: 'Beranda',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    href: '/dashboard/invitations',
    label: 'Undangan',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    href: '/',
    label: 'Beranda',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
      </svg>
    ),
    isExternal: true,
  },
];

export default function DashboardSidebar() {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === '/') return false; // link ke beranda tidak pernah "aktif"
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  }

  return (
    <>
      {/* ── Sidebar Desktop (lg ke atas) ── */}
      <aside className="hidden lg:flex w-60 h-full bg-[#A6B1E1] flex-col shrink-0">
        {/* Brand */}
        <div className="px-5 py-6 border-b border-[#DCD6F7]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#424874] flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
              </svg>
            </div>
            <div>
              <p className="text-white font-semibold text-sm leading-tight">UndanganDigital</p>
              <p className="text-slate-100 text-xs">Dashboard</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          <p className="text-slate-100 text-xs font-medium uppercase tracking-wider px-3 mb-3">Menu</p>
          {navItems
            .filter((item) => !item.isExternal)
            .map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive(item.href) ? 'bg-[#424874] text-white' : 'text-slate-100 hover:text-white hover:bg-[#424874]'}`}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
        </nav>

        {/* Footer */}
        <div className="px-3 py-4 border-t border-slate-800">
          <Link href="/" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-100 hover:text-white hover:bg-slate-800 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            Kembali ke Beranda
          </Link>
        </div>
      </aside>

      {/* ── Bottom Navigation Mobile (di bawah lg) ── */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 safe-area-pb">
        <div className="flex items-center justify-around px-2 py-1">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link key={item.href} href={item.href} className="flex flex-col items-center gap-0.5 px-4 py-2 rounded-xl transition-colors min-w-0 flex-1">
                {/* Icon */}
                <span className={`transition-colors ${active ? 'text-rose-500' : 'text-slate-400'}`}>{item.icon}</span>

                {/* Label */}
                <span className={`text-xs font-medium transition-colors truncate ${active ? 'text-rose-500' : 'text-slate-400'}`}>{item.label}</span>

                {/* Dot indikator aktif */}
                {active && <span className="w-1 h-1 rounded-full bg-rose-500 mt-0.5" />}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Spacer bawah di mobile supaya konten tidak tertutup bottom nav */}
      <div className="lg:hidden h-16 shrink-0" />
    </>
  );
}
