'use client';

import { useReveal } from '@/hooks/use-reveal';

type ExperienceCardProps = {
  id: string;
  code: string;
  title: string;
  body: string;
  index: number;
};

export function ExperienceCard({ code, title, body, index }: ExperienceCardProps) {
  const [ref, visible] = useReveal<HTMLElement>();
  return (
    <article
      ref={ref}
      data-testid={`experience-card-${index}`}
      style={{ transitionDelay: `${(index % 3) * 80}ms` }}
      className={`group border-border bg-background hover:bg-card relative border-r border-b p-7 transition-all duration-700 lg:p-9 ${
        visible ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0'
      }`}
    >
      <div className="mb-7 flex items-start justify-between">
        <span className="num text-overline tracking-code text-muted-foreground/60 font-mono">
          / {code}
        </span>
        <span className="bg-border group-hover:bg-foreground h-2 w-2 transition-colors duration-300" />
      </div>

      <h3 className="font-display text-foreground mb-3 text-xl leading-tight tracking-tight lg:text-2xl">
        {title}
      </h3>
      <p className="text-muted-foreground text-sm leading-relaxed">{body}</p>

      <div className="bg-foreground absolute bottom-0 left-0 h-px w-0 transition-all duration-500 group-hover:w-full" />
    </article>
  );
}
