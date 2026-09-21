// app/[slug]/page.tsx
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import WeddingTemplate from './Weddingtemplate';
import FloralPinkTemplate from './themes/FloralPinkTemplate';
import FloralGreenTemplate from './themes/FloralGreenTemplate';
import LavenderTemplate from './themes/Lavendertemplate';
import RoyalTemplate from './themes/Royaltemplate';
import RetroTemplate from './themes/RetroTemplate';

type Props = { params: Promise<{ slug: string }> };

// ── Serialize Date → string agar bisa dikirim ke client component ─────────────
function serializeInvitation(inv: any) {
  return {
    ...inv,
    weddingDetail: inv.weddingDetail
      ? {
          ...inv.weddingDetail,
          akadDate: inv.weddingDetail.akadDate instanceof Date ? inv.weddingDetail.akadDate.toISOString() : (inv.weddingDetail.akadDate ?? ''),
          akadTime: inv.weddingDetail.akadTime ?? '',
          receptionDate: inv.weddingDetail.receptionDate instanceof Date ? inv.weddingDetail.receptionDate.toISOString() : (inv.weddingDetail.receptionDate ?? ''),
          receptionTime: inv.weddingDetail.receptionTime ?? '',
        }
      : null,
    galleries: inv.galleries ?? [],
    digitalWallets: inv.digitalWallets ?? [],
    guestBooks: (inv.guestBooks ?? []).map((g: any) => ({
      ...g,
      createdAt: g.createdAt instanceof Date ? g.createdAt.toISOString() : g.createdAt,
    })),
  };
}

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

  const raw = await prisma.invitation.findUnique({
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

  if (!raw || !raw.isActive) notFound();

  // Serialize semua Date ke string
  const invitation = serializeInvitation(raw);

  if (invitation.themeId === 2) return <FloralPinkTemplate invitation={invitation as any} />;
  if (invitation.themeId === 3) return <FloralGreenTemplate invitation={invitation as any} />;
  if (invitation.themeId === 4) return <LavenderTemplate invitation={invitation as any} />;
  if (invitation.themeId === 5) return <RoyalTemplate invitation={invitation as any} />;
  if (invitation.themeId === 6) return <RetroTemplate invitation={invitation as any} />;

  return <WeddingTemplate invitation={invitation as any} />;
}
