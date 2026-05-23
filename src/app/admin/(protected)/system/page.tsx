import { SystemSettingsForm } from '@/components/admin/SystemSettingsForm';
import { prisma } from '@/lib/prisma';

export default async function SystemPage() {
  const setting = await prisma.setting.findUnique({ where: { key: 'accepting_projects' } });

  const initial = {
    acceptingProjects: setting?.value !== 'false',
  };

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <p className="text-label tracking-label text-muted-foreground mb-1 font-mono uppercase">
          Sistema · Sitio
        </p>
        <h1 className="text-foreground text-xl font-semibold">Configuración del sitio</h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Opciones generales que controlan el comportamiento del sitio.
        </p>
      </div>
      <SystemSettingsForm initial={initial} />
    </div>
  );
}
