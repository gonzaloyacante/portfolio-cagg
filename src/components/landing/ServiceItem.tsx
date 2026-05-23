'use client';

import { ArrowUpRight } from 'lucide-react';

import { useReveal } from '@/hooks/use-reveal';

type ServiceItemProps = {
  id: string;
  label: string;
  index: number;
};

export function ServiceItem({ label, index }: ServiceItemProps) {
  const [ref, visible] = useReveal<HTMLLIElement>();
  return (
    <li
      ref={ref}
      data-testid={`service-item-${index}`}
      style={{ transitionDelay: `${(index % 5) * 60}ms` }}
      className={`group border-border border-b transition-all duration-700 ${
        visible ? 'translate-x-0 opacity-100' : 'translate-x-3 opacity-0'
      }`}
    >
      <a
        href="#contact"
        data-testid={`service-link-${index}`}
        className="hover:bg-card -mx-2 flex items-center justify-between gap-6 px-2 py-6 transition-colors lg:-mx-3 lg:px-3 lg:py-7"
      >
        <div className="flex items-center gap-6">
          <span className="num text-overline text-muted-foreground/60 group-hover:text-foreground font-mono transition-colors">
            {String(index + 1).padStart(2, '0')}
          </span>
          <span className="font-display text-foreground text-lg tracking-tight lg:text-2xl">
            {label}
          </span>
        </div>
        <ArrowUpRight
          size={18}
          className="text-muted-foreground/40 group-hover:text-foreground transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
        />
      </a>
    </li>
  );
}
