'use client';

import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

type PageHeaderProps = {
  /** Small overline label (e.g. "Contenido · Marcas") */
  eyebrow?: ReactNode;
  /** Optional icon shown next to eyebrow (pass a Lucide element) */
  eyebrowIcon?: ReactNode;
  /** Main title */
  title: ReactNode;
  /** Optional description below the title */
  description?: ReactNode;
  /** Optional metadata row (badges, count, etc.) */
  meta?: ReactNode;
  /** Right-side actions (buttons, filters, etc.) */
  actions?: ReactNode;
  /** Optional className for the wrapper */
  className?: string;
  /**
   * Public preview URL — if provided, a "Ver en el sitio" link will be
   * shown next to the actions. Path is the public landing anchor.
   */
  previewUrl?: string;
  /** Custom label for the preview link (default: "Ver en el sitio") */
  previewLabel?: string;
};

/**
 * Standard page header for admin pages. Provides consistent visual rhythm
 * across the panel: eyebrow → title → description → meta + actions.
 */
export function PageHeader({
  eyebrow,
  eyebrowIcon,
  title,
  description,
  meta,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <header
      data-testid="admin-page-header"
      className={cn(
        'relative flex flex-col gap-5 pb-6 sm:flex-row sm:items-end sm:justify-between sm:gap-6',
        className
      )}
    >
      <div className="space-y-2.5">
        {eyebrow && (
          <div className="text-muted-foreground/80 flex items-center gap-2 font-mono text-[10px] tracking-[0.18em] uppercase">
            {eyebrowIcon}
            <span>{eyebrow}</span>
          </div>
        )}
        <div className="space-y-1.5">
          <h1 className="text-foreground text-2xl font-semibold tracking-tight sm:text-[28px]">
            {title}
          </h1>
          {description && (
            <p className="text-muted-foreground max-w-2xl text-sm leading-relaxed">{description}</p>
          )}
        </div>
        {meta && <div className="flex flex-wrap items-center gap-2 pt-1">{meta}</div>}
      </div>
      {actions && (
        <div className="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end">{actions}</div>
      )}
    </header>
  );
}
