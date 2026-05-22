import { NextResponse } from 'next/server';

import { withAdminAuth } from '@/lib/auth-guard';
import { prisma } from '@/lib/prisma';

export const GET = withAdminAuth(async () => {
  const sections = await prisma.sectionMeta.findMany({ orderBy: { slug: 'asc' } });
  return NextResponse.json(sections);
});
