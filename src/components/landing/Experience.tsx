'use client';

import { useReveal } from '@/hooks/use-reveal';

import { ExperienceCard } from './ExperienceCard';

type ExpCard = { id: string; code: string; title: string; body: string };

type ExperienceProps = {
  overline: string;
  title: string;
  desc: string;
  cards: ExpCard[];
};

export function Experience({ overline, title, desc, cards }: ExperienceProps) {
  const [headerRef, headerVisible] = useReveal<HTMLDivElement>();
  return (
    <section
      id="experience"
      data-testid="experience-section"
      className="border-border relative border-b py-24 lg:py-32"
    >
      <div aria-hidden className="tech-hatch absolute inset-0 opacity-60" />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <div
          ref={headerRef}
          className={`mb-16 grid grid-cols-1 gap-8 transition-all duration-700 lg:grid-cols-12 lg:gap-12 ${
            headerVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          }`}
        >
          <div className="lg:col-span-5">
            <p className="text-overline tracking-overline text-muted-foreground font-mono font-semibold uppercase">
              {overline}
            </p>
            <h2 className="font-display text-foreground mt-4 text-3xl leading-tight tracking-tight lg:text-5xl">
              {title}
            </h2>
          </div>
          <div className="lg:col-span-6 lg:col-start-7">
            <p className="text-muted-foreground text-base leading-relaxed lg:text-lg">{desc}</p>
          </div>
        </div>

        <div className="border-border grid grid-cols-1 border-t border-l sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((c, i) => (
            <ExperienceCard key={c.id} {...c} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
