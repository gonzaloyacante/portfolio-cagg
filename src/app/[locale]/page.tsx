import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { unstable_cache } from 'next/cache';

import { BrandsMarquee } from '@/components/landing/BrandsMarquee';
import { Contact } from '@/components/landing/Contact';
import type { ContactInfo } from '@/components/landing/ContactDirect';
import { Experience } from '@/components/landing/Experience';
import { FAQ } from '@/components/landing/FAQ';
import { Footer } from '@/components/landing/Footer';
import { Header } from '@/components/landing/Header';
import { Hero } from '@/components/landing/Hero';
import { Process } from '@/components/landing/Process';
import { Projects } from '@/components/landing/Projects';
import { Results } from '@/components/landing/Results';
import { SectionIndex } from '@/components/landing/SectionIndex';
import { Services } from '@/components/landing/Services';
import { StickyWhatsApp } from '@/components/landing/StickyWhatsApp';
import { Testimonials } from '@/components/landing/Testimonials';
import { Timeline } from '@/components/landing/Timeline';
import type { SectionMeta } from '@/generated/prisma/client';
import { prisma } from '@/lib/prisma';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });
  return { title: t('title'), description: t('description') };
}

function pickMeta(metas: SectionMeta[], slug: string, isEn: boolean) {
  const s = metas.find((m) => m.slug === slug);
  return {
    overline: (isEn ? s?.overlineEn : s?.overlineEs) ?? '',
    title: (isEn ? s?.titleEn : s?.titleEs) ?? '',
    desc: (isEn ? s?.descEn : s?.descEs) ?? '',
  };
}

const FOOTER_YEAR = new Date().getFullYear();

const SECTION_SLUGS = [
  'experience',
  'process',
  'services',
  'projects',
  'results',
  'testimonials',
  'timeline',
  'faq',
  'contact',
] as const;

const getLandingData = unstable_cache(
  async () => {
    const [
      rawHero,
      brands,
      experienceCards,
      processSteps,
      services,
      projects,
      results,
      testimonials,
      timelineItems,
      faqItems,
      contactInfo,
      sectionMetas,
    ] = await Promise.all([
      prisma.hero.findFirst({ include: { stats: { orderBy: { order: 'asc' } } } }),
      prisma.brand.findMany({ orderBy: { order: 'asc' } }),
      prisma.experienceCard.findMany({ orderBy: { order: 'asc' } }),
      prisma.processStep.findMany({ orderBy: { order: 'asc' } }),
      prisma.service.findMany({ orderBy: { order: 'asc' } }),
      prisma.project.findMany({ orderBy: { order: 'asc' } }),
      prisma.resultItem.findMany({ orderBy: { order: 'asc' } }),
      prisma.testimonial.findMany({ orderBy: { order: 'asc' } }),
      prisma.timelineItem.findMany({ orderBy: { order: 'asc' } }),
      prisma.faqItem.findMany({ orderBy: { order: 'asc' } }),
      prisma.contactInfo.findFirst(),
      prisma.sectionMeta.findMany({ where: { slug: { in: [...SECTION_SLUGS] } } }),
    ]);
    return {
      rawHero,
      brands,
      experienceCards,
      processSteps,
      services,
      projects,
      results,
      testimonials,
      timelineItems,
      faqItems,
      contactInfo,
      sectionMetas,
    };
  },
  ['landing'],
  { tags: ['landing'] }
);

