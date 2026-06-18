import { describe, expect, it } from 'vitest';

import {
  ADMIN_NAV,
  ADMIN_NAV_GROUPS,
  COLLECTION_CONFIG,
  SUMMARIZERS,
} from '@/constants/admin-config';

describe('ADMIN_NAV', () => {
  it('has at least one item', () => {
    expect(ADMIN_NAV.length).toBeGreaterThan(0);
  });

  it('every item has the required shape', () => {
    for (const item of ADMIN_NAV) {
      expect(item.href).toMatch(/^\/admin/);
      expect(item.label).toBeTruthy();
      expect(item.group).toBeTruthy();
    }
  });

  it('hrefs are unique', () => {
    const hrefs = ADMIN_NAV.map((i) => i.href);
    expect(new Set(hrefs).size).toBe(hrefs.length);
  });

  it('groups are all in ADMIN_NAV_GROUPS', () => {
    const groups = new Set(ADMIN_NAV.map((i) => i.group));
    for (const group of groups) {
      expect(ADMIN_NAV_GROUPS).toContain(group);
    }
  });

  it('contains the expected top-level entries', () => {
    const labels = ADMIN_NAV.map((i) => i.label);
    expect(labels).toContain('Panel');
    expect(labels).toContain('Mensajes');
    expect(labels).toContain('Inicio');
  });

  it('contains every collection', () => {
    const hrefs = ADMIN_NAV.map((i) => i.href);
    expect(hrefs).toContain('/admin/brands');
    expect(hrefs).toContain('/admin/experience');
    expect(hrefs).toContain('/admin/process');
    expect(hrefs).toContain('/admin/services');
    expect(hrefs).toContain('/admin/projects');
    expect(hrefs).toContain('/admin/results');
    expect(hrefs).toContain('/admin/testimonials');
    expect(hrefs).toContain('/admin/timeline');
    expect(hrefs).toContain('/admin/faqs');
  });
});

describe('ADMIN_NAV_GROUPS', () => {
  it('contains Resumen, Contenido, Sistema', () => {
    expect(ADMIN_NAV_GROUPS).toContain('Resumen');
    expect(ADMIN_NAV_GROUPS).toContain('Contenido');
    expect(ADMIN_NAV_GROUPS).toContain('Sistema');
  });

  it('is readonly tuple-like (literal types)', () => {
    expect(ADMIN_NAV_GROUPS.length).toBe(3);
  });
});

