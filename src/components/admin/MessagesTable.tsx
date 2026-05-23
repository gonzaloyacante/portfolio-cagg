'use client';

import { useState } from 'react';

import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { Mail, MailOpen, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useMessages } from '@/hooks/use-messages';

export type MessageItem = {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  read: boolean;
  createdAt: string;
};

type MessagesTableProps = {
  initialMessages: MessageItem[];
};

export function MessagesTable({ initialMessages }: MessagesTableProps) {
  const { pending, markRead, remove } = useMessages();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  if (initialMessages.length === 0) {
    return <p className="text-muted-foreground text-sm">Sin mensajes todavía.</p>;
  }

  return (
    <div className="border-border divide-border divide-y border">
      {initialMessages.map((msg) => (
        <div key={msg.id} className={`px-5 py-4 ${!msg.read ? 'bg-card' : ''}`}>
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-3">
                <span
                  className={`text-sm font-semibold ${!msg.read ? 'text-foreground' : 'text-muted-foreground'}`}
                >
                  {msg.name}
                </span>
                {!msg.read && (
                  <span className="bg-foreground/10 text-foreground rounded-none px-2 py-0.5 text-xs font-semibold">
                    Nuevo
                  </span>
                )}
              </div>
              <div className="text-muted-foreground mt-0.5 text-xs">
                {msg.email}
                {msg.phone ? ` · ${msg.phone}` : ''}
              </div>
              <div className="text-muted-foreground mt-0.5 text-xs">
                {formatDistanceToNow(new Date(msg.createdAt), { locale: es, addSuffix: true })}
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-1">
              <button
                type="button"
                onClick={() => markRead(msg.id, !msg.read)}
                disabled={pending === msg.id}
                className="text-muted-foreground hover:text-foreground p-1.5 transition-colors"
                aria-label={msg.read ? 'Marcar como no leído' : 'Marcar como leído'}
                title={msg.read ? 'Marcar como no leído' : 'Marcar como leído'}
              >
                {msg.read ? <Mail size={14} /> : <MailOpen size={14} />}
              </button>

              {confirmDeleteId === msg.id ? (
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground text-xs">¿Eliminar?</span>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => remove(msg.id)}
                    disabled={pending === msg.id}
                  >
                    Sí
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setConfirmDeleteId(null)}>
                    No
                  </Button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmDeleteId(msg.id)}
                  className="text-muted-foreground hover:text-destructive p-1.5 transition-colors"
                  aria-label="Eliminar mensaje"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          </div>

          <div className="mt-3">
            <p
              className={`text-sm ${!msg.read ? 'text-foreground' : 'text-muted-foreground'} ${expanded === msg.id ? '' : 'line-clamp-2'}`}
            >
              {msg.message}
            </p>
            {msg.message.length > 120 && (
              <button
                type="button"
                onClick={() => setExpanded(expanded === msg.id ? null : msg.id)}
                className="text-muted-foreground mt-1 text-xs underline"
              >
                {expanded === msg.id ? 'Ver menos' : 'Ver más'}
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
