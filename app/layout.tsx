// app/layout.tsx
// Root layout — bungkus seluruh app dengan SessionProvider
// agar session bisa diakses dari komponen manapun

import type { Metadata } from 'next';
import { Providers } from './providers';
import './global.css';

export const metadata: Metadata = {
  title: 'Wedding Invitation',
  description: 'Platform undangan digital pernikahan',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
