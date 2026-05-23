'use client';

import { useTranslations } from 'next-intl';

import { ArrowUpRight } from 'lucide-react';

import { useReveal } from '@/hooks/use-reveal';

import { ProjectCard } from './ProjectCard';

type Project = {
  id: string;
  tag: string;
  period: string;
  title: string;
  challenge: string;
  intervention: string;
  outcome: string;
};

type ProjectsProps = {
  overline: string;
  title: string;
  desc: string;
  items: Project[];
};

export function Projects({ overline, title, desc, items }: ProjectsProps) {
  const t = useTranslations('projects');
  const [headerRef, headerVisible] = useReveal<HTMLDivElement>();
  return (
    <section
      id="projects"
      data-testid="projects-section"
      className="border-border bg-background relative border-b py-24 lg:py-32"
    >
      <div aria-hidden className="tech-hatch absolute inset-0 opacity-50" />

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

        <div className="border-border grid grid-cols-1 border-t border-l md:grid-cols-2">
          {items.map((p, i) => (
            <ProjectCard
              key={p.id}
              {...p}
              index={i}
              casePrefix={t('case_prefix')}
              challengeLabel={t('challenge_label')}
              interventionLabel={t('intervention_label')}
              outcomeLabel={t('outcome_label')}
            />
          ))}
        </div>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-overline tracking-overline text-muted-foreground/60 font-mono uppercase">
            {t('disclaimer')}
          </p>
          <a
            href="#contact"
            data-testid="projects-cta"
            className="group border-border text-foreground hover:border-foreground inline-flex w-fit items-center gap-3 border-b pb-1 text-sm font-semibold transition-colors"
          >
            {t('cta')}
            <ArrowUpRight
              size={16}
              className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </a>
        </div>
      </div>
    </section>
  );
}
