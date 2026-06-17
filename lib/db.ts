import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

// We use 'as any' to bypass the TypeScript check, as this configuration 
// is required by the Prisma runtime to establish the connection.
export const db =
  globalForPrisma.prisma ||
  new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  } as any);

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db;
}