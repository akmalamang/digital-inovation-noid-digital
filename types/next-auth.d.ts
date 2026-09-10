// types/next-auth.d.ts
// Extend tipe bawaan NextAuth agar TypeScript tahu ada field tambahan
// yaitu: id dan role di dalam session.user

import 'next-auth';
import 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      role: string; // "admin" | "client"
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: string;
  }
}
