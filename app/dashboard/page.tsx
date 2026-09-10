// app/dashboard/page.tsx
// Halaman beranda dashboard client — ringkasan undangan milik user

import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect('/auth/login');

  // Tambah ini untuk debug
  console.log('SESSION:', JSON.stringify(session, null, 2));
  console.log('USER ID:', session.user.id);
  console.log('USER ID NUMBER:', Number(session.user.id));

  // Ambil undangan milik user yang sedang login
  const invitations = await prisma.invitation.findMany({
    where: { userId: Number(session.user.id) },
    include: {
      theme: { select: { themeName: true, thumbnail: true } },
      weddingDetail: { select: { bridegroomShortName: true, brideShortName: true } },
      _count: { select: { guestBooks: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  const totalHadir = await prisma.guestBook.count({
    where: {
      invitation: { userId: Number(session.user.id) },
      rsvp: 'hadir',
    },
  });

  return (
    <div className="space-y-6">
      {/* Sambutan */}
      <div className="bg-gradient-to-br from-[#424874] to-[#A6B1E1] rounded-2xl p-6 text-white">
        <p className="text-rose-100 text-sm mb-1">Selamat datang kembali,</p>
        <h1 className="text-2xl font-bold">{session.user.name} 👋</h1>
        <p className="text-rose-100 text-sm mt-2">Kelola undangan pernikahanmu dari sini.</p>
      </div>

      {/* Stat ringkasan */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            label: 'Total Undangan',
            value: invitations.length,
            color: 'bg-violet-50 text-violet-600',
            icon: '✉',
          },
          {
            label: 'Undangan Aktif',
            value: invitations.filter((i) => i.isActive).length,
            color: 'bg-emerald-50 text-emerald-600',
            icon: '✓',
          },
          {
            label: 'Tamu Konfirmasi Hadir',
            value: totalHadir,
            color: 'bg-rose-50 text-rose-600',
            icon: '♥',
          },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-slate-200 p-5 flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-sm">{stat.label}</p>
              <p className="text-3xl font-bold text-slate-800 mt-1">{stat.value}</p>
            </div>
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-lg ${stat.color}`}>{stat.icon}</div>
          </div>
        ))}
      </div>

      {/* Daftar undangan */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-slate-800">Undangan Saya</h2>
          <Link href="/dashboard/invitations" className="text-[#424874] text-sm font-medium hover:underline">
            Lihat semua →
          </Link>
        </div>

        {invitations.length === 0 ? (
          /* Empty state */
          <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
            <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-[#424874]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="font-semibold text-slate-700 mb-1">Belum ada undangan</p>
            <p className="text-slate-400 text-sm mb-5">Hubungi admin untuk membuat undangan digitalmu.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {invitations.map((inv) => (
              <Link key={inv.id} href={`/dashboard/invitations/${inv.id}`} className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:border-[#424874] hover:shadow-md transition-all group">
                {/* Thumbnail tema */}
                <div className="h-36 bg-slate-100 relative overflow-hidden">
                  {inv.theme.thumbnail ? (
                    <img src={inv.theme.thumbnail} alt={inv.theme.themeName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="flex items-center justify-center h-full text-slate-300">
                      <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                  {/* Badge status */}
                  <span className={`absolute top-3 right-3 px-2.5 py-0.5 rounded-full text-xs font-medium ${inv.isActive ? 'bg-emerald-500 text-white' : 'bg-slate-400 text-white'}`}>{inv.isActive ? 'Aktif' : 'Nonaktif'}</span>
                </div>

                <div className="p-4">
                  {/* Nama pasangan */}
                  <p className="font-semibold text-slate-800 text-sm">{inv.weddingDetail ? `${inv.weddingDetail.bridegroomShortName} & ${inv.weddingDetail.brideShortName}` : 'Detail belum diisi'}</p>
                  <p className="font-mono text-[#424874] text-xs mt-0.5">/{inv.slug}</p>

                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                    <span className="text-xs text-slate-400">{inv.theme.themeName}</span>
                    <span className="text-xs text-slate-500">{inv._count.guestBooks} ucapan</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
