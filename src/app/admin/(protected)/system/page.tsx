import { connection } from 'next/server';
import { Suspense } from 'react';

import { Sliders } from 'lucide-react';

import { PageHeader } from '@/components/admin/PageHeader';
import { SystemSettingsForm } from '@/components/admin/SystemSettingsForm';
import { prisma } from '@/lib/prisma';

async function SystemContent() {
  await connection();
  const setting = await prisma.setting.findUnique({ where: { key: 'accepting_projects' } });

  const initial = {
    acceptingProjects: setting?.value !== 'false',
  };

  return (
    <div className="mx-auto max-w-2xl space-y-7">
      <PageHeader
        eyebrowIcon={<Sliders size={11} />}
        eyebrow="Sistema · Sitio"
        title="Configuración del sitio"
        description="Opciones generales que controlan el comportamiento del sitio público."
      />
      <SystemSettingsForm initial={initial} />
    </div>
  );
}

export default function SystemPage() {
  return (
    <Suspense fallback={null}>
      <SystemContent />
    </Suspense>
  );
}