describe('COLLECTION_CONFIG', () => {
  const EXPECTED_SLUGS = [
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

  it.each(EXPECTED_SLUGS)('has config for slug: %s', (slug) => {
    expect(COLLECTION_CONFIG[slug]).toBeDefined();
  });

  it.each(EXPECTED_SLUGS)('config for %s has a label', (slug) => {
    const config = COLLECTION_CONFIG[slug];
    expect(config?.label).toBeTruthy();
  });

  it.each(EXPECTED_SLUGS)('config for %s has at least one field', (slug) => {
    const config = COLLECTION_CONFIG[slug];
    expect(config?.fields.length).toBeGreaterThan(0);
  });

  it.each(EXPECTED_SLUGS)('config for %s has unique field names', (slug) => {
    const config = COLLECTION_CONFIG[slug];
    const names = new Set<string>();
    for (const f of config?.fields ?? []) {
      const name = f.kind === 'bilingual' ? f.baseName : f.name;
      expect(names.has(name)).toBe(false);
      names.add(name);
    }
  });

  it('brands has a single name field', () => {
    const config = COLLECTION_CONFIG.brands;
    expect(config?.fields.length).toBe(1);
    expect(config?.fields[0]?.kind).toBe('single');
    if (config?.fields[0]?.kind === 'single') {
      expect(config.fields[0].name).toBe('name');
    }
  });

  it('projects has at least 5 fields', () => {
    expect(COLLECTION_CONFIG.projects?.fields.length).toBeGreaterThanOrEqual(5);
  });

  it.each([
    'brands',
    'experience',
    'process',
    'services',
    'projects',
    'results',
    'testimonials',
    'timeline',
    'faqs',
  ])('all fields in %s are either "text" or "textarea"', (slug) => {
    const config = COLLECTION_CONFIG[slug];
    for (const f of config?.fields ?? []) {
      expect(['text', 'textarea']).toContain(f.type);
    }
  });
});

describe('SUMMARIZERS', () => {
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

  it.each(SLUGS)('has a summarizer for %s', (slug) => {
    expect(SUMMARIZERS[slug]).toBeTypeOf('function');
  });

  it('brands summarizer returns the name', () => {
    expect(SUMMARIZERS.brands({ name: 'Acme' })).toBe('Acme');
  });

  it('experience summarizer returns titleEs', () => {
    expect(SUMMARIZERS.experience({ titleEs: 'Senior' })).toBe('Senior');
  });

  it('process summarizer returns titleEs', () => {
    expect(SUMMARIZERS.process({ titleEs: 'Descubrimiento' })).toBe('Descubrimiento');
  });

  it('services summarizer returns labelEs', () => {
    expect(SUMMARIZERS.services({ labelEs: 'Diseño' })).toBe('Diseño');
  });

  it('projects summarizer returns titleEs', () => {
    expect(SUMMARIZERS.projects({ titleEs: 'Optimización' })).toBe('Optimización');
  });

  it('results summarizer formats as kEs: vEs', () => {
    expect(SUMMARIZERS.results({ kEs: 'Años', vEs: '15+' })).toBe('Años: 15+');
  });

  it('testimonials summarizer returns roleEs', () => {
    expect(SUMMARIZERS.testimonials({ roleEs: 'CEO' })).toBe('CEO');
  });

  it('timeline summarizer formats as period — titleEs', () => {
    expect(SUMMARIZERS.timeline({ period: '2020-2023', titleEs: 'Fundé X' })).toBe(
      '2020-2023 — Fundé X'
    );
  });

  it('faqs summarizer returns qEs', () => {
    expect(SUMMARIZERS.faqs({ qEs: '¿Cuánto cuesta?' })).toBe('¿Cuánto cuesta?');
  });

  describe('handles missing/odd values', () => {
    it.each(SLUGS.filter((s) => s !== 'results' && s !== 'timeline'))(
      '%s returns "" for empty object',
      (slug) => {
        expect(SUMMARIZERS[slug]({})).toBe('');
      }
    );

    it('results returns ": " for empty object (literal template, not a smart fallback)', () => {
      // The summarizer uses a template literal: `${str(kEs)}: ${str(vEs)}`
      // When both are empty, you get ": ". The function is intentionally simple.
      expect(SUMMARIZERS.results({})).toBe(': ');
    });

    it('timeline returns " — " for empty object (literal template)', () => {
      // Same as above: `${str(period)} — ${str(titleEs)}`.
      expect(SUMMARIZERS.timeline({})).toBe(' — ');
    });

    it.each(SLUGS.filter((s) => s !== 'results' && s !== 'timeline'))(
      '%s returns "" for null field',
      (slug) => {
        expect(
          SUMMARIZERS[slug]({
            name: null,
            titleEs: null,
            labelEs: null,
            qEs: null,
            kEs: null,
            vEs: null,
            roleEs: null,
            period: null,
          })
        ).toBe('');
      }
    );

    it.each(SLUGS.filter((s) => s !== 'results' && s !== 'timeline'))(
      '%s returns "" for non-string field',
      (slug) => {
        expect(
          SUMMARIZERS[slug]({
            name: 42,
            titleEs: 42,
            labelEs: 42,
            qEs: 42,
            kEs: 42,
            vEs: 42,
            roleEs: 42,
            period: 42,
          })
        ).toBe('');
      }
    );
  });
});
