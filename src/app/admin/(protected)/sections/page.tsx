import { connection } from 'next/server';
import { Suspense } from 'react';

import { SectionMetaForm } from '@/components/admin/SectionMetaForm';
import { prisma } from '@/lib/prisma';

async function SectionsContent() {
  await connection();
  const sections = await prisma.sectionMeta.findMany({ orderBy: { slug: 'asc' } });

  return (
    <div className="space-y-6">
      <div>
        <p className="text-label tracking-label text-muted-foreground mb-1 font-mono uppercase">
          Contenido · Secciones
        </p>
        <h1 className="text-foreground text-xl font-semibold">Etiquetas de sección</h1>
      </div>

      <div className="space-y-8">
        {sections.map((section) => (
          <div key={section.slug} className="border-border border p-6">
            <h2 className="text-foreground border-border mb-6 border-b pb-2 text-sm font-semibold tracking-wider uppercase">
              {section.slug}
            </h2>
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
