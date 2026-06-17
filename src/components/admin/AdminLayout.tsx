'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';

import {
  Activity,
  Bell,
  Building2,
  Calendar,
  ChevronLeft,
  Command,
  FileText,
  GraduationCap,
  HelpCircle,
  Image as ImageIcon,
  Inbox,
  Layers,
  LogOut,
  type LucideIcon,
  Menu,
  MessageSquareQuote,
  Quote,
  Settings,
  ShieldCheck,
  Sliders,
  Sparkles,
  Star,
  Tags,
  Wrench,
  X,
} from 'lucide-react';

import { CommandPalette, openCommandPalette } from '@/components/admin/CommandPalette';
import { Toaster } from '@/components/ui/sonner';
import { ADMIN_NAV, ADMIN_NAV_GROUPS } from '@/constants/admin-config';
import { authClient } from '@/lib/auth-client';
import { cn } from '@/lib/utils';

const ICON_BY_HREF: Record<string, LucideIcon> = {
  '/admin': Activity,
  '/admin/messages': Inbox,
  '/admin/hero': Sparkles,
  '/admin/contact-info': MessageSquareQuote,
  '/admin/brands': Building2,
  '/admin/experience': Wrench,
  '/admin/process': Layers,
  '/admin/services': Star,
  '/admin/projects': FileText,
  '/admin/results': Calendar,
  '/admin/testimonials': Quote,
  '/admin/timeline': GraduationCap,
  '/admin/faqs': HelpCircle,
  '/admin/sections': Tags,
  '/admin/media': ImageIcon,
  '/admin/email-settings': Bell,
  '/admin/system': Sliders,
  '/admin/security': ShieldCheck,
};

const GROUP_ICON: Record<string, LucideIcon> = {
  Resumen: Activity,
  Contenido: Layers,
  Sistema: Settings,
};

type AdminLayoutProps = {
  children: ReactNode;
  userEmail: string;
};

