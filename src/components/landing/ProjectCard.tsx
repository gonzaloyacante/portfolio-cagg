'use client';

import { useReveal } from '@/hooks/use-reveal';

import { ProjectRow } from './ProjectRow';

type ProjectCardProps = {
  id: string;
  tag: string;
  period: string;
  title: string;
  challenge: string;
  intervention: string;
  outcome: string;
  index: number;
  casePrefix: string;
  challengeLabel: string;
  interventionLabel: string;
  outcomeLabel: string;
};

export function ProjectCard({
  tag,
  period,
  title,
  challenge,
  intervention,
  outcome,
  index,
  casePrefix,
  challengeLabel,
  interventionLabel,
  outcomeLabel,
}: ProjectCardProps) {
  const [ref, visible] = useReveal<HTMLElement>();
  return (
    <article
      ref={ref}
      data-testid={`project-card-${index}`}
      style={{ transitionDelay: `${(index % 2) * 80}ms` }}
      className={`group border-border bg-background hover:bg-card relative border-r border-b p-7 transition-all duration-700 lg:p-10 ${
        visible ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0'
      }`}
    >
      <div className="mb-7 flex items-center justify-between">
        <span className="num text-label tracking-label text-muted-foreground/60 font-mono">
          / {casePrefix} · {String(index + 1).padStart(2, '0')}
        </span>
        <span className="border-border group-hover:border-foreground text-label tracking-label text-foreground/80 border px-2 py-1 font-mono transition-colors">
          {tag}
        </span>
      </div>

      <p className="text-label tracking-label text-muted-foreground/60 mb-2 font-mono uppercase">
        {period}
      </p>
      <h3 className="font-display text-foreground mb-5 text-xl leading-tight tracking-tight lg:text-2xl">
        {title}
      </h3>

      <dl className="space-y-3 text-sm">
        <ProjectRow label={challengeLabel} value={challenge} />
        <ProjectRow label={interventionLabel} value={intervention} />
        <ProjectRow label={outcomeLabel} value={outcome} highlight />
      </dl>

      <div className="bg-foreground absolute bottom-0 left-0 h-px w-0 transition-all duration-700 group-hover:w-full" />
    </article>
  );
}
