import { notFound } from 'next/navigation';
import { connection } from 'next/server';
import { Suspense } from 'react';

import { Sparkles } from 'lucide-react';

import { HeroForm } from '@/components/admin/HeroForm';
import { PageHeader } from '@/components/admin/PageHeader';
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
    portraitUrl: hero.portraitUrl ?? null,
    stats: hero.stats.map(({ value, labelEs, labelEn, order }) => ({
      value,
      labelEs,
      labelEn,
      order,
    })),
  };

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrowIcon={<Sparkles size={11} />}
        eyebrow="Contenido · Hero"
        title="Sección principal"
        description="Lo primero que ve alguien cuando entra a tu sitio. Aparece arriba de todo, antes de hacer scroll."
        previewUrl="/#top"
        previewLabel="Ver Hero en vivo"
      />
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
