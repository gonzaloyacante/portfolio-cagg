import { NextResponse } from 'next/server';

import { withAdminAuth } from '@/lib/auth-guard';
import { prisma } from '@/lib/prisma';
import { revalidateLanding } from '@/lib/revalidate';
import { projectSchema } from '@/validations/admin';

export const PUT = withAdminAuth(async (req, { params }) => {
  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = projectSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid data', issues: parsed.error.issues },
      { status: 422 }
    );
  }
  try {
    const item = await prisma.project.update({ where: { id }, data: parsed.data });
    revalidateLanding();
    return NextResponse.json(item);
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
});

export const DELETE = withAdminAuth(async (_req, { params }) => {
  const { id } = await params;
  try {
    await prisma.project.delete({ where: { id } });
    revalidateLanding();
    return new NextResponse(null, { status: 204 });
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
});
