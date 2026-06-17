import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

type SectionGroupProps = {
  /** Icon shown in the header. Pass a Lucide element (e.g. <User size={14} />). */
  icon?: ReactNode;
  /** Section title (e.g. "Identificación") */
  title: ReactNode;
  /** Optional small description */
  description?: ReactNode;
  /** Right-side actions (extra hints, badges) */
  actions?: ReactNode;
  /** Section body */
  children: ReactNode;
  /** Optional className for the wrapper */
  className?: string;
};

/**
 * Visual section group for forms. Replaces the brutal "border-b + h2"
 * pattern with a soft, well-spaced section that has a clear hierarchy.
 */
export function SectionGroup({
  icon,
  title,
  description,
  actions,
  children,
  className,
}: SectionGroupProps) {
  return (
    <section
      className={cn(
        'admin-hairline bg-card/40 relative rounded-[var(--admin-radius-lg)] p-5 sm:p-6',
        className
      )}
    >
      <header className="mb-5 flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          {icon && (
            <div className="border-border bg-muted/40 text-muted-foreground flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--admin-radius)] border">
              {icon}
            </div>
          )}
          <div className="space-y-0.5">
            <h2 className="text-foreground text-sm font-semibold tracking-tight">{title}</h2>
            {description && (
              <p className="text-muted-foreground text-xs leading-relaxed">{description}</p>
            )}
          </div>
        </div>
        {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
      </header>
      <div className="space-y-5">{children}</div>
    </section>
  );
}
