import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

// We pass an empty object {} to satisfy the PrismaClientOptions requirement
export const db =
  globalForPrisma.prisma ||
  new PrismaClient({});

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db;
}