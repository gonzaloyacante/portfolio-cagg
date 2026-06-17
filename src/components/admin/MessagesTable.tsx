'use client';

import { useState } from 'react';

import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { Inbox, Mail, MailOpen, Search, Trash2, X } from 'lucide-react';

import { EmptyState } from '@/components/admin/EmptyState';
import { Button } from '@/components/ui/button';
import { useMessages } from '@/hooks/use-messages';
import { cn } from '@/lib/utils';

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

type Filter = 'all' | 'unread' | 'read';

export function MessagesTable({ initialMessages }: MessagesTableProps) {
  const { pending, markRead, remove } = useMessages();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>('all');
  const [query, setQuery] = useState('');

  const filtered = initialMessages.filter((msg) => {
    if (filter === 'unread' && msg.read) return false;
    if (filter === 'read' && !msg.read) return false;
    if (query) {
      const q = query.toLowerCase();
      return (
        msg.name.toLowerCase().includes(q) ||
        msg.email.toLowerCase().includes(q) ||
        msg.message.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const counts = {
    all: initialMessages.length,
    unread: initialMessages.filter((m) => !m.read).length,
    read: initialMessages.filter((m) => m.read).length,
  };

  if (initialMessages.length === 0) {
    return (
      <EmptyState
        icon={Inbox}
        title="Buzón vacío"
        description="Cuando alguien complete el formulario de contacto, los mensajes aparecen acá."
      />
    );
  }

  return (
    <div className="space-y-5">
      {/* Filter bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="border-border bg-muted/30 inline-flex items-center gap-1 rounded-[var(--admin-radius)] border p-1">
          {(
            [
              { id: 'all', label: 'Todos' },
              { id: 'unread', label: 'Sin leer' },
              { id: 'read', label: 'Leídos' },
            ] as const
          ).map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              data-testid={`messages-filter-${f.id}`}
              className={cn(
                'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-all',
                filter === f.id
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {f.label}
              <span className="text-muted-foreground/70 font-mono text-[10px] tabular-nums">
                {counts[f.id]}
              </span>
            </button>
          ))}
        </div>
        <div className="border-border bg-muted/30 flex items-center gap-2 rounded-[var(--admin-radius)] border px-2.5 py-1.5">
          <Search size={12} className="text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nombre, email o mensaje…"
            className="placeholder:text-muted-foreground/70 w-56 bg-transparent text-xs outline-none"
            data-testid="messages-search"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="text-muted-foreground hover:text-foreground"
            >
              <X size={11} />
            </button>
          )}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Search}
          title="Sin resultados"
          description={`No encontramos mensajes con esos filtros.`}
          action={
            <Button
              variant="outline"
              onClick={() => {
                setFilter('all');
                setQuery('');
              }}
              className="gap-1.5"
            >
              <X size={12} />
              Limpiar filtros
            </Button>
          }
        />
      ) : (
        <ul className="space-y-2" data-testid="messages-list">
          {filtered.map((msg) => (
            <li
              key={msg.id}
              data-testid={`message-${msg.id}`}
              className={cn(
                'admin-hairline admin-card-hover bg-card/40 rounded-[var(--admin-radius-lg)] p-4',
                !msg.read && 'ring-foreground/10 ring-1'
              )}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <div
                      className={cn(
                        'flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold',
                        !msg.read
                          ? 'bg-foreground text-background'
                          : 'border-border bg-muted/40 text-muted-foreground border'
                      )}
                    >
                      {msg.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            'truncate text-sm font-semibold',
                            !msg.read ? 'text-foreground' : 'text-muted-foreground'
                          )}
                        >
                          {msg.name}
                        </span>
                        {!msg.read && (
                          <span className="bg-foreground/15 text-foreground inline-flex shrink-0 items-center gap-1 rounded-full px-1.5 py-0.5 font-mono text-[9px] tracking-widest uppercase">
                            Nuevo
                          </span>
                        )}
                      </div>
                      <p className="text-muted-foreground truncate text-xs">
                        {msg.email}
                        {msg.phone ? ` · ${msg.phone}` : ''}
                      </p>
                      <p className="text-muted-foreground/70 mt-0.5 font-mono text-[10px] tracking-[0.18em] uppercase">
                        {formatDistanceToNow(new Date(msg.createdAt), {
                          locale: es,
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    onClick={() => markRead(msg.id, !msg.read)}
                    disabled={pending === msg.id}
                    className="text-muted-foreground hover:text-foreground hover:bg-muted inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium transition-colors"
                    aria-label={msg.read ? 'Marcar como no leído' : 'Marcar como leído'}
                  >
                    {msg.read ? <Mail size={12} /> : <MailOpen size={12} />}
                    {msg.read ? 'No leído' : 'Leído'}
                  </button>
                  {confirmDeleteId === msg.id ? (
                    <div className="flex items-center gap-1">
                      <Button
                        size="xs"
                        variant="destructive"
                        onClick={() => remove(msg.id)}
                        disabled={pending === msg.id}
                      >
                        Eliminar
                      </Button>
                      <Button size="xs" variant="outline" onClick={() => setConfirmDeleteId(null)}>
                        Cancelar
                      </Button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteId(msg.id)}
                      className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium transition-colors"
                      aria-label="Eliminar mensaje"
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              </div>

              <div className="mt-3">
                <p
                  className={cn(
                    'text-sm leading-relaxed',
                    !msg.read ? 'text-foreground' : 'text-muted-foreground',
                    expanded === msg.id ? '' : 'line-clamp-2'
                  )}
                >
                  {msg.message}
                </p>
                {msg.message.length > 120 && (
                  <button
                    type="button"
                    onClick={() => setExpanded(expanded === msg.id ? null : msg.id)}
                    className="text-muted-foreground hover:text-foreground mt-1.5 text-xs font-medium underline underline-offset-2 transition-colors"
                  >
                    {expanded === msg.id ? 'Ver menos' : 'Ver más'}
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
