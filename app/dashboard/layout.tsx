// app/dashboard/layout.tsx
// Layout dashboard client — sidebar di desktop, bottom nav di mobile

import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import DashboardHeader from '@/components/dashboard/DashboardHeader';

export const metadata = { title: 'Dashboard — Undangan Digital' };

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect('/auth/login');

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar — hanya muncul di desktop (lg ke atas) */}
      <DashboardSidebar />

      {/* Area konten kanan */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <DashboardHeader user={session.user} />

        {/* Main content — tambah padding bawah di mobile untuk bottom nav */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 pb-20 lg:pb-6">{children}</main>
      </div>
    </div>
  );
}
