import { NextResponse } from 'next/server';

import { withAdminAuth } from '@/lib/auth-guard';
import { prisma } from '@/lib/prisma';
import { emailSettingsFormSchema } from '@/validations/admin';

const KEYS = ['notification_email', 'notifications_enabled'] as const;

export const GET = withAdminAuth(async () => {
  const settings = await prisma.setting.findMany({ where: { key: { in: [...KEYS] } } });
  const byKey = Object.fromEntries(settings.map((s) => [s.key, s.value]));
  return NextResponse.json({
    notificationEmail: byKey.notification_email ?? '',
    notificationsEnabled: byKey.notifications_enabled !== 'false',
  });
});

export const PUT = withAdminAuth(async (req) => {
  const body = await req.json().catch(() => null);
  const parsed = emailSettingsFormSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid data' }, { status: 422 });
  }

  const { notificationEmail, notificationsEnabled } = parsed.data;

  await prisma.$transaction([
    prisma.setting.upsert({
      where: { key: 'notification_email' },
      update: { value: notificationEmail },
      create: { key: 'notification_email', value: notificationEmail },
    }),
    prisma.setting.upsert({
      where: { key: 'notifications_enabled' },
      update: { value: String(notificationsEnabled) },
      create: { key: 'notifications_enabled', value: String(notificationsEnabled) },
    }),
  ]);

  return NextResponse.json({ success: true });
});