export default async function LandingPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const isEn = locale === 'en';

  const {
    rawHero,
    brands,
    experienceCards,
    processSteps,
    services,
    projects,
    results,
    testimonials,
    timelineItems,
    faqItems,
    contactInfo,
    sectionMetas,
  } = await getLandingData();

  const hero = rawHero
    ? {
        overline: isEn ? rawHero.overlineEn : rawHero.overlineEs,
        headline: isEn ? rawHero.headlineEn : rawHero.headlineEs,
        summary: isEn ? rawHero.summaryEn : rawHero.summaryEs,
        ctaWhatsapp: isEn ? rawHero.ctaWhatsappEn : rawHero.ctaWhatsappEs,
        ctaEmail: isEn ? rawHero.ctaEmailEn : rawHero.ctaEmailEs,
        ctaLinkedin: isEn ? rawHero.ctaLinkedinEn : rawHero.ctaLinkedinEs,
        portraitUrl: rawHero.portraitUrl ?? undefined,
        stats: rawHero.stats.map((s) => ({
          id: s.id,
          value: s.value,
          label: isEn ? s.labelEn : s.labelEs,
        })),
      }
    : null;

  const contact: ContactInfo | null = contactInfo
    ? {
        name: contactInfo.name,
        phoneDisplay: contactInfo.phoneDisplay,
        whatsappNumber: contactInfo.whatsappNumber,
        email: contactInfo.email,
        linkedinUrl: contactInfo.linkedinUrl,
        location: contactInfo.location,
      }
    : null;

  const expCards = experienceCards.map((c) => ({
    id: c.id,
    code: c.code,
    title: isEn ? c.titleEn : c.titleEs,
    body: isEn ? c.bodyEn : c.bodyEs,
  }));

  const steps = processSteps.map((s) => ({
    id: s.id,
    code: s.code,
    title: isEn ? s.titleEn : s.titleEs,
    body: isEn ? s.bodyEn : s.bodyEs,
    deliverable: isEn ? s.deliverableEn : s.deliverableEs,
  }));

  const serviceItems = services.map((s) => ({
    id: s.id,
    label: isEn ? s.labelEn : s.labelEs,
  }));

  const projectItems = projects.map((p) => ({
    id: p.id,
    tag: p.tag,
    period: isEn ? p.periodEn : p.periodEs,
    title: isEn ? p.titleEn : p.titleEs,
    challenge: isEn ? p.challengeEn : p.challengeEs,
    intervention: isEn ? p.interventionEn : p.interventionEs,
    outcome: isEn ? p.outcomeEn : p.outcomeEs,
  }));

  const resultItems = results.map((r) => ({
    id: r.id,
    k: isEn ? r.kEn : r.kEs,
    v: isEn ? r.vEn : r.vEs,
  }));

  const testimonialItems = testimonials.map((t) => ({
    id: t.id,
    quote: isEn ? t.quoteEn : t.quoteEs,
    role: isEn ? t.roleEn : t.roleEs,
    sector: isEn ? t.sectorEn : t.sectorEs,
  }));

  const milestones = timelineItems.map((t) => ({
    id: t.id,
    period: t.period,
    title: isEn ? t.titleEn : t.titleEs,
    body: isEn ? t.bodyEn : t.bodyEs,
  }));

  const faqEntries = faqItems.map((f) => ({
    id: f.id,
    q: isEn ? f.qEn : f.qEs,
    a: isEn ? f.aEn : f.aEs,
  }));

  return (
    <>
      <Header />
      <SectionIndex />
      <main id="main-content">
        {hero && contact && (
          <Hero
            {...hero}
            whatsappNumber={contact.whatsappNumber}
            email={contact.email}
            linkedin={contact.linkedinUrl}
            portraitUrl={hero.portraitUrl}
          />
        )}
        <BrandsMarquee brands={brands} />
        <Experience {...pickMeta(sectionMetas, 'experience', isEn)} cards={expCards} />
        <Process {...pickMeta(sectionMetas, 'process', isEn)} steps={steps} />
        <Services {...pickMeta(sectionMetas, 'services', isEn)} items={serviceItems} />
        <Projects {...pickMeta(sectionMetas, 'projects', isEn)} items={projectItems} />
        <Results {...pickMeta(sectionMetas, 'results', isEn)} items={resultItems} />
        <Testimonials {...pickMeta(sectionMetas, 'testimonials', isEn)} items={testimonialItems} />
        <Timeline {...pickMeta(sectionMetas, 'timeline', isEn)} items={milestones} />
        <FAQ {...pickMeta(sectionMetas, 'faq', isEn)} items={faqEntries} />
        {contact && <Contact {...pickMeta(sectionMetas, 'contact', isEn)} contact={contact} />}
      </main>
      {contact && <Footer contact={contact} year={FOOTER_YEAR} />}
      {contact && <StickyWhatsApp whatsappNumber={contact.whatsappNumber} />}
    </>
  );
}
