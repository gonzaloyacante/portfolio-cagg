'use client';

import { useReveal } from '@/hooks/use-reveal';

import { ResultCard } from './ResultCard';

type ResultItem = {
  id: string;
  k: string;
  v: string;
};

type ResultsProps = {
  overline: string;
  title: string;
  desc: string;
  items: ResultItem[];
};

export function Results({ overline, title, desc, items }: ResultsProps) {
  const [headerRef, headerVisible] = useReveal<HTMLDivElement>();
  return (
    <section
      id="results"
      data-testid="results-section"
      className="border-border bg-card relative border-b py-24 lg:py-32"
    >
      <div aria-hidden className="tech-hatch absolute inset-0 opacity-60" />
      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <div
          ref={headerRef}
          className={`mb-14 grid grid-cols-1 gap-8 transition-all duration-700 lg:grid-cols-12 ${
            headerVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          }`}
        >
          <div className="lg:col-span-7">
            <p className="text-overline tracking-overline text-muted-foreground font-mono font-semibold uppercase">
              {overline}
            </p>
            <h2 className="font-display text-foreground mt-4 text-3xl leading-tight tracking-tight lg:text-5xl">
              {title}
            </h2>
          </div>
          <div className="flex lg:col-span-5 lg:items-end">
            <p className="text-muted-foreground text-base leading-relaxed lg:text-lg">{desc}</p>
          </div>
        </div>

        <div className="border-border grid grid-cols-1 border-t border-l sm:grid-cols-2 lg:grid-cols-4">
          {items.map((it, i) => (
            <ResultCard key={it.id} {...it} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
