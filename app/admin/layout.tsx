// app/admin/layout.tsx
// Layout utama Admin Panel — sidebar kiri, konten kanan
// Server Component: cek session, redirect jika bukan admin

import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';

export const metadata = { title: 'Admin Panel — Wedding Invitation' };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  // Hanya admin yang boleh masuk
  if (!session || session.user.role !== 'admin') {
    redirect('/auth/login');
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar kiri — fixed */}
      <AdminSidebar />

      {/* Area konten kanan */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <AdminHeader user={session.user} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
