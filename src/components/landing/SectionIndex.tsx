'use client';

import { useActiveSection } from '@/hooks/use-active-section';

const SECTIONS = [
  { id: 'top', label: '00' },
  { id: 'experience', label: '01' },
  { id: 'process', label: '02' },
  { id: 'services', label: '03' },
  { id: 'projects', label: '04' },
  { id: 'results', label: '05' },
  { id: 'testimonials', label: '06' },
  { id: 'timeline', label: '07' },
  { id: 'faq', label: '08' },
  { id: 'contact', label: '09' },
] as const;

export function SectionIndex() {
  const active = useActiveSection(SECTIONS.map((s) => s.id));

  return (
    <nav
      data-testid="section-index"
      aria-label="Section index"
      className="fixed top-1/2 right-6 z-30 hidden -translate-y-1/2 flex-col items-end gap-3 xl:flex"
    >
      {SECTIONS.map((s) => {
        const isActive = active === s.id;
        return (
          <a
            key={s.id}
            href={`#${s.id}`}
            data-testid={`section-index-${s.id}`}
            aria-current={isActive ? 'location' : undefined}
            className="group text-label tracking-label flex items-center gap-3 font-mono uppercase"
          >
            <span
              className={`transition-all duration-300 ${
                isActive
                  ? 'text-foreground translate-x-0 opacity-100'
                  : 'text-muted-foreground/60 -translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-100'
              }`}
            >
              {s.label}
            </span>
            <span
              className={`block h-px transition-all duration-300 ${
                isActive
                  ? 'bg-foreground w-7'
                  : 'bg-muted-foreground/40 group-hover:bg-muted-foreground w-3 group-hover:w-5'
              }`}
            />
          </a>
        );
      })}
    </nav>
  );
}
