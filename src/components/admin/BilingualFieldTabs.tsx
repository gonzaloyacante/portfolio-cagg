'use client';

import { useEffect, useState } from 'react';

import { Languages, Link2, Unlink } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export type BilingualTabsChildRender = (props: {
  id: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}) => React.ReactNode;

type BilingualFieldTabsProps = {
  /** Field label shown in the header (e.g. "Titular") */
  label: string;
  /** Optional icon to show in the header */
  icon?: React.ReactNode;
  /** Optional small description below the label */
  description?: React.ReactNode;
  /** Render function for the ES input */
  renderEs: BilingualTabsChildRender;
  /** Render function for the EN input */
  renderEn: BilingualTabsChildRender;
  /** Current ES value (for sync detection) */
  esValue: string;
  /** Current EN value (for sync detection) */
  enValue: string;
  /** Called to update the ES value */
  onEsChange: (value: string) => void;
  /** Called to update the EN value */
  onEnChange: (value: string) => void;
  /** Optional helper placeholder for ES */
  esPlaceholder?: string;
  /** Optional helper placeholder for EN */
  enPlaceholder?: string;
  /** Optional name prefix for both inputs (used to wire id/htmlFor) */
  nameBase: string;
  /** Show a "synchronize" toggle that, when active, mirrors the other language */
  syncable?: boolean;
};

/**
 * Bilingual field with a clean ES/EN tab switcher, optional one-click
 * sync between languages, and inline preview of the other language.
 */
export function BilingualFieldTabs({
  label,
  icon,
  description,
  renderEs,
  renderEn,
  esValue,
  enValue,
  onEsChange,
  onEnChange,
  esPlaceholder,
  enPlaceholder,
  nameBase,
  syncable = false,
}: BilingualFieldTabsProps) {
  const [active, setActive] = useState<'Es' | 'En'>('Es');
  const [synced, setSynced] = useState(false);
  const idBase = `bft-${nameBase}`;

  useEffect(() => {
    if (!syncable || !synced) return;
    if (active === 'Es' && enValue !== esValue) onEnChange(esValue);
    if (active === 'En' && esValue !== enValue) onEsChange(enValue);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, esValue, enValue, synced, syncable]);

  return (
    <div className="admin-hairline bg-card/40 rounded-[var(--admin-radius-lg)] p-4 sm:p-5">
      <header className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          {icon && (
            <div className="text-muted-foreground border-border bg-muted/30 flex h-7 w-7 items-center justify-center rounded-md border">
              {icon}
            </div>
          )}
          <div className="space-y-0.5">
            <Label className="text-foreground text-sm font-semibold tracking-tight">{label}</Label>
            {description && <p className="text-muted-foreground text-xs">{description}</p>}
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {syncable && (
            <Button
              type="button"
              variant="ghost"
              size="xs"
              onClick={() => setSynced((s) => !s)}
              data-testid={`bilingual-sync-${nameBase}`}
              className={cn(
                'gap-1.5 font-mono text-[10px] tracking-widest uppercase',
                synced && 'bg-foreground/5 text-foreground'
              )}
            >
              {synced ? <Link2 size={11} /> : <Unlink size={11} />}
              {synced ? 'Sincronizado' : 'Sincronizar'}
            </Button>
          )}
        </div>
      </header>

      <div className="border-border bg-muted/30 mb-4 inline-flex items-center gap-1 rounded-[var(--admin-radius)] border p-1">
        {(['Es', 'En'] as const).map((lang) => {
          const isActive = active === lang;
          return (
            <button
              key={lang}
              type="button"
              onClick={() => setActive(lang)}
              data-testid={`bilingual-tab-${nameBase}-${lang}`}
              className={cn(
                'flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-semibold tracking-wide transition-all',
                isActive
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Languages size={11} className="opacity-70" />
              <span className="font-mono text-[10px] tracking-widest uppercase">{lang}</span>
              <span className="hidden font-sans text-[10px] font-normal tracking-normal normal-case opacity-70 sm:inline">
                {lang === 'Es' ? 'Español' : 'English'}
              </span>
            </button>
          );
        })}
      </div>

      <div className="grid gap-4">
        {(['Es', 'En'] as const).map((lang) => {
          const isActive = active === lang;
          const isEs = lang === 'Es';
          const value = isEs ? esValue : enValue;
          const onChange = isEs ? onEsChange : onEnChange;
          const placeholder = isEs ? esPlaceholder : enPlaceholder;
          const render = isEs ? renderEs : renderEn;
          const otherValue = isEs ? enValue : esValue;
          const otherLang = isEs ? 'EN' : 'ES';
          return (
            <div
              key={lang}
              className={cn(
                'space-y-2 transition-opacity duration-200',
                isActive ? 'opacity-100' : 'hidden opacity-0'
              )}
            >
              {render({
                id: `${idBase}-${lang.toLowerCase()}`,
                name: `${nameBase}${lang}`,
                value,
                onChange,
                placeholder,
              })}
              {otherValue && (
                <div className="text-muted-foreground flex items-start gap-2 pl-1 text-[11px] italic">
                  <span className="font-mono text-[10px] tracking-widest uppercase not-italic opacity-60">
                    {otherLang}:
                  </span>
                  <span className="line-clamp-2">{otherValue}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
