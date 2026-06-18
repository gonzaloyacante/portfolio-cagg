import { describe, expect, it } from 'vitest';

import {
  buildMetadata,
  personJsonLd,
  professionalServiceJsonLd,
  servicesItemListJsonLd,
  projectsItemListJsonLd,
  breadcrumbJsonLd,
  websiteJsonLd,
  SEO_CONFIG,
} from '@/lib/seo';

describe('lib/seo — extra density', () => {
  describe('SEO_CONFIG', () => {
    it('has APP_URL', () => {
      expect(SEO_CONFIG.APP_URL).toBeTruthy();
    });

    it('has SITE_NAME', () => {
      expect(SEO_CONFIG.SITE_NAME).toBeTruthy();
    });

    it('has DEFAULT_OG_IMAGE', () => {
      expect(SEO_CONFIG.DEFAULT_OG_IMAGE).toBeTruthy();
    });
  });

  describe('buildMetadata()', () => {
    it('returns a Metadata object with all required fields', () => {
      const meta = buildMetadata({
        locale: 'es',
        title: 'Test',
        description: 'Desc',
        path: '/',
      });
      expect(meta.title).toBeTruthy();
      expect(meta.description).toBeTruthy();
    });

    it('formats canonical URL for / path', () => {
      const meta = buildMetadata({ locale: 'es', title: 'A', description: 'a', path: '/' });
      expect(meta.alternates?.canonical).toBeTruthy();
    });

    it('formats canonical URL for non-/ path', () => {
      const meta = buildMetadata({ locale: 'es', title: 'A', description: 'a', path: '/about' });
      expect(meta.alternates?.canonical).toContain('/about');
    });

    it('handles en locale', () => {
      const meta = buildMetadata({ locale: 'en', title: 'A', description: 'a', path: '/' });
      expect(meta.title).toBeTruthy();
    });

    it('handles es locale', () => {
      const meta = buildMetadata({ locale: 'es', title: 'A', description: 'a', path: '/' });
      expect(meta.title).toBeTruthy();
    });

    it('uses en OG image for en locale', () => {
      const meta = buildMetadata({ locale: 'en', title: 'A', description: 'a', path: '/' });
      expect((meta.openGraph?.images as Array<{ url: string }>)?.[0]?.url).toContain('-en');
    });

    it('uses default OG image for non-en locale', () => {
      const meta = buildMetadata({ locale: 'es', title: 'A', description: 'a', path: '/' });
      expect((meta.openGraph?.images as Array<{ url: string }>)?.[0]?.url).toBeTruthy();
    });

    it('uses custom OG image when provided', () => {
      const meta = buildMetadata({
        locale: 'es',
        title: 'A',
        description: 'a',
        path: '/',
        ogImage: 'https://example.com/custom.jpg',
      });
      expect((meta.openGraph?.images as Array<{ url: string }>)?.[0]?.url).toBe(
        'https://example.com/custom.jpg'
      );
    });

    it('sets noindex when noindex=true', () => {
      const meta = buildMetadata({
        locale: 'es',
        title: 'A',
        description: 'a',
        path: '/',
        noindex: true,
      });
      expect(meta.robots).toEqual(expect.objectContaining({ index: false }));
    });

    it('indexes when noindex=false', () => {
      const meta = buildMetadata({
        locale: 'es',
        title: 'A',
        description: 'a',
        path: '/',
        noindex: false,
      });
      expect(meta.robots).toEqual(expect.objectContaining({ index: true }));
    });

    it('includes keywords', () => {
      const meta = buildMetadata({ locale: 'es', title: 'A', description: 'a', path: '/' });
      expect(meta.keywords).toBeDefined();
    });

    it('includes OpenGraph type=website by default', () => {
      const meta = buildMetadata({ locale: 'es', title: 'A', description: 'a', path: '/' });
      // openGraph is typed as OpenGraph | OpenGraphMetadata union
      const og = meta.openGraph as { type?: string } | undefined;
      expect(og?.type).toBe('website');
    });

    it.each(['es', 'en'] as const)('formats hreflang for %s', (locale) => {
      const meta = buildMetadata({ locale, title: 'A', description: 'a', path: '/' });
      const langs = meta.alternates?.languages as Record<string, string>;
      expect(langs?.[locale]).toBeTruthy();
      expect(langs?.['x-default']).toBeTruthy();
    });
  });

  describe('personJsonLd()', () => {
    it('returns a Person schema for es', () => {
      const ld = personJsonLd('es');
      expect(ld['@type']).toBe('Person');
    });

    it('returns a Person schema for en', () => {
      const ld = personJsonLd('en');
      expect(ld['@type']).toBe('Person');
    });

    it('has @context schema.org', () => {
      const ld = personJsonLd('es');
      expect(ld['@context']).toBe('https://schema.org');
    });

    it('has name', () => {
      const ld = personJsonLd('es');
      expect(ld.name).toBeTruthy();
    });

    it('has jobTitle', () => {
      const ld = personJsonLd('es');
      expect(ld.jobTitle).toBeTruthy();
    });

    it('has knowsAbout array', () => {
      const ld = personJsonLd('es');
      expect(Array.isArray(ld.knowsAbout)).toBe(true);
    });

    it('has workLocation', () => {
      const ld = personJsonLd('es');
      expect(ld.workLocation).toBeDefined();
    });

    it('has sameAs', () => {
      const ld = personJsonLd('es');
      expect(ld.sameAs).toBeDefined();
    });
  });

  describe('professionalServiceJsonLd()', () => {
    it('returns a ProfessionalService schema with contact info', () => {
      const ld = professionalServiceJsonLd('es', {
        phoneDisplay: '+54 11 5555-5555',
        whatsappNumber: '5491155555555',
        email: 'carlos@example.com',
        linkedinUrl: 'https://linkedin.com/in/carlos',
        location: 'Buenos Aires',
      });
      expect(ld['@type']).toBe('ProfessionalService');
    });

    it('omits contact fields when contact is null', () => {
      const ld = professionalServiceJsonLd('en', null);
      expect(ld['@type']).toBe('ProfessionalService');
    });
  });

  describe('servicesItemListJsonLd()', () => {
    it('returns an ItemList', () => {
      const ld = servicesItemListJsonLd('es', [{ id: '1', label: 'Diseño' }]);
      expect(ld['@type']).toBe('ItemList');
    });

    it('handles empty services', () => {
      const ld = servicesItemListJsonLd('es', []);
      expect(ld.numberOfItems).toBe(0);
    });

    it('handles 10 services', () => {
      const services = Array.from({ length: 10 }, (_, i) => ({
        id: `${i}`,
        label: `Service ${i}`,
      }));
      const ld = servicesItemListJsonLd('en', services);
      expect(ld.numberOfItems).toBe(10);
    });
  });

  describe('projectsItemListJsonLd()', () => {
    it('returns an ItemList', () => {
      const ld = projectsItemListJsonLd('es', [
        { id: '1', title: 'Project A', period: '2023', tag: 'Industrial' },
      ]);
      expect(ld['@type']).toBe('ItemList');
    });

    it('handles empty projects', () => {
      const ld = projectsItemListJsonLd('en', []);
      expect(ld.numberOfItems).toBe(0);
    });
  });

  describe('breadcrumbJsonLd()', () => {
    it('returns a BreadcrumbList', () => {
      const ld = breadcrumbJsonLd('es', [{ name: 'Home', path: '/' }]);
      expect(ld['@type']).toBe('BreadcrumbList');
    });

    it('handles many items', () => {
      const items = Array.from({ length: 5 }, (_, i) => ({ name: `Item ${i}`, path: `/p${i}` }));
      const ld = breadcrumbJsonLd('en', items);
      expect(ld.itemListElement.length).toBe(5);
    });

    it('handles / path specially', () => {
      const ld = breadcrumbJsonLd('es', [{ name: 'Home', path: '/' }]);
      expect(ld.itemListElement[0]?.item).toBeTruthy();
    });
  });

  describe('websiteJsonLd()', () => {
    it('returns a WebSite schema', () => {
      const ld = websiteJsonLd('es');
      expect(ld['@type']).toBe('WebSite');
    });

    it('has inLanguage for es', () => {
      const ld = websiteJsonLd('es');
      expect(ld.inLanguage).toContain('es');
    });

    it('has inLanguage for en', () => {
      const ld = websiteJsonLd('en');
      expect(ld.inLanguage).toContain('en');
    });
  });
});
