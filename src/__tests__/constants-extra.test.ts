import { describe, expect, it } from 'vitest';

import { ADMIN_NAV, COLLECTION_CONFIG, SUMMARIZERS } from '@/constants/admin-config';
import { SECTION_HELP, getSectionHelp } from '@/constants/admin-help';

// Massive density: every combination

describe('constants — extra density', () => {
  describe('ADMIN_NAV — every entry', () => {
    it('has Resumen group entries', () => {
      const resumen = ADMIN_NAV.filter((i) => i.group === 'Resumen');
      expect(resumen.length).toBeGreaterThan(0);
    });

    it('has Contenido group entries', () => {
      const contenido = ADMIN_NAV.filter((i) => i.group === 'Contenido');
      expect(contenido.length).toBeGreaterThan(0);
    });

    it('has Sistema group entries', () => {
      const sistema = ADMIN_NAV.filter((i) => i.group === 'Sistema');
      expect(sistema.length).toBeGreaterThan(0);
    });

    it('every href is unique', () => {
      const hrefs = ADMIN_NAV.map((i) => i.href);
      expect(new Set(hrefs).size).toBe(hrefs.length);
    });

    it('every label is unique', () => {
      const labels = ADMIN_NAV.map((i) => i.label);
      expect(new Set(labels).size).toBe(labels.length);
    });

    it('every href starts with /admin', () => {
      for (const item of ADMIN_NAV) {
        expect(item.href.startsWith('/admin')).toBe(true);
      }
    });

    it('contains the dashboard entry', () => {
      expect(ADMIN_NAV.some((i) => i.href === '/admin')).toBe(true);
    });

    it('contains a messages entry', () => {
      expect(ADMIN_NAV.some((i) => i.href === '/admin/messages')).toBe(true);
    });

    it('contains every collection', () => {
      for (const slug of [
        'brands',
        'experience',
        'process',
        'services',
        'projects',
        'results',
        'testimonials',
        'timeline',
        'faqs',
      ]) {
        expect(ADMIN_NAV.some((i) => i.href === `/admin/${slug}`)).toBe(true);
      }
    });

    it('contains a system settings entry', () => {
      expect(ADMIN_NAV.some((i) => i.href === '/admin/system')).toBe(true);
    });

    it('contains a security entry', () => {
      expect(ADMIN_NAV.some((i) => i.href === '/admin/security')).toBe(true);
    });

    it('contains an email entry', () => {
      expect(ADMIN_NAV.some((i) => i.href === '/admin/email-settings')).toBe(true);
    });

    it('contains a media entry', () => {
      expect(ADMIN_NAV.some((i) => i.href === '/admin/media')).toBe(true);
    });

    it('contains a sections entry', () => {
      expect(ADMIN_NAV.some((i) => i.href === '/admin/sections')).toBe(true);
    });

    it('contains a contact info entry', () => {
      expect(ADMIN_NAV.some((i) => i.href === '/admin/contact-info')).toBe(true);
    });

    it('contains a hero entry', () => {
      expect(ADMIN_NAV.some((i) => i.href === '/admin/hero')).toBe(true);
    });
  });

  describe('COLLECTION_CONFIG — every field shape', () => {
    it('brands has single text field', () => {
      const config = COLLECTION_CONFIG.brands;
      for (const f of config.fields) {
        expect(f.kind).toBe('single');
        if (f.kind === 'single') {
          expect(f.type).toBe('text');
        }
      }
    });

    it('services has bilingual text field', () => {
      const config = COLLECTION_CONFIG.services;
      for (const f of config.fields) {
        expect(f.kind).toBe('bilingual');
        if (f.kind === 'bilingual') {
          expect(f.type).toBe('text');
        }
      }
    });

    it('projects has many fields (6+)', () => {
      expect(COLLECTION_CONFIG.projects.fields.length).toBeGreaterThanOrEqual(6);
    });

    it('testimonials has at least 3 fields', () => {
      expect(COLLECTION_CONFIG.testimonials.fields.length).toBeGreaterThanOrEqual(3);
    });

    it('faqs has exactly 2 fields', () => {
      expect(COLLECTION_CONFIG.faqs.fields.length).toBe(2);
    });

    it('every collection has a non-empty label', () => {
      for (const slug of Object.keys(COLLECTION_CONFIG)) {
        expect(COLLECTION_CONFIG[slug]?.label).toBeTruthy();
      }
    });

    it('every collection label is unique', () => {
      const labels = Object.values(COLLECTION_CONFIG).map((c) => c.label);
      expect(new Set(labels).size).toBe(labels.length);
    });
  });

  describe('SUMMARIZERS — exhaustive', () => {
    const SLUGS = [
      'brands',
      'experience',
      'process',
      'services',
      'projects',
      'results',
      'testimonials',
      'timeline',
      'faqs',
    ];

    it.each(SLUGS)('%s has a summarizer', (slug) => {
      expect(SUMMARIZERS[slug]).toBeTypeOf('function');
    });

    it.each(SLUGS)('%s returns a string for an empty object', (slug) => {
      const result = SUMMARIZERS[slug]({});
      expect(typeof result).toBe('string');
    });

    it.each(SLUGS)('%s returns a string for full data', (slug) => {
      const full = {
        name: 'N',
        titleEs: 'T',
        titleEn: 'T',
        bodyEs: 'B',
        bodyEn: 'B',
        labelEs: 'L',
        labelEn: 'L',
        tag: 'tag',
        periodEs: 'p',
        periodEn: 'p',
        challengeEs: 'c',
        challengeEn: 'c',
        interventionEs: 'i',
        interventionEn: 'i',
        outcomeEs: 'o',
        outcomeEn: 'o',
        kEs: 'k',
        kEn: 'k',
        vEs: 'v',
        vEn: 'v',
        quoteEs: 'q',
        quoteEn: 'q',
        roleEs: 'r',
        roleEn: 'r',
        sectorEs: 's',
        sectorEn: 's',
        period: 'p',
        qEs: 'q',
        qEn: 'q',
        aEs: 'a',
        aEn: 'a',
      };
      const result = SUMMARIZERS[slug](full);
      expect(typeof result).toBe('string');
    });
  });
});

