'use client';

import { Quote } from 'lucide-react';

import { useReveal } from '@/hooks/use-reveal';

type TestimonialCardProps = {
  id: string;
  quote: string;
  role: string;
  sector: string;
  index: number;
};

export function TestimonialCard({ quote, role, sector, index }: TestimonialCardProps) {
  const [ref, visible] = useReveal<HTMLElement>();
  return (
    <figure
      ref={ref}
      data-testid={`testimonial-${index}`}
      style={{ transitionDelay: `${(index % 2) * 100}ms` }}
      className={`group border-border hover:bg-background relative border-r border-b p-8 transition-all duration-700 lg:p-10 ${
        visible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
      }`}
    >
      <Quote
        size={28}
        strokeWidth={1.5}
        className="text-muted-foreground/20 group-hover:text-muted-foreground/40 transition-colors"
      />
      <blockquote className="font-display text-foreground mt-6 text-lg leading-snug lg:text-xl">
        &ldquo;{quote}&rdquo;
      </blockquote>
      <figcaption className="border-border mt-8 border-t pt-5">
        <div className="text-foreground text-sm font-medium">{role}</div>
        <div className="text-overline tracking-label text-muted-foreground/60 mt-1 font-mono uppercase">
          {sector}
        </div>
      </figcaption>
      <div className="bg-foreground absolute bottom-0 left-0 h-px w-0 transition-all duration-500 group-hover:w-full" />
    </figure>
  );
}
