// app/[slug]/page.tsx
// Halaman publik undangan — load tema berdasarkan themeId

import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import WeddingTemplate from './Weddingtemplate';
import FloralPinkTemplate from './themes/FloralPinkTemplate';
import FloralGreenTemplate from './themes/FloralGreenTemplate';
import LavenderTemplate from './themes/Lavendertemplate';
import RoyalTemplate from './themes/Royaltemplate';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const invitation = await prisma.invitation.findUnique({
    where: { slug },
    include: { weddingDetail: true },
  });

  if (!invitation?.weddingDetail) return { title: 'Undangan Digital' };

  const { bridegroomShortName, brideShortName } = invitation.weddingDetail;
  return {
    title: `Undangan ${bridegroomShortName} & ${brideShortName}`,
    description: `Kami mengundang kehadiran Anda di pernikahan ${bridegroomShortName} & ${brideShortName}`,
  };
}

export default async function InvitationPage({ params }: Props) {
  const { slug } = await params;

  const invitation = await prisma.invitation.findUnique({
    where: { slug },
    include: {
      theme: true,
      weddingDetail: true,
      galleries: true,
      digitalWallets: true,
      guestBooks: {
        orderBy: { createdAt: 'desc' },
        take: 50,
      },
    },
  });

  if (!invitation || !invitation.isActive) notFound();

  // Pilih template berdasarkan themeId
  // themeId 1 = Elegant Gold (default)
  // themeId 2 = Floral Pink
  if (invitation.themeId === 2) {
    return <FloralPinkTemplate invitation={invitation} />;
  }
  if (invitation.themeId === 3) {
    return <FloralGreenTemplate invitation={invitation} />;
  }

  if (invitation.themeId === 4) {
    return <LavenderTemplate invitation={invitation} />;
  }
  if (invitation.themeId === 5) {
    return <RoyalTemplate invitation={invitation} />;
  }

  // Default: tema 1
  return <WeddingTemplate invitation={invitation} />;
}
