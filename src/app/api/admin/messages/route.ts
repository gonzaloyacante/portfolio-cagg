import { NextResponse } from 'next/server';

import { withAdminAuth } from '@/lib/auth-guard';
import { prisma } from '@/lib/prisma';

export const GET = withAdminAuth(async (req) => {
  const { searchParams } = new URL(req.url);
  const skip = Number(searchParams.get('skip') ?? '0');
  const limit = Number(searchParams.get('limit') ?? '50');

  const [items, total, unread] = await Promise.all([
    prisma.contactMessage.findMany({
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.contactMessage.count(),
    prisma.contactMessage.count({ where: { read: false } }),
  ]);

  return NextResponse.json({ items, total, unread });
});