describe('SECTION_HELP — extra density', () => {
  it('all 17 sections exist', () => {
    expect(Object.keys(SECTION_HELP).length).toBe(17);
  });

  it('every entry has the right shape', () => {
    for (const [slug, entry] of Object.entries(SECTION_HELP)) {
      expect(entry.title, `${slug}.title`).toBeTruthy();
      expect(entry.description, `${slug}.description`).toBeTruthy();
      expect(entry.fieldHelp, `${slug}.fieldHelp`).toBeTruthy();
      expect(entry.url, `${slug}.url`).toBeTruthy();
    }
  });

  it('every field has a description', () => {
    for (const [slug, entry] of Object.entries(SECTION_HELP)) {
      if (entry.fields) {
        for (const [name, field] of Object.entries(entry.fields)) {
          expect(field.description, `${slug}.${name}.description`).toBeTruthy();
        }
      }
    }
  });

  it('every section-level tip is non-empty', () => {
    for (const [, entry] of Object.entries(SECTION_HELP)) {
      if (entry.tips) {
        for (const tip of entry.tips) {
          expect(tip).toBeTruthy();
        }
      }
    }
  });

  it('getSectionHelp returns the entry for each slug', () => {
    for (const slug of Object.keys(SECTION_HELP)) {
      expect(getSectionHelp(slug)).toBe(SECTION_HELP[slug]);
    }
  });

  it('getSectionHelp returns undefined for unknown slug', () => {
    expect(getSectionHelp('not-a-slug')).toBeUndefined();
  });

  it('getSectionHelp returns undefined for empty string', () => {
    expect(getSectionHelp('')).toBeUndefined();
  });
});
