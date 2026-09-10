import { prisma } from '@/lib/prisma';
import { ok } from '@/lib/response';

export async function GET() {
  const guestBooks = await prisma.guestBook.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      invitation: {
        select: {
          slug: true,
          weddingDetail: {
            select: { bridegroomShortName: true, brideShortName: true },
          },
        },
      },
    },
  });

  return ok(guestBooks);
}