export default function AdminLayout({ children, userEmail }: AdminLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [now, setNow] = useState<string>('');

  useEffect(() => {
    const update = () => {
      const d = new Date();
      setNow(
        d.toLocaleTimeString('es-ES', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        })
      );
    };
    update();
    const id = setInterval(update, 30_000);
    return () => clearInterval(id);
  }, []);

  const isActive = (href: string) =>
    href === '/admin' ? pathname === '/admin' : pathname.startsWith(href);

  const activeItem = ADMIN_NAV.find((n) => isActive(n.href));
  const activeLabel = activeItem?.label ?? 'Panel';

  const handleSignOut = async () => {
    await authClient.signOut();
    router.push('/admin/login');
  };

  return (
    <div
      data-testid="admin-layout"
      data-vt="admin-shell"
      className="admin-mesh bg-background text-foreground relative flex min-h-dvh"
    >
      {open && (
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Cerrar menú"
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        data-vt="admin-sidebar"
        className={cn(
          'border-border bg-card/95 fixed inset-y-0 left-0 z-40 flex flex-col border-r backdrop-blur-md transition-all duration-300 ease-out lg:sticky lg:top-0 lg:h-dvh lg:translate-x-0',
          collapsed ? 'lg:w-[68px]' : 'lg:w-64',
          'w-72',
          open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Logo */}
        <div className="border-border flex items-center justify-between border-b px-4 py-4">
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            data-testid="admin-logo-link"
            className="group flex min-w-0 items-center gap-3"
          >
            <span className="border-border bg-foreground text-background font-display relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-[var(--admin-radius)] text-sm font-bold transition-transform group-hover:scale-105">
              <span className="relative z-10">CG</span>
              <span
                aria-hidden
                className="absolute inset-0 bg-gradient-to-br from-white/15 to-transparent"
              />
            </span>
            <div className="min-w-0 leading-tight">
              <div
                className={cn(
                  'text-foreground font-display truncate text-sm font-semibold tracking-tight transition-opacity',
                  collapsed && 'lg:hidden'
                )}
              >
                Panel admin
              </div>
              <div
                className={cn(
                  'text-muted-foreground/70 truncate font-mono text-[10px] tracking-[0.18em] uppercase',
                  collapsed && 'lg:hidden'
                )}
              >
                Carlos A. Guerra
              </div>
            </div>
          </Link>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="text-muted-foreground hover:text-foreground hover:bg-muted shrink-0 rounded-md p-1.5 transition-colors lg:hidden"
            aria-label="Cerrar menú"
          >
            <X size={16} />
          </button>
        </div>

        {/* Quick search trigger */}
        <div className="px-3 pt-3">
          <button
            type="button"
            onClick={() => openCommandPalette()}
            data-testid="admin-search-trigger"
            className={cn(
              'border-border bg-muted/30 text-muted-foreground hover:text-foreground hover:bg-muted/60 flex w-full items-center gap-2.5 rounded-[var(--admin-radius)] border px-3 py-2 text-xs transition-colors',
              collapsed && 'lg:justify-center lg:px-2'
            )}
          >
            <Search size={13} />
            <span className={cn('flex-1 text-left', collapsed && 'lg:hidden')}>Buscar…</span>
            <kbd
              className={cn(
                'border-border bg-background/60 text-muted-foreground hidden items-center gap-0.5 rounded-md border px-1.5 py-0.5 font-mono text-[9px] tracking-widest uppercase sm:inline-flex',
                collapsed && 'lg:hidden'
              )}
            >
              <Command size={9} /> K
            </kbd>
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {ADMIN_NAV_GROUPS.map((group) => {
            const items = ADMIN_NAV.filter((n) => n.group === group);
            const GroupIcon = GROUP_ICON[group] ?? Layers;
            return (
              <div key={group} className="mb-5">
                <div
                  className={cn(
                    'text-muted-foreground/60 mb-1.5 flex items-center gap-2 px-3 font-mono text-[10px] tracking-[0.18em] uppercase',
                    collapsed && 'lg:justify-center lg:px-0'
                  )}
                >
                  <GroupIcon size={11} />
                  <span className={cn(collapsed && 'lg:hidden')}>{group}</span>
                </div>
                <ul className="space-y-0.5">
                  {items.map((item) => {
                    const active = isActive(item.href);
                    const ItemIcon = ICON_BY_HREF[item.href] ?? Layers;
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          onClick={() => setOpen(false)}
                          data-testid={`admin-nav-${item.href.split('/').pop()}`}
                          title={collapsed ? item.label : undefined}
                          className={cn(
                            'group relative flex items-center gap-2.5 rounded-[var(--admin-radius)] px-3 py-2 text-sm transition-all duration-150',
                            active
                              ? 'bg-foreground/5 text-foreground font-medium'
                              : 'text-muted-foreground hover:text-foreground hover:bg-muted/40',
                            collapsed && 'lg:justify-center lg:px-2'
                          )}
                        >
                          {active && (
                            <span
                              aria-hidden
                              className="bg-foreground absolute top-1/2 left-0 h-5 w-[2px] -translate-y-1/2 rounded-r-full"
                            />
                          )}
                          <ItemIcon
                            size={14}
                            className={cn(
                              'shrink-0 transition-colors',
                              active ? 'text-foreground' : 'text-muted-foreground/70'
                            )}
                          />
                          <span
                            className={cn('truncate transition-opacity', collapsed && 'lg:hidden')}
                          >
                            {item.label}
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </nav>

        {/* Collapse toggle (desktop only) */}
        <button
          type="button"
          onClick={() => setCollapsed((c) => !c)}
          className={cn(
            'text-muted-foreground hover:text-foreground border-border hover:bg-muted/40 bg-card absolute -right-3 bottom-20 hidden h-6 w-6 items-center justify-center rounded-full border shadow-sm transition-colors lg:flex',
            collapsed && 'rotate-180'
          )}
          aria-label={collapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
          data-testid="admin-sidebar-toggle"
        >
          <ChevronLeft size={11} />
        </button>

        {/* User + logout */}
        <div className="border-border border-t p-3">
          <div
            className={cn(
              'border-border bg-muted/30 flex items-center gap-3 rounded-[var(--admin-radius)] border p-3',
              collapsed && 'lg:flex-col lg:gap-1.5 lg:p-2'
            )}
          >
            <div className="border-border bg-foreground text-background relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold">
              <span className="relative z-10">{userEmail.slice(0, 2).toUpperCase()}</span>
              <span
                aria-hidden
                className="absolute inset-0 rounded-full bg-gradient-to-br from-white/20 to-transparent"
              />
            </div>
            <div className={cn('min-w-0 flex-1 space-y-1 self-center', collapsed && 'lg:hidden')}>
              <div
                className="text-foreground block w-full truncate text-xs leading-tight font-medium"
                title={userEmail}
              >
                {userEmail}
              </div>
              <div className="text-muted-foreground/70 flex items-center gap-1.5 font-mono text-[9px] tracking-[0.18em] uppercase">
                <span className="admin-status-dot-static text-emerald-400" />
                Administrador
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={handleSignOut}
            data-testid="admin-logout-btn"
            className={cn(
              'text-muted-foreground hover:text-destructive hover:bg-destructive/10 mt-2 inline-flex w-full items-center gap-2 rounded-[var(--admin-radius)] px-3 py-2 text-xs font-medium transition-colors',
              collapsed && 'lg:justify-center lg:px-2'
            )}
            title={collapsed ? 'Cerrar sesión' : undefined}
          >
            <LogOut size={13} />
            <span className={cn(collapsed && 'lg:hidden')}>Cerrar sesión</span>
          </button>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header
          data-vt="admin-header"
          className="admin-glass border-border sticky top-0 z-20 flex h-14 items-center justify-between border-b px-4 lg:px-6"
        >
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="text-muted-foreground hover:text-foreground hover:bg-muted shrink-0 rounded-md p-1.5 transition-colors lg:hidden"
              aria-label="Abrir menú"
              data-testid="admin-mobile-menu"
            >
              <Menu size={18} />
            </button>
            <div className="flex min-w-0 items-center gap-2.5">
              <span className="text-muted-foreground/60 font-mono text-[10px] tracking-[0.18em] uppercase">
                Admin
              </span>
              <ChevronLeft size={11} className="text-muted-foreground/30 rotate-180" />
              <span className="text-foreground truncate text-sm font-medium tracking-tight">
                {activeLabel}
              </span>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            <span className="text-muted-foreground/60 hidden font-mono text-[10px] tracking-[0.18em] uppercase sm:inline">
              {now}
            </span>
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              data-testid="admin-view-site"
              className="text-muted-foreground hover:text-foreground hover:bg-muted inline-flex items-center gap-1.5 rounded-[var(--admin-radius)] px-2.5 py-1.5 text-xs font-medium transition-colors"
            >
              Ver sitio
              <svg
                width="11"
                height="11"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M7 17 17 7" />
                <path d="M7 7h10v10" />
              </svg>
            </a>
          </div>
        </header>

        <main data-vt="admin-main" className="max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          <div className="animate-[var(--animate-fade-up)]">{children}</div>
        </main>
      </div>

      <CommandPalette />
      <Toaster position="bottom-right" richColors closeButton />
    </div>
  );
}

// Inline search icon — avoids adding a new import
function Search(props: { size?: number; className?: string }) {
  return (
    <svg
      width={props.size ?? 16}
      height={props.size ?? 16}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={props.className}
      aria-hidden
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}
