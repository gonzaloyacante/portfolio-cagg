import type { ReactNode } from 'react';

import type { LucideIcon } from 'lucide-react';
import { Info, MapPin, MousePointerClick } from 'lucide-react';

import { cn } from '@/lib/utils';

type FieldHelpProps = {
  /** Plain-language description of what this field is and how to use it. */
  description: ReactNode;
  /** Optional list of bullet points with tips. */
  tips?: ReactNode[];
  /** Where in the public site this value will appear. */
  appearsIn?: ReactNode;
  /** Optional icon next to the description. */
  icon?: LucideIcon;
  /** Class name for the wrapper. */
  className?: string;
};

/**
 * FieldHelp — small, structured helper rendered right below a field label
 * (or above a section). Three things the admin needs to know:
 *
 *  1. What is this field? (description)
 *  2. How should I use it? (tips)
 *  3. Where will this appear in the public site? (appearsIn)
 */
export function FieldHelp({ description, tips, appearsIn, icon: Icon, className }: FieldHelpProps) {
  return (
    <div
      className={cn(
        'admin-hairline bg-card/30 space-y-2 rounded-[var(--admin-radius)] p-3',
        className
      )}
    >
      <div className="text-muted-foreground flex items-start gap-2 text-[11px] leading-relaxed">
        {Icon ? (
          <Icon size={11} className="text-muted-foreground mt-0.5 shrink-0" />
        ) : (
          <Info size={11} className="text-muted-foreground mt-0.5 shrink-0" />
        )}
        <p className="flex-1">{description}</p>
      </div>

      {tips && tips.length > 0 && (
        <ul className="text-muted-foreground/90 space-y-1 pl-5 text-[11px] leading-relaxed">
          {tips.map((tip, i) => (
            <li key={i} className="marker:text-muted-foreground/40 list-disc">
              {tip}
            </li>
          ))}
        </ul>
      )}

      {appearsIn && (
        <div className="border-border text-muted-foreground mt-1 flex items-start gap-1.5 border-t pt-2 text-[11px] leading-relaxed">
          <MapPin size={10} className="mt-0.5 shrink-0" />
          <span>
            <span className="text-foreground/80 font-medium">Aparece en: </span>
            {appearsIn}
          </span>
        </div>
      )}
    </div>
  );
}

type SectionHelpProps = {
  /** Title for the section being described. */
  title: ReactNode;
  /** Plain-language description. */
  description: ReactNode;
  /** Where in the public site this section shows up. */
  appearsIn?: ReactNode;
  /** Optional tips. */
  tips?: ReactNode[];
  /** Class name for the wrapper. */
  className?: string;
};

/**
 * SectionHelp — bigger helper rendered at the top of a section. Explains
 * the purpose of the entire section in plain language, where it appears
 * on the public site, and quick tips.
 */
export function SectionHelp({ title, description, appearsIn, tips, className }: SectionHelpProps) {
  return (
    <div
      className={cn(
        'admin-hairline bg-card/30 relative overflow-hidden rounded-[var(--admin-radius-lg)] p-4',
        className
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -top-8 -right-8 h-24 w-24 rounded-full bg-[radial-gradient(circle_at_center,color-mix(in_oklab,var(--foreground)_6%,transparent),transparent_60%)]"
      />
      <div className="relative space-y-2">
        <p className="text-foreground/90 flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.18em] uppercase">
          <MousePointerClick size={11} className="text-muted-foreground" />
          {title}
        </p>
        <p className="text-muted-foreground text-xs leading-relaxed">{description}</p>
        {appearsIn && (
          <p className="text-muted-foreground/80 flex items-center gap-1.5 pt-1 text-[11px]">
            <MapPin size={10} />
            <span>
              <span className="text-foreground/80 font-medium">Aparece en: </span>
              {appearsIn}
            </span>
          </p>
        )}
        {tips && tips.length > 0 && (
          <ul className="text-muted-foreground/90 space-y-1 pt-1 pl-5 text-[11px] leading-relaxed">
            {tips.map((tip, i) => (
              <li key={i} className="marker:text-muted-foreground/40 list-disc">
                {tip}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
