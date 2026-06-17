import type { ReactNode } from 'react';

import type { LucideIcon } from 'lucide-react';

import { cn } from '@/lib/utils';

type StatCardProps = {
  /** Big number / value */
  value: ReactNode;
  /** Small label below */
  label: ReactNode;
  /** Lucide icon — shown in the top-right */
  icon?: LucideIcon;
  /** Optional small change indicator (e.g. "+3 hoy") */
  hint?: ReactNode;
  /** Trend up / down — affects the hint color */
  trend?: 'up' | 'down' | 'neutral';
  /** Optional className for the wrapper */
  className?: ReactNode;
};

/**
 * Stat card used in the admin dashboard. Rounded, soft, with a subtle
 * gradient mesh and an icon chip in the corner.
 */
export function StatCard({
  value,
  label,
  icon: Icon,
  hint,
  trend = 'neutral',
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        'admin-hairline group bg-card/50 relative overflow-hidden rounded-[var(--admin-radius-lg)] p-5 backdrop-blur-sm transition-colors',
        className
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -top-12 -right-12 h-32 w-32 rounded-full bg-[radial-gradient(circle_at_center,color-mix(in_oklab,var(--foreground)_8%,transparent),transparent_60%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      />
      <div className="relative flex items-start justify-between gap-3">
        <div className="space-y-1.5">
          <p className="text-muted-foreground/80 font-mono text-[10px] tracking-[0.18em] uppercase">
            {label}
          </p>
          <p className="text-foreground admin-text-gradient text-3xl font-semibold tracking-tight tabular-nums">
            {value}
          </p>
          {hint && (
            <p
              className={cn(
                'flex items-center gap-1.5 text-xs',
                trend === 'up' && 'text-emerald-400',
                trend === 'down' && 'text-rose-400',
                trend === 'neutral' && 'text-muted-foreground'
              )}
            >
              {hint}
            </p>
          )}
        </div>
        {Icon && (
          <div className="border-border bg-muted/30 text-muted-foreground flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--admin-radius)] border">
            <Icon size={15} />
          </div>
        )}
      </div>
    </div>
  );
}
