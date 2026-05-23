'use client';

import { useReveal } from '@/hooks/use-reveal';

type ProcessStepProps = {
  id: string;
  code: string;
  title: string;
  body: string;
  deliverable: string;
  deliverableLabel: string;
  stepPrefix: string;
  index: number;
  total: number;
};

export function ProcessStep({
  code,
  title,
  body,
  deliverable,
  deliverableLabel,
  stepPrefix,
  index,
  total,
}: ProcessStepProps) {
  const [ref, visible] = useReveal<HTMLElement>();
  return (
    <article
      ref={ref}
      data-testid={`process-step-${index}`}
      style={{ transitionDelay: `${index * 90}ms` }}
      className={`group border-border hover:bg-card relative border-r border-b p-7 transition-all duration-700 lg:p-8 ${
        visible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
      }`}
    >
      <div className="mb-6 flex items-center justify-between">
        <span className="num text-overline tracking-label text-muted-foreground/60 font-mono">
          {stepPrefix} / {code}
        </span>
        <span className="num text-label tracking-overline text-muted-foreground/40 font-mono">
          {String(index + 1).padStart(2, '0')} · {String(total).padStart(2, '0')}
        </span>
      </div>

      <h3 className="font-display text-foreground mb-3 text-xl leading-tight tracking-tight lg:text-2xl">
        {title}
      </h3>
      <p className="text-muted-foreground mb-6 text-sm leading-relaxed">{body}</p>

      <div className="border-border border-t pt-4">
        <p className="text-label tracking-label text-muted-foreground/60 mb-1 font-mono uppercase">
          {deliverableLabel}
        </p>
        <p className="text-foreground text-sm leading-snug">{deliverable}</p>
      </div>

      <div className="bg-foreground absolute bottom-0 left-0 h-px w-0 transition-all duration-500 group-hover:w-full" />
    </article>
  );
}
