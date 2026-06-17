import { connection } from 'next/server';
import { Suspense } from 'react';

import { Inbox } from 'lucide-react';

import { MessagesTable } from '@/components/admin/MessagesTable';
import { PageHeader } from '@/components/admin/PageHeader';
import { prisma } from '@/lib/prisma';

async function MessagesContent() {
  await connection();
  const messages = await prisma.contactMessage.findMany({
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  const initialMessages = messages.map((m) => ({
    id: m.id,
    name: m.name,
    email: m.email,
    phone: m.phone,
    message: m.message,
    read: m.read,
    createdAt: m.createdAt.toISOString(),
  }));

  const unreadCount = initialMessages.filter((m) => !m.read).length;

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrowIcon={<Inbox size={11} />}
        eyebrow="Resumen · Mensajes"
        title="Buzón de contacto"
        description="Mensajes enviados desde el formulario de la landing."
        meta={
          <span className="border-border bg-muted/30 text-muted-foreground inline-flex items-center gap-1.5 rounded-[var(--admin-radius)] border px-2.5 py-1 font-mono text-[10px] tracking-[0.18em] uppercase">
            <span className="admin-status-dot text-emerald-400" />
            {initialMessages.length} mensajes · {unreadCount} sin leer
          </span>
        }
      />
      <MessagesTable initialMessages={initialMessages} />
    </div>
  );
}

export default function MessagesPage() {
  return (
    <Suspense fallback={null}>
      <MessagesContent />
    </Suspense>
  );
}
