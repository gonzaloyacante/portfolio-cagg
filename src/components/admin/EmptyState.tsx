import type { ReactNode } from 'react';

import type { LucideIcon } from 'lucide-react';

import { cn } from '@/lib/utils';

type EmptyStateProps = {
  /** Lucide icon shown in a soft square */
  icon?: LucideIcon;
  /** Main title (e.g. "Sin marcas todavía") */
  title: ReactNode;
  /** Optional description below */
  description?: ReactNode;
  /** Optional CTA — usually a Button */
  action?: ReactNode;
  /** Optional className for the wrapper */
  className?: string;
};

/**
 * Beautiful empty state for admin pages. Subtle gradient mesh + icon chip
 * + clear CTA. Used by CollectionPage when there are no items.
 */
export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'admin-mesh border-border/70 bg-card/30 relative flex flex-col items-center justify-center gap-4 overflow-hidden rounded-[var(--admin-radius-lg)] border border-dashed px-6 py-16 text-center',
        className
      )}
    >
      <div className="border-border bg-muted/30 flex h-14 w-14 items-center justify-center rounded-[var(--admin-radius-lg)] border shadow-[var(--shadow-admin-sm)]">
        {Icon ? (
          <Icon size={20} className="text-muted-foreground" />
        ) : (
          <span className="text-muted-foreground/60 text-xl">∅</span>
        )}
      </div>
      <div className="space-y-1.5">
        <p className="text-foreground text-sm font-semibold">{title}</p>
        {description && (
          <p className="text-muted-foreground mx-auto max-w-sm text-xs leading-relaxed">
            {description}
          </p>
        )}
      </div>
      {action && <div className="pt-1">{action}</div>}
    </div>
  );
}
