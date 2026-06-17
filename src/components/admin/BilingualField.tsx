import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

type BilingualFieldProps = {
  label: string;
  children: ReactNode;
  /** Optional className for the wrapper */
  className?: string;
  /** Description text shown under the label */
  description?: ReactNode;
  /** Optional icon shown next to the label (pass a Lucide element) */
  icon?: ReactNode;
};

/**
 * Side-by-side bilingual field. Two inputs (ES / EN) stacked in a
 * responsive grid, with a clean label and description above.
 *
 * The label and optional icon are used to visually group the two inputs.
 * Children should be exactly two elements (one per language) — they are
 * rendered in a 1-col layout on mobile and 2-col on `sm+`.
 */
export function BilingualField({
  label,
  children,
  className,
  description,
  icon,
}: BilingualFieldProps) {
  return (
    <div
      className={cn(
        'admin-hairline bg-card/40 space-y-3 rounded-[var(--admin-radius-lg)] p-4 sm:p-5',
        className
      )}
    >
      <header className="flex items-center gap-2.5">
        {icon && (
          <div className="text-muted-foreground border-border bg-muted/30 flex h-7 w-7 items-center justify-center rounded-md border">
            {icon}
          </div>
        )}
        <div className="space-y-0.5">
          <p className="text-foreground font-mono text-[10px] font-semibold tracking-[0.18em] uppercase">
            {label}
          </p>
          {description && (
            <p className="text-muted-foreground text-[11px] leading-relaxed">{description}</p>
          )}
        </div>
      </header>
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </div>
  );
}
