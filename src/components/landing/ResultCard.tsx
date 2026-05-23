'use client';

import { useReveal } from '@/hooks/use-reveal';

type ResultCardProps = {
  id: string;
  k: string;
  v: string;
  index: number;
};

export function ResultCard({ k, v, index }: ResultCardProps) {
  const [ref, visible] = useReveal<HTMLDivElement>();
  return (
    <div
      ref={ref}
      data-testid={`result-item-${index}`}
      style={{ transitionDelay: `${(index % 4) * 60}ms` }}
      className={`group border-border hover:bg-background border-r border-b p-7 transition-all duration-700 lg:p-9 ${
        visible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
      }`}
    >
      <span className="num text-overline tracking-label text-muted-foreground/60 font-mono">
        / {String(index + 1).padStart(2, '0')}
      </span>
      <div className="font-display text-foreground mt-6 text-xl leading-tight tracking-tight lg:text-2xl">
        {v}
      </div>
      <div className="text-overline tracking-label text-muted-foreground/60 group-hover:text-muted-foreground mt-3 font-mono uppercase transition-colors">
        {k}
      </div>
    </div>
  );
}
