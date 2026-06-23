'use client';

import { useEffect, useState } from 'react';

import {
  Activity,
  BarChart3,
  Eye,
  Globe,
  Inbox,
  Loader2,
  MessageSquareWarning,
  ShieldAlert,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { StatCard } from '@/components/admin/StatCard';
import axiosInstance from '@/lib/axios';

type AnalyticsData = {
  totals: { allTime: number; last7d: number; last30d: number };
  daily: Array<{ date: string; views: number }>;
  topPaths: Array<{ path: string; views: number }>;
  byLocale: Array<{ locale: string; views: number }>;
  messages: { total: number; unread: number };
  cspReportsLast7d: number;
  ga4Id: string | null;
};

export function AnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    axiosInstance
      .get<AnalyticsData>('/api/admin/analytics')
      .then((r) => {
        if (!cancelled) setData(r.data);
      })
      .catch(() => {
        if (!cancelled) setError('No se pudieron cargar las estadísticas.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="text-muted-foreground flex items-center gap-2 text-sm">
        <Loader2 size={14} className="animate-spin" />
        Cargando…
      </div>
    );
  }

  if (error || !data) {
    return <p className="text-destructive text-sm">{error ?? 'Sin datos.'}</p>;
  }

  return (
    <div className="space-y-6">
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard icon={Eye} label="Visitas (7d)" value={data.totals.last7d} />
        <StatCard icon={Activity} label="Visitas (30d)" value={data.totals.last30d} />
        <StatCard icon={BarChart3} label="Total" value={data.totals.allTime} />
        <StatCard icon={Inbox} label="Mensajes sin leer" value={data.messages.unread} />
      </section>

      <section className="admin-hairline bg-card/40 rounded-[var(--admin-radius-lg)] p-5 sm:p-6">
        <header className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-foreground text-sm font-semibold tracking-tight">
              Visitas diarias (últimos 30 días)
            </h2>
            <p className="text-muted-foreground text-xs">
              Cada navegación a una página del sitio público genera un hit.
            </p>
          </div>
        </header>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.daily}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: 'currentColor' }}
                tickFormatter={(d: string) => d.slice(5)}
                stroke="rgba(255,255,255,0.3)"
              />
              <YAxis
                tick={{ fontSize: 10, fill: 'currentColor' }}
                allowDecimals={false}
                stroke="rgba(255,255,255,0.3)"
              />
              <Tooltip
                contentStyle={{
                  background: 'rgba(20,20,20,0.95)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 6,
                  fontSize: 12,
                }}
                labelStyle={{ color: 'rgba(255,255,255,0.7)' }}
              />
              <Line
                type="monotone"
                dataKey="views"
                stroke="rgb(110,231,183)"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="admin-hairline bg-card/40 rounded-[var(--admin-radius-lg)] p-5 sm:p-6">
          <header className="mb-4 flex items-center gap-3">
            <div className="border-border bg-muted/40 text-muted-foreground flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--admin-radius)] border">
              <Globe size={14} />
            </div>
            <div>
              <h2 className="text-foreground text-sm font-semibold tracking-tight">
                Por idioma (30d)
              </h2>
              <p className="text-muted-foreground text-xs">Distribución es vs en.</p>
            </div>
          </header>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.byLocale}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="locale" tick={{ fontSize: 12, fill: 'currentColor' }} />
                <YAxis tick={{ fontSize: 10, fill: 'currentColor' }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(20,20,20,0.95)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 6,
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="views" fill="rgb(110,231,183)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="admin-hairline bg-card/40 rounded-[var(--admin-radius-lg)] p-5 sm:p-6">
          <header className="mb-4 flex items-center gap-3">
            <div className="border-border bg-muted/40 text-muted-foreground flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--admin-radius)] border">
              <BarChart3 size={14} />
            </div>
            <div>
              <h2 className="text-foreground text-sm font-semibold tracking-tight">
                Top paths (30d)
              </h2>
              <p className="text-muted-foreground text-xs">Páginas más vistas.</p>
            </div>
          </header>
          {data.topPaths.length === 0 ? (
            <p className="text-muted-foreground text-sm">Sin datos todavía.</p>
          ) : (
            <ul className="space-y-1.5">
              {data.topPaths.map((p) => (
                <li
                  key={p.path}
                  className="border-border/40 flex items-center justify-between gap-3 border-b py-1.5 text-xs last:border-0"
                >
                  <code className="text-foreground/80 truncate font-mono">{p.path}</code>
                  <span className="text-muted-foreground font-mono">{p.views}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="grid gap-3 sm:grid-cols-2">
        <div className="admin-hairline bg-card/40 flex items-center justify-between gap-3 rounded-[var(--admin-radius-lg)] p-4">
          <div className="flex items-center gap-3">
            <MessageSquareWarning
              size={16}
              className={data.cspReportsLast7d > 0 ? 'text-amber-400' : 'text-muted-foreground'}
            />
            <div>
              <p className="text-foreground text-sm font-medium">Violaciones CSP (7d)</p>
              <p className="text-muted-foreground text-xs">Reportadas por el browser.</p>
            </div>
          </div>
          <span className="font-mono text-lg">{data.cspReportsLast7d}</span>
        </div>
        <div className="admin-hairline bg-card/40 flex items-center justify-between gap-3 rounded-[var(--admin-radius-lg)] p-4">
          <div className="flex items-center gap-3">
            <ShieldAlert
              size={16}
              className={data.ga4Id ? 'text-emerald-400' : 'text-muted-foreground'}
            />
            <div>
              <p className="text-foreground text-sm font-medium">Google Analytics 4</p>
              <p className="text-muted-foreground text-xs">
                {data.ga4Id ? `ID: ${data.ga4Id}` : 'No configurado'}
              </p>
            </div>
          </div>
          {data.ga4Id && (
            <a
              href={`https://analytics.google.com/analytics/web/#/p${data.ga4Id.replace(/^G-/, '')}/reports/intelligenthome`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-400 hover:underline"
            >
              Abrir GA4 ↗
            </a>
          )}
        </div>
      </section>
    </div>
  );
}
