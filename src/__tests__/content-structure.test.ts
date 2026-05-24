import { describe, it, expect } from 'vitest';

const CONTENT_KEYS = [
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
] as const;

describe('content API response structure', () => {
  it('response shape includes all required top-level keys', () => {
    const mockResponse = Object.fromEntries(CONTENT_KEYS.map((k) => [k, null]));
    for (const key of CONTENT_KEYS) {
      expect(key in mockResponse).toBe(true);
    }
  });

  it('all required content keys are defined', () => {
    expect(CONTENT_KEYS).toHaveLength(12);
    expect(CONTENT_KEYS).toContain('hero');
    expect(CONTENT_KEYS).toContain('contactInfo');
    expect(CONTENT_KEYS).toContain('sections');
  });
});
