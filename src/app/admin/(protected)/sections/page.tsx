import { connection } from 'next/server';
import { Suspense } from 'react';

import { Tags } from 'lucide-react';

import { PageHeader } from '@/components/admin/PageHeader';
import { SectionMetaForm } from '@/components/admin/SectionMetaForm';
import { prisma } from '@/lib/prisma';

async function SectionsContent() {
  await connection();
  const sections = await prisma.sectionMeta.findMany({ orderBy: { slug: 'asc' } });

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrowIcon={<Tags size={11} />}
        eyebrow="Contenido · Secciones"
        title="Etiquetas de sección"
        description="Personalizá el eyebrow, título y descripción de cada sección de la landing."
      />

      <div className="space-y-5">
        {sections.map((section) => (
          <div
            key={section.slug}
            className="admin-hairline bg-card/40 rounded-[var(--admin-radius-lg)] p-5 sm:p-6"
          >
            <header className="mb-5 flex items-center gap-2.5">
              <div className="border-border bg-muted/40 text-muted-foreground flex h-7 w-7 items-center justify-center rounded-md border font-mono text-[10px] tracking-widest uppercase">
                {section.slug.slice(0, 2)}
              </div>
              <h2 className="text-foreground text-sm font-semibold tracking-tight">
                /{section.slug}
              </h2>
            </header>
            <SectionMetaForm
              slug={section.slug}
              initial={{
                overlineEs: section.overlineEs ?? '',
                overlineEn: section.overlineEn ?? '',
                titleEs: section.titleEs ?? '',
                titleEn: section.titleEn ?? '',
                descEs: section.descEs ?? '',
                descEn: section.descEn ?? '',
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function SectionsPage() {
  return (
    <Suspense fallback={null}>
      <SectionsContent />
    </Suspense>
  );
}
