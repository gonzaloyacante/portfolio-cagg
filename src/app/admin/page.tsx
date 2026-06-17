import { headers } from 'next/headers';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';

import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Activity,
  ArrowRight,
  Building2,
  ChevronRight,
  FileText,
  Image as ImageIcon,
  Inbox,
  Mail,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from 'lucide-react';

import AdminLayout from '@/components/admin/AdminLayout';
import { PageHeader } from '@/components/admin/PageHeader';
import { StatCard } from '@/components/admin/StatCard';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const QUICK_LINKS = [
  { href: '/admin/messages', label: 'Mensajes', desc: 'Buzón de contacto', icon: Inbox },
  { href: '/admin/hero', label: 'Hero', desc: 'Inicio de la landing', icon: Sparkles },
  { href: '/admin/brands', label: 'Marcas', desc: 'Empresas y clientes', icon: Building2 },
  { href: '/admin/projects', label: 'Proyectos', desc: 'Casos y resultados', icon: FileText },
  { href: '/admin/media', label: 'Imágenes', desc: 'Galería de assets', icon: ImageIcon },
  { href: '/admin/security', label: 'Seguridad', desc: '2FA y cuenta', icon: ShieldCheck },
] as const;

async function DashboardContent() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect('/admin/login');

  const [unreadCount, recentMessages, totalMessages, totalProjects, totalBrands] =
    await Promise.all([
      prisma.contactMessage.count({ where: { read: false } }),
      prisma.contactMessage.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      prisma.contactMessage.count(),
      prisma.project.count(),
      prisma.brand.count(),
    ]);

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Buenos días';
    if (h < 19) return 'Buenas tardes';
    return 'Buenas noches';
  })();

  return (
    <AdminLayout userEmail={session.user.email}>
      <div className="space-y-8">
        <PageHeader
          eyebrow="Resumen"
          title={`${greeting}, Carlos`}
          description="Esto es lo que está pasando en tu portfolio hoy."
          meta={
            <span className="border-border bg-muted/30 text-muted-foreground inline-flex items-center gap-1.5 rounded-[var(--admin-radius)] border px-2.5 py-1 font-mono text-[10px] tracking-[0.18em] uppercase">
              <span className="admin-status-dot text-emerald-400" />
              Sesión activa · {session.user.email}
            </span>
          }
        />

        {/* Stats grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={Inbox}
            label="Sin leer"
            value={unreadCount}
            hint={
              totalMessages > 0 ? (
                <>
                  <TrendingUp size={11} /> {totalMessages} totales
                </>
              ) : (
                'Sin mensajes'
              )
            }
            trend={unreadCount > 0 ? 'up' : 'neutral'}
          />
          <StatCard
            icon={FileText}
            label="Proyectos"
            value={totalProjects}
            hint="Casos publicados"
            trend="neutral"
          />
          <StatCard
            icon={Building2}
            label="Marcas"
            value={totalBrands}
            hint="Empresas en cartera"
            trend="neutral"
          />
          <StatCard
            icon={Mail}
            label="Mensajes"
            value={totalMessages}
            hint="Histórico total"
            trend="neutral"
          />
        </div>

        {/* Quick links + Recent messages */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          {/* Recent messages */}
          <div className="lg:col-span-2">
            <div className="admin-hairline bg-card/40 overflow-hidden rounded-[var(--admin-radius-lg)]">
              <header className="border-border flex items-center justify-between border-b px-5 py-3.5">
                <div className="flex items-center gap-2.5">
                  <div className="border-border bg-muted/40 text-muted-foreground flex h-7 w-7 items-center justify-center rounded-md border">
                    <Inbox size={13} />
                  </div>
                  <div>
                    <h2 className="text-foreground text-sm font-semibold tracking-tight">
                      Mensajes recientes
                    </h2>
                    <p className="text-muted-foreground text-[11px]">Últimos 5 mensajes</p>
                  </div>
                </div>
                <Link
                  href="/admin/messages"
                  className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-xs font-medium transition-colors"
                >
                  Ver todos
                  <ArrowRight size={11} />
                </Link>
              </header>
              {recentMessages.length === 0 ? (
                <div className="px-6 py-10 text-center">
                  <p className="text-muted-foreground text-sm">Sin mensajes todavía.</p>
                </div>
              ) : (
                <ul className="divide-border divide-y">
                  {recentMessages.map((msg) => (
                    <li
                      key={msg.id}
                      className={`hover:bg-muted/30 flex items-center justify-between gap-4 px-5 py-3.5 transition-colors ${
                        !msg.read ? 'bg-foreground/[0.02]' : ''
                      }`}
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                            !msg.read
                              ? 'bg-foreground text-background'
                              : 'border-border bg-muted/40 text-muted-foreground border'
                          }`}
                        >
                          {msg.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1 space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span
                              className={`truncate text-sm font-medium ${
                                !msg.read ? 'text-foreground' : 'text-muted-foreground'
                              }`}
                            >
                              {msg.name}
                            </span>
                            {!msg.read && (
                              <span className="bg-foreground/15 text-foreground inline-flex shrink-0 items-center gap-1 rounded-full px-1.5 py-0.5 font-mono text-[9px] tracking-widest uppercase">
                                Nuevo
                              </span>
                            )}
                          </div>
                          <p className="text-muted-foreground truncate text-xs">{msg.email}</p>
                        </div>
                      </div>
                      <div className="text-muted-foreground shrink-0 font-mono text-[10px] tracking-[0.18em] uppercase">
                        {formatDistanceToNow(msg.createdAt, {
                          locale: es,
                          addSuffix: true,
                          includeSeconds: false,
                        })}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Quick links */}
          <div className="admin-hairline bg-card/40 overflow-hidden rounded-[var(--admin-radius-lg)]">
            <header className="border-border flex items-center gap-2.5 border-b px-5 py-3.5">
              <div className="border-border bg-muted/40 text-muted-foreground flex h-7 w-7 items-center justify-center rounded-md border">
                <Activity size={13} />
              </div>
              <div>
                <h2 className="text-foreground text-sm font-semibold tracking-tight">
                  Accesos rápidos
                </h2>
                <p className="text-muted-foreground text-[11px]">Secciones frecuentes</p>
              </div>
            </header>
            <ul className="divide-border divide-y">
              {QUICK_LINKS.map((q) => {
                const Icon = q.icon;
                return (
                  <li key={q.href}>
                    <Link
                      href={q.href}
                      className="group hover:bg-muted/30 flex items-center gap-3 px-5 py-3 transition-colors"
                    >
                      <div className="border-border bg-muted/30 text-muted-foreground group-hover:text-foreground flex h-8 w-8 shrink-0 items-center justify-center rounded-md border transition-colors">
                        <Icon size={13} />
                      </div>
                      <div className="min-w-0 flex-1 space-y-0.5">
                        <p className="text-foreground group-hover:text-foreground truncate text-sm font-medium transition-colors">
                          {q.label}
                        </p>
                        <p className="text-muted-foreground truncate text-[11px]">{q.desc}</p>
                      </div>
                      <ChevronRight
                        size={12}
                        className="text-muted-foreground/40 group-hover:text-muted-foreground transition-all group-hover:translate-x-0.5"
                      />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export default function AdminDashboardPage() {
  return (
    <Suspense fallback={null}>
      <DashboardContent />
    </Suspense>
  );
}
