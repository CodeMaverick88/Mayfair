import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    // In Prisma 7, we pass the URL here instead of the schema
    datasource: {
      url: process.env.DATABASE_URL,
    },
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
