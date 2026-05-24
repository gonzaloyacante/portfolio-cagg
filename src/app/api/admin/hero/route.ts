import { NextResponse } from 'next/server';

import { withAdminAuth } from '@/lib/auth-guard';
import { prisma } from '@/lib/prisma';
import { revalidateLanding } from '@/lib/revalidate';
import { heroUpdateSchema } from '@/validations/admin';

export const GET = withAdminAuth(async () => {
  const hero = await prisma.hero.findFirst({ include: { stats: { orderBy: { order: 'asc' } } } });
  if (!hero) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(hero);
});

export const PUT = withAdminAuth(async (req) => {
  const body = await req.json().catch(() => null);
  const parsed = heroUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid data', issues: parsed.error.issues },
      { status: 422 }
    );
  }

  const existing = await prisma.hero.findFirst();
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const { stats, ...heroFields } = parsed.data;

  await prisma.$transaction(async (tx) => {
    await tx.hero.update({ where: { id: existing.id }, data: heroFields });
    if (stats !== undefined) {
      await tx.heroStat.deleteMany({ where: { heroId: existing.id } });
      if (stats.length > 0) {
        await tx.heroStat.createMany({
          data: stats.map((s, i) => ({ ...s, heroId: existing.id, order: s.order ?? i })),
        });
      }
    }
  });

  const updated = await prisma.hero.findFirst({
    include: { stats: { orderBy: { order: 'asc' } } },
  });
  revalidateLanding();
  return NextResponse.json(updated);
});
