'use client';

import { useState, useRef, useEffect, type ReactNode } from 'react';

import { ChevronDown } from 'lucide-react';

import { cn } from '@/lib/utils';

type CollapsibleSectionProps = {
  /** Title shown in the header */
  title: ReactNode;
  /** Optional description */
  description?: ReactNode;
  /** Optional icon */
  icon?: ReactNode;
  /** Right-side badge / action */
  badge?: ReactNode;
  /** Children shown when expanded */
  children: ReactNode;
  /** Default open state */
  defaultOpen?: boolean;
  /** Optional className for the wrapper */
  className?: string;
};

/**
 * Collapsible section group. Uses native <details> for accessibility.
 * Smoothly transitions the chevron and animates the body.
 */
export function CollapsibleSection({
  title,
  description,
  icon,
  badge,
  children,
  defaultOpen = true,
  className,
}: CollapsibleSectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  const ref = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const handler = () => setOpen(el.open);
    el.addEventListener('toggle', handler);
    return () => el.removeEventListener('toggle', handler);
  }, []);

  return (
    <details
      ref={ref}
      open={defaultOpen}
      className={cn(
        'admin-hairline group/details bg-card/40 open:bg-card/50 overflow-hidden rounded-[var(--admin-radius-lg)] transition-colors',
        className
      )}
    >
      <summary
        className="flex cursor-pointer list-none items-start justify-between gap-3 p-5 sm:p-6 [&::-webkit-details-marker]:hidden"
        data-testid="collapsible-section-summary"
      >
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
        <div className="flex items-center gap-2">
          {badge}
          <ChevronDown
            size={15}
            className={cn(
              'text-muted-foreground shrink-0 transition-transform duration-200',
              open && 'rotate-180'
            )}
          />
        </div>
      </summary>
      <div className="border-border border-t p-5 sm:p-6">
        <div className="space-y-5">{children}</div>
      </div>
    </details>
  );
}
