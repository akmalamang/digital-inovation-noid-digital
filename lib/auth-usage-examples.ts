// CONTOH: Cara pakai requireAuth & requireAdmin di API route
// Simpan file ini sebagai referensi, bukan file aktif

// ─── Contoh 1: API yang butuh login (role apapun) ────────────────────────────
//
// import { requireAuth } from "@/lib/session";
//
// export async function GET() {
//   const session = await requireAuth();
//   if (session instanceof Response) return session; // Kembalikan 401 jika belum login
//
//   // Lanjut proses — session.user sudah tersedia
//   const invitations = await prisma.invitation.findMany({
//     where: { userId: Number(session.user.id) },
//   });
//   return ok(invitations);
// }

// ─── Contoh 2: API khusus admin ───────────────────────────────────────────────
//
// import { requireAdmin } from "@/lib/session";
//
// export async function DELETE(req, { params }) {
//   const session = await requireAdmin();
//   if (session instanceof Response) return session; // Kembalikan 401/403
//
//   await prisma.user.delete({ where: { id: Number(params.id) } });
//   return ok({ message: "User dihapus" });
// }

// ─── Contoh 3: Ambil session di Server Component ──────────────────────────────
//
// import { getSession } from "@/lib/session";
// import { redirect } from "next/navigation";
//
// export default async function MyPage() {
//   const session = await getSession();
//   if (!session) redirect("/auth/login");
//
//   return <div>Halo {session.user.name}</div>;
// }

// ─── Contoh 4: Ambil session di Client Component ──────────────────────────────
//
// "use client";
// import { useSession, signOut } from "next-auth/react";
//
// export function Navbar() {
//   const { data: session } = useSession();
//
//   return (
//     <nav>
//       <span>{session?.user.name}</span>
//       <button onClick={() => signOut({ callbackUrl: "/auth/login" })}>
//         Logout
//       </button>
//     </nav>
//   );
// }
