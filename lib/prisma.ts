import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['query'], // Ini opsional, membantu memantau query di terminal
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
