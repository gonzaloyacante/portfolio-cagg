import { connection } from 'next/server';
import { Suspense } from 'react';

import { MessagesTable } from '@/components/admin/MessagesTable';
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
    <div className="space-y-6">
      <div>
        <p className="text-label tracking-label text-muted-foreground mb-1 font-mono uppercase">
          Resumen · Mensajes
        </p>
        <h1 className="text-foreground text-xl font-semibold">
          Mensajes
          {unreadCount > 0 && (
            <span className="bg-foreground/10 text-foreground ml-3 rounded-none px-2 py-0.5 text-sm font-semibold">
              {unreadCount} sin leer
            </span>
          )}
        </h1>
      </div>
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
