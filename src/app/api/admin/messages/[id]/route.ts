import { NextResponse } from 'next/server';

import { z } from 'zod';

import { withAdminAuth } from '@/lib/auth-guard';
import { prisma } from '@/lib/prisma';

const patchSchema = z.object({
  read: z.boolean(),
});

export const PATCH = withAdminAuth(async (req, { params }) => {
  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid data', issues: parsed.error.issues },
      { status: 422 }
    );
  }
  try {
    const item = await prisma.contactMessage.update({
      where: { id },
      data: { read: parsed.data.read },
    });
    return NextResponse.json(item);
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
});

export const DELETE = withAdminAuth(async (_req, { params }) => {
  const { id } = await params;
  try {
    await prisma.contactMessage.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
});
