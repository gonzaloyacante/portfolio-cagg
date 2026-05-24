import { notFound } from 'next/navigation';
import { connection } from 'next/server';
import { Suspense } from 'react';

import { HeroForm } from '@/components/admin/HeroForm';
import { prisma } from '@/lib/prisma';

async function HeroContent() {
  await connection();
  const hero = await prisma.hero.findFirst({
    include: { stats: { orderBy: { order: 'asc' } } },
  });

  if (!hero) notFound();

  const initial = {
    overlineEs: hero.overlineEs,
    overlineEn: hero.overlineEn,
    name: hero.name,
    headlineEs: hero.headlineEs,
    headlineEn: hero.headlineEn,
    summaryEs: hero.summaryEs,
    summaryEn: hero.summaryEn,
    ctaWhatsappEs: hero.ctaWhatsappEs,
    ctaWhatsappEn: hero.ctaWhatsappEn,
    ctaEmailEs: hero.ctaEmailEs,
    ctaEmailEn: hero.ctaEmailEn,
    ctaLinkedinEs: hero.ctaLinkedinEs,
    ctaLinkedinEn: hero.ctaLinkedinEn,
    stats: hero.stats.map(({ value, labelEs, labelEn, order }) => ({
      value,
      labelEs,
      labelEn,
      order,
    })),
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-label tracking-label text-muted-foreground mb-1 font-mono uppercase">
          Contenido · Hero
        </p>
        <h1 className="text-foreground text-xl font-semibold">Hero</h1>
      </div>
      <HeroForm initial={initial} />
    </div>
  );
}

export default function HeroPage() {
  return (
    <Suspense fallback={null}>
      <HeroContent />
    </Suspense>
  );
}
