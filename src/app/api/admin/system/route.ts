import { NextResponse } from 'next/server';

import { z } from 'zod';

import { withAdminAuth } from '@/lib/auth-guard';
import { prisma } from '@/lib/prisma';
import { revalidateLanding } from '@/lib/revalidate';

const updateSchema = z.object({
  acceptingProjects: z.boolean(),
});

const KEY = 'accepting_projects';

export const GET = withAdminAuth(async () => {
  const setting = await prisma.setting.findUnique({ where: { key: KEY } });
  return NextResponse.json({
    acceptingProjects: setting?.value !== 'false',
  });
});

export const PUT = withAdminAuth(async (req) => {
  const body = await req.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid data' }, { status: 422 });
  }

  await prisma.setting.upsert({
    where: { key: KEY },
    update: { value: String(parsed.data.acceptingProjects) },
    create: { key: KEY, value: String(parsed.data.acceptingProjects) },
  });

  revalidateLanding();
  return NextResponse.json({ success: true });
});
