import { NextResponse } from 'next/server';

import { withAdminAuth } from '@/lib/auth-guard';
import { prisma } from '@/lib/prisma';
import { revalidateLanding } from '@/lib/revalidate';
import { brandSchema } from '@/validations/admin';

export const GET = withAdminAuth(async () => {
  const items = await prisma.brand.findMany({ orderBy: { order: 'asc' } });
  return NextResponse.json(items);
});

export const POST = withAdminAuth(async (req) => {
  const body = await req.json().catch(() => null);
  const parsed = brandSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid data', issues: parsed.error.issues },
      { status: 422 }
    );
  }
  const item = await prisma.brand.create({ data: parsed.data });
  revalidateLanding();
  return NextResponse.json(item, { status: 201 });
});
