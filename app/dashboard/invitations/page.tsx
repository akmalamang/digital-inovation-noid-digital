// app/dashboard/invitations/page.tsx
// Daftar semua undangan milik client yang login

import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function MyInvitationsPage() {
  const session = await getSession();
  if (!session) redirect('/auth/login');

  const invitations = await prisma.invitation.findMany({
    where: { userId: Number(session.user.id) },
    include: {
      theme: { select: { themeName: true, thumbnail: true } },
      weddingDetail: {
        select: {
          bridegroomShortName: true,
          brideShortName: true,
          akadDate: true,
          receptionDate: true,
        },
      },
      _count: { select: { guestBooks: true, galleries: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="space-y-4">
      <p className="text-slate-500 text-sm">{invitations.length} undangan ditemukan</p>

      {invitations.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-16 text-center">
          <p className="font-semibold text-slate-700 mb-1">Belum ada undangan</p>
          <p className="text-slate-400 text-sm">Hubungi admin untuk dibuatkan undangan.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {invitations.map((inv) => (
            <div key={inv.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:border-[#424874] hover:shadow-md transition-all">
              {/* Thumbnail */}
              <div className="h-44 bg-slate-100 relative overflow-hidden">
                {inv.theme.thumbnail ? (
                  <img src={inv.theme.thumbnail} alt={inv.theme.themeName} className="w-full h-full object-cover" />
                ) : (
                  <div className="flex items-center justify-center h-full text-slate-300">
                    <svg className="w-12 h-12" fill="none" stroke="currentColor" strokeWidth={1.2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
                <span className={`absolute top-3 right-3 px-2.5 py-0.5 rounded-full text-xs font-medium ${inv.isActive ? 'bg-emerald-500 text-white' : 'bg-slate-400 text-white'}`}>{inv.isActive ? 'Aktif' : 'Nonaktif'}</span>
              </div>

              {/* Info */}
              <div className="p-5">
                <p className="font-semibold text-slate-800">
                  {inv.weddingDetail ? `${inv.weddingDetail.bridegroomShortName} & ${inv.weddingDetail.brideShortName}` : <span className="text-slate-400 italic font-normal text-sm">Detail belum diisi</span>}
                </p>
                <p className="font-mono text-[#424874] text-xs mt-0.5">/{inv.slug}</p>

                {/* Tanggal resepsi */}
                {inv.weddingDetail?.receptionDate && (
                  <p className="text-slate-500 text-xs mt-2 flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {new Date(inv.weddingDetail.receptionDate).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                )}

                {/* Statistik */}
                <div className="flex gap-4 mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500">
                  <span>{inv._count.galleries} foto</span>
                  <span>{inv._count.guestBooks} ucapan</span>
                  <span className="ml-auto">{inv.theme.themeName}</span>
                </div>

                {/* Tombol aksi */}
                <div className="flex gap-2 mt-4">
                  <Link href={`/dashboard/invitations/${inv.id}`} className="flex-1 text-center bg-[#424874] hover:bg-[#151b4f] text-white text-sm font-medium py-2 rounded-lg transition-colors">
                    Kelola
                  </Link>
                  <a
                    href={`/${inv.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 text-center border border-slate-200 hover:border-[#A6B1E1] text-slate-600 hover:text-[#424874] text-sm font-medium py-2 rounded-lg transition-colors"
                  >
                    Lihat →
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
