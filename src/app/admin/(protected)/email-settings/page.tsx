import { EmailSettingsForm } from '@/components/admin/EmailSettingsForm';
import { prisma } from '@/lib/prisma';

export default async function EmailSettingsPage() {
  const settings = await prisma.setting.findMany({
    where: { key: { in: ['notification_email', 'notifications_enabled'] } },
  });
  const byKey = Object.fromEntries(settings.map((s) => [s.key, s.value]));

  const initial = {
    notificationEmail: byKey.notification_email ?? '',
    notificationsEnabled: byKey.notifications_enabled !== 'false',
  };

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <p className="text-label tracking-label text-muted-foreground mb-1 font-mono uppercase">
          Sistema · Notificaciones
        </p>
        <h1 className="text-foreground text-xl font-semibold">Notificaciones por email</h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Configurá el email donde querés recibir un aviso cada vez que alguien te envíe un mensaje
          desde el sitio.
        </p>
      </div>
      <EmailSettingsForm initial={initial} />
    </div>
  );
}
