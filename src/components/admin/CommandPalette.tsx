'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';

import {
  Activity,
  Bell,
  type LucideIcon,
  Search,
  Settings,
  ShieldCheck,
  Sliders,
  Sparkles,
  X,
} from 'lucide-react';

import { ADMIN_NAV } from '@/constants/admin-config';
import { cn } from '@/lib/utils';

type PaletteItem = {
  href: string;
  label: string;
  group: string;
  icon: LucideIcon;
  shortcut?: string;
};

const ICON_BY_HREF: Record<string, LucideIcon> = {
  '/admin': Activity,
  '/admin/messages': Bell,
  '/admin/hero': Sparkles,
  '/admin/contact-info': Activity,
  '/admin/brands': Activity,
  '/admin/experience': Activity,
  '/admin/process': Activity,
  '/admin/services': Activity,
  '/admin/projects': Activity,
  '/admin/results': Activity,
  '/admin/testimonials': Activity,
  '/admin/timeline': Activity,
  '/admin/faqs': Activity,
  '/admin/sections': Activity,
  '/admin/media': Activity,
  '/admin/email-settings': Bell,
  '/admin/system': Sliders,
  '/admin/security': ShieldCheck,
  '/admin/login': Settings,
};

function buildItems(): PaletteItem[] {
  return ADMIN_NAV.map((n) => ({
    href: n.href,
    label: n.label,
    group: n.group,
    icon: ICON_BY_HREF[n.href] ?? Activity,
  }));
}

const ITEMS = buildItems();

const OPEN_EVENT = 'admin:command-palette:open';

/**
 * Open the command palette programmatically. Used by the sidebar
 * search trigger (and any other place we want to open it).
 */
export function openCommandPalette() {
  window.dispatchEvent(new CustomEvent(OPEN_EVENT));
}

/**
 * Cmd+K (Ctrl+K) command palette. Linear/Vercel-style quick navigation.
 * Mounts globally; toggles a floating search input.
 */
export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const isMod = e.metaKey || e.ctrlKey;
      if (isMod && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((o) => !o);
        setQuery('');
        setActiveIndex(0);
      } else if (e.key === 'Escape' && open) {
        setOpen(false);
      }
    };
    const onOpenEvent = () => {
      setOpen(true);
      setQuery('');
      setActiveIndex(0);
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener(OPEN_EVENT, onOpenEvent);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener(OPEN_EVENT, onOpenEvent);
    };
  }, [open]);

  const filtered = useMemo(
    () =>
      ITEMS.filter((item) =>
        query === '' ? true : item.label.toLowerCase().includes(query.toLowerCase())
      ),
    [query]
  );

  // Clamp the active index to the current filtered list.
  const safeActiveIndex = Math.min(activeIndex, Math.max(0, filtered.length - 1));

  if (!open) return null;

  const onSelect = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(filtered.length - 1, i + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(0, i - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const target = filtered[safeActiveIndex];
      if (target) onSelect(target.href);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Buscar en el panel"
      className="fixed inset-0 z-[100] flex items-start justify-center px-4 pt-[12vh]"
    >
      <button
        type="button"
        aria-label="Cerrar buscador"
        onClick={() => setOpen(false)}
        className="absolute inset-0 animate-[var(--animate-fade-up)] bg-black/55 backdrop-blur-sm"
      />
      <div
        className="admin-glass admin-hairline relative w-full max-w-lg animate-[var(--animate-scale-in)] overflow-hidden rounded-[var(--admin-radius-lg)] shadow-[var(--shadow-admin-lg)]"
        data-testid="admin-command-palette"
      >
        <div className="border-border flex items-center gap-3 border-b px-4">
          <Search size={16} className="text-muted-foreground shrink-0" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Buscar sección, marca, página…"
            className="placeholder:text-muted-foreground/70 h-12 flex-1 bg-transparent text-sm outline-none"
            data-testid="admin-command-input"
          />
          <kbd className="border-border bg-muted/50 text-muted-foreground hidden items-center gap-1 rounded-md border px-1.5 py-0.5 font-mono text-[10px] sm:inline-flex">
            ESC
          </kbd>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="text-muted-foreground hover:text-foreground sm:hidden"
            aria-label="Cerrar"
          >
            <X size={16} />
          </button>
        </div>

        <ul className="max-h-[60vh] overflow-y-auto p-2" role="listbox">
          {filtered.length === 0 ? (
            <li className="text-muted-foreground px-3 py-8 text-center text-sm">
              Sin resultados para &ldquo;{query}&rdquo;
            </li>
          ) : (
            filtered.map((item, i) => {
              const Icon = item.icon;
              const active = i === safeActiveIndex;
              return (
                <li key={item.href} role="option" aria-selected={active}>
                  <Link
                    href={item.href}
                    onClick={() => onSelect(item.href)}
                    onMouseEnter={() => setActiveIndex(i)}
                    className={cn(
                      'flex items-center gap-3 rounded-[var(--admin-radius)] px-3 py-2.5 text-sm transition-colors',
                      active ? 'bg-foreground/5 text-foreground' : 'text-muted-foreground'
                    )}
                  >
                    <span
                      className={cn(
                        'flex h-7 w-7 items-center justify-center rounded-md border border-transparent',
                        active && 'border-border bg-background/60'
                      )}
                    >
                      <Icon size={13} />
                    </span>
                    <span className="flex-1 truncate font-medium">{item.label}</span>
                    <span className="text-muted-foreground/70 font-mono text-[10px] tracking-widest uppercase">
                      {item.group}
                    </span>
                  </Link>
                </li>
              );
            })
          )}
        </ul>

        <div className="border-border bg-muted/30 text-muted-foreground flex items-center justify-between gap-2 border-t px-3 py-2 text-[10px] tracking-widest uppercase">
          <span className="font-mono">↑↓ navegar · ↵ abrir</span>
          <span className="font-mono">{filtered.length} resultados</span>
        </div>
      </div>
    </div>
  );
}
