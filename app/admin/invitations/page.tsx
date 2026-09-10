// app/admin/invitations/page.tsx
// Halaman daftar semua undangan — Server Component

import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import InvitationActions from '@/components/admin/InvitationActions';

export default async function InvitationsPage() {
  const invitations = await prisma.invitation.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { username: true, email: true } },
      theme: { select: { themeName: true } },
      weddingDetail: { select: { bridegroomShortName: true, brideShortName: true } },
      _count: { select: { guestBooks: true, galleries: true } },
    },
  });

  return (
    <div className="space-y-4">
      {/* Header + Tombol Tambah */}
      <div className="flex items-center justify-between">
        <p className="text-slate-500 text-sm">{invitations.length} undangan ditemukan</p>
        <Link href="/admin/invitations/create" className="inline-flex items-center gap-2 bg-[#A6B1E1] hover:bg-[#424874] text-slate-100 hover:text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Buat Undangan
        </Link>
      </div>

      {/* Tabel */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left px-6 py-3 text-slate-400 font-medium">Pasangan</th>
                <th className="text-left px-6 py-3 text-slate-400 font-medium">Slug / URL</th>
                <th className="text-left px-6 py-3 text-slate-400 font-medium">Pemilik</th>
                <th className="text-left px-6 py-3 text-slate-400 font-medium">Tema</th>
                <th className="text-left px-6 py-3 text-slate-400 font-medium">Foto</th>
                <th className="text-left px-6 py-3 text-slate-400 font-medium">Ucapan</th>
                <th className="text-left px-6 py-3 text-slate-400 font-medium">Status</th>
                <th className="text-left px-6 py-3 text-slate-400 font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {invitations.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-400">
                    <p className="font-medium">Belum ada undangan</p>
                    <p className="text-xs mt-1">Buat undangan pertama dengan klik tombol di atas</p>
                  </td>
                </tr>
              ) : (
                invitations.map((inv) => (
                  <tr key={inv.id} className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors">
                    {/* Nama pasangan */}
                    <td className="px-6 py-4">
                      {inv.weddingDetail ? (
                        <span className="font-medium text-slate-800">
                          {inv.weddingDetail.bridegroomShortName} &amp; {inv.weddingDetail.brideShortName}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic text-xs">Belum diisi</span>
                      )}
                    </td>

                    {/* Slug */}
                    <td className="px-6 py-4">
                      <a href={`/${inv.slug}`} target="_blank" rel="noopener noreferrer" className="font-mono text-[#424874] hover:underline text-xs">
                        /{inv.slug}
                      </a>
                    </td>

                    <td className="px-6 py-4 text-slate-600">{inv.user.username}</td>
                    <td className="px-6 py-4 text-slate-600">{inv.theme.themeName}</td>
                    <td className="px-6 py-4 text-slate-500">{inv._count.galleries}</td>
                    <td className="px-6 py-4 text-slate-500">{inv._count.guestBooks}</td>

                    {/* Badge status */}
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${inv.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>{inv.isActive ? 'Aktif' : 'Nonaktif'}</span>
                    </td>

                    {/* Action buttons — client component */}
                    <td className="px-6 py-4">
                      <InvitationActions id={inv.id} slug={inv.slug} isActive={inv.isActive} />
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
