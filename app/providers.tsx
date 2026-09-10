'use client';
// app/providers.tsx
// Wrapper SessionProvider dari NextAuth
// Harus "use client" karena memakai React context

import { SessionProvider } from 'next-auth/react';

export function Providers({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
