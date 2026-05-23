'use client';

import { useTranslations } from 'next-intl';

import { ArrowUpRight } from 'lucide-react';

import { useReveal } from '@/hooks/use-reveal';

import { ServiceItem } from './ServiceItem';

type Service = { id: string; label: string };

type ServicesProps = {
  overline: string;
  title: string;
  desc: string;
  items: Service[];
};

export function Services({ overline, title, desc, items }: ServicesProps) {
  const t = useTranslations('nav');
  const [asideRef, asideVisible] = useReveal<HTMLElement>();
  return (
    <section
      id="services"
      data-testid="services-section"
      className="border-border border-b py-24 lg:py-32"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          <aside
            ref={asideRef}
            className={`self-start transition-all duration-700 lg:sticky lg:top-28 lg:col-span-5 ${
              asideVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            }`}
          >
            <p className="text-overline tracking-overline text-muted-foreground font-mono font-semibold uppercase">
              {overline}
            </p>
            <h2 className="font-display text-foreground mt-4 text-3xl leading-tight tracking-tight lg:text-5xl">
              {title}
            </h2>
            <p className="text-muted-foreground mt-6 max-w-md text-base leading-relaxed">{desc}</p>

            <a
              href="#contact"
              data-testid="services-contact-link"
              className="group border-border text-foreground hover:border-foreground mt-10 inline-flex items-center gap-3 border-b pb-2 text-sm font-semibold transition-colors"
            >
              {t('cta')}
              <ArrowUpRight
                size={16}
                className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </a>
          </aside>

          <div className="lg:col-span-7">
            <ul className="border-border border-t">
              {items.map((s, i) => (
                <ServiceItem key={s.id} {...s} index={i} />
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
