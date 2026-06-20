import { describe, expect, it } from 'vitest';

import { getSectionHelp, SECTION_HELP } from '@/constants/admin-help';

const EXPECTED_SLUGS = [
  'hero',
  'contactInfo',
  'brands',
  'experience',
  'process',
  'services',
  'projects',
  'results',
  'testimonials',
  'timeline',
  'faqs',
  'sections',
  'media',
  'emailSettings',
  'system',
  'security',
  'messages',
];

describe('SECTION_HELP', () => {
  it.each(EXPECTED_SLUGS)('has an entry for %s', (slug) => {
    expect(SECTION_HELP[slug]).toBeDefined();
  });

  it.each(EXPECTED_SLUGS)('%s has a non-empty title', (slug) => {
    expect(SECTION_HELP[slug]?.title).toBeTruthy();
  });

  it.each(EXPECTED_SLUGS)('%s has a non-empty description', (slug) => {
    expect(SECTION_HELP[slug]?.description).toBeTruthy();
  });

  it.each(EXPECTED_SLUGS)('%s has a non-empty fieldHelp', (slug) => {
    expect(SECTION_HELP[slug]?.fieldHelp).toBeTruthy();
  });

  it.each(EXPECTED_SLUGS)('%s has a non-empty url', (slug) => {
    expect(SECTION_HELP[slug]?.url).toBeTruthy();
  });

  describe('fields where present', () => {
    it.each(EXPECTED_SLUGS)('%s fields (if any) have descriptions', (slug) => {
      const fields = SECTION_HELP[slug]?.fields;
      if (!fields) return;
      for (const [, field] of Object.entries(fields)) {
        expect(field.description).toBeTruthy();
      }
    });

    it.each(EXPECTED_SLUGS)('%s field tips (if any) are arrays of strings', (slug) => {
      const fields = SECTION_HELP[slug]?.fields;
      if (!fields) return;
      for (const [, field] of Object.entries(fields)) {
        if (field.tips) {
          expect(Array.isArray(field.tips)).toBe(true);
          for (const tip of field.tips) {
            expect(typeof tip).toBe('string');
          }
        }
      }
    });
  });

  describe('tips at the section level', () => {
    it.each(EXPECTED_SLUGS)('%s section-level tips (if any) are arrays of strings', (slug) => {
      const tips = SECTION_HELP[slug]?.tips;
      if (!tips) return;
      expect(Array.isArray(tips)).toBe(true);
      for (const tip of tips) {
        expect(typeof tip).toBe('string');
        expect(tip.length).toBeGreaterThan(0);
      }
    });
  });

  describe('concrete content checks', () => {
    it('hero entry mentions the headline', () => {
      expect(SECTION_HELP.hero?.fieldHelp.toLowerCase()).toContain('titular');
    });

    it('contactInfo entry mentions WhatsApp', () => {
      expect(SECTION_HELP.contactInfo?.fieldHelp.toLowerCase()).toContain('whatsapp');
    });

    it('security entry mentions 2FA', () => {
      expect(SECTION_HELP.security?.fieldHelp.toLowerCase()).toContain('2fa');
    });

    it('media entry mentions Cloudinary', () => {
      expect(SECTION_HELP.media?.fieldHelp).toContain('Cloudinary');
    });
  });
});

describe('getSectionHelp()', () => {
  it.each(EXPECTED_SLUGS)('returns the entry for %s', (slug) => {
    expect(getSectionHelp(slug)).toBe(SECTION_HELP[slug]);
  });

  it('returns undefined for unknown slug', () => {
    expect(getSectionHelp('unknown-slug')).toBeUndefined();
  });

  it('returns undefined for empty string', () => {
    expect(getSectionHelp('')).toBeUndefined();
  });
});
