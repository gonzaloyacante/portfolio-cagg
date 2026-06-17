import { connection } from 'next/server';
import { Suspense } from 'react';

import { Bell } from 'lucide-react';

import { EmailSettingsForm } from '@/components/admin/EmailSettingsForm';
import { PageHeader } from '@/components/admin/PageHeader';
import { prisma } from '@/lib/prisma';

async function EmailSettingsContent() {
  await connection();
  const settings = await prisma.setting.findMany({
    where: { key: { in: ['notification_email', 'notifications_enabled'] } },
  });
  const byKey = Object.fromEntries(settings.map((s) => [s.key, s.value]));

  const initial = {
    notificationEmail: byKey.notification_email ?? '',
    notificationsEnabled: byKey.notifications_enabled !== 'false',
  };

  return (
    <div className="mx-auto max-w-2xl space-y-7">
      <PageHeader
        eyebrowIcon={<Bell size={11} />}
        eyebrow="Sistema · Notificaciones"
        title="Notificaciones por email"
        description="Recibí un email cada vez que alguien complete el formulario de contacto."
      />
      <EmailSettingsForm initial={initial} />
    </div>
  );
}

export default function EmailSettingsPage() {
  return (
    <Suspense fallback={null}>
      <EmailSettingsContent />
    </Suspense>
  );
}
