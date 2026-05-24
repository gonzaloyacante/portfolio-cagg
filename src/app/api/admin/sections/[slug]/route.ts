import { NextResponse } from 'next/server';

import { withAdminAuth } from '@/lib/auth-guard';
import { prisma } from '@/lib/prisma';
import { revalidateLanding } from '@/lib/revalidate';
import { sectionMetaUpdateSchema } from '@/validations/admin';

export const PUT = withAdminAuth(async (req, { params }) => {
  const { slug } = await params;
  const body = await req.json().catch(() => null);
  const parsed = sectionMetaUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid data', issues: parsed.error.issues },
      { status: 422 }
    );
  }

  const section = await prisma.sectionMeta.upsert({
    where: { slug },
    create: { slug, ...parsed.data },
    update: parsed.data,
  });
  revalidateLanding();
  return NextResponse.json(section);
});
