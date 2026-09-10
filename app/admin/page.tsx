// app/admin/page.tsx
// Dashboard utama Admin — tampilkan stat ringkasan dan aktivitas terbaru
// Server Component: fetch data langsung dari Prisma

import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export default async function AdminDashboardPage() {
  // Fetch semua angka statistik secara paralel
  const [totalInvitations, totalUsers, totalThemes, totalGuestBooks, recentInvitations] = await Promise.all([
    prisma.invitation.count(),
    prisma.user.count(),
    prisma.theme.count(),
    prisma.guestBook.count(),
    // 5 undangan terbaru untuk ditampilkan di tabel ringkasan
    prisma.invitation.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { username: true } },
        theme: { select: { themeName: true } },
        _count: { select: { guestBooks: true } },
      },
    }),
  ]);

  const stats = [
    {
      label: 'Total Undangan',
      value: totalInvitations,
      color: 'bg-violet-50 text-violet-600',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      href: '/admin/invitations',
    },
    {
      label: 'Pengguna Terdaftar',
      value: totalUsers,
      color: 'bg-sky-50 text-sky-600',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      ),
      href: '/admin/users',
    },
    {
      label: 'Tema Tersedia',
      value: totalThemes,
      color: 'bg-emerald-50 text-emerald-600',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      href: '/admin/themes',
    },
    {
      label: 'Total Ucapan',
      value: totalGuestBooks,
      color: 'bg-rose-50 text-rose-600',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      ),
      href: '/admin/guest-books',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href} className="bg-white rounded-xl border border-slate-200 p-5 hover:border-violet-300 hover:shadow-sm transition-all group">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-slate-500 text-sm">{stat.label}</p>
                <p className="text-3xl font-bold text-slate-800 mt-1">{stat.value}</p>
              </div>
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${stat.color}`}>{stat.icon}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* Tabel Undangan Terbaru */}
      <div className="bg-white rounded-xl border border-slate-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-800">Undangan Terbaru</h2>
          <Link href="/admin/invitations" className="text-violet-600 text-sm font-medium hover:underline">
            Lihat semua →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left px-6 py-3 text-slate-400 font-medium">Slug</th>
                <th className="text-left px-6 py-3 text-slate-400 font-medium">Pemilik</th>
                <th className="text-left px-6 py-3 text-slate-400 font-medium">Tema</th>
                <th className="text-left px-6 py-3 text-slate-400 font-medium">Ucapan</th>
                <th className="text-left px-6 py-3 text-slate-400 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentInvitations.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                    Belum ada undangan
                  </td>
                </tr>
              ) : (
                recentInvitations.map((inv) => (
                  <tr key={inv.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-3 font-mono text-violet-700">{inv.slug}</td>
                    <td className="px-6 py-3 text-slate-600">{inv.user.username}</td>
                    <td className="px-6 py-3 text-slate-600">{inv.theme.themeName}</td>
                    <td className="px-6 py-3 text-slate-600">{inv._count.guestBooks}</td>
                    <td className="px-6 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${inv.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                        {inv.isActive ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
