import { Pool } from 'pg';

import { PrismaPg } from '@prisma/adapter-pg';

import { PrismaClient } from '@/generated/prisma/client';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is required to initialize Prisma');
}

/**
 * Pool tuned for Neon free tier.
 * max: 3 — never exhaust compute hours
 * idleTimeoutMillis: 10_000 — release idle connections so Neon can suspend
 * connectionTimeoutMillis: 10_000 — fail fast instead of hanging
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  prismaPool: Pool | undefined;
  prismaAdapter: PrismaPg | undefined;
};

const pool =
  globalForPrisma.prismaPool ??
  new Pool({
    connectionString,
    ssl: { rejectUnauthorized: true },
    max: 3,
    idleTimeoutMillis: 10_000,
    connectionTimeoutMillis: 10_000,
  });

const adapter = globalForPrisma.prismaAdapter ?? new PrismaPg(pool);

function createPrismaClient() {
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
  globalForPrisma.prismaPool = pool;
  globalForPrisma.prismaAdapter = adapter;
}
