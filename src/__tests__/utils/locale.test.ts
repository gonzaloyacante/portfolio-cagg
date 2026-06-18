import { describe, expect, it } from 'vitest';

import { loc } from '@/utils/locale';

describe('loc()', () => {
  describe('locale=es (Spanish)', () => {
    it('returns fieldEs when present', () => {
      expect(loc({ titleEs: 'Hola', titleEn: 'Hello' }, 'title', 'es')).toBe('Hola');
    });

    it('falls back to fieldEs if fieldEn is missing', () => {
      expect(loc({ titleEs: 'Hola' }, 'title', 'es')).toBe('Hola');
    });

    it('falls back to fieldEs if fieldEn is null', () => {
      expect(loc({ titleEs: 'Hola', titleEn: null }, 'title', 'es')).toBe('Hola');
    });

    it('falls back to fieldEs if fieldEn is empty string', () => {
      expect(loc({ titleEs: 'Hola', titleEn: '' }, 'title', 'es')).toBe('Hola');
    });

    it('returns "" when both are missing', () => {
      expect(loc({}, 'title', 'es')).toBe('');
    });

    it('returns "" when both are empty strings (nullish coalescing does not fall back on empty string)', () => {
      // ?? only falls back on null/undefined, not on empty string.
      expect(loc({ titleEs: '', titleEn: 'Hello' }, 'title', 'es')).toBe('');
    });
  });

  describe('locale=en (English)', () => {
    it('returns fieldEn when present', () => {
      expect(loc({ titleEs: 'Hola', titleEn: 'Hello' }, 'title', 'en')).toBe('Hello');
    });

    it('falls back to fieldEs (Spanish) if fieldEn is missing', () => {
      expect(loc({ titleEs: 'Hola' }, 'title', 'en')).toBe('Hola');
    });

    it('falls back to fieldEs if fieldEn is null', () => {
      expect(loc({ titleEs: 'Hola', titleEn: null }, 'title', 'en')).toBe('Hola');
    });

    it('does not fall back to fieldEs if fieldEn is empty (?? keeps empty string)', () => {
      // Same nullish-coalescing quirk — '' is not nullish.
      expect(loc({ titleEs: 'Hola', titleEn: '' }, 'title', 'en')).toBe('');
    });

    it('returns the non-string as-is (cast does not validate)', () => {
      // The function casts via `as string` but does not validate, so a number
      // is returned as the string "42" via JS coercion.
      expect(loc({ titleEs: 'Hola', titleEn: 42 as unknown as string }, 'title', 'en')).toBe(
        42 as unknown as string
      );
    });
  });

  describe('different field names', () => {
    it.each([
      ['name'],
      ['headline'],
      ['summary'],
      ['body'],
      ['tag'],
      ['period'],
      ['label'],
      ['quote'],
      ['role'],
      ['sector'],
      ['q'],
      ['a'],
      ['k'],
      ['v'],
      ['overline'],
      ['desc'],
    ])('handles field: %s', (field) => {
      const obj = { [`${field}Es`]: 'es-value', [`${field}En`]: 'en-value' };
      expect(loc(obj, field, 'es')).toBe('es-value');
      expect(loc(obj, field, 'en')).toBe('en-value');
    });
  });

  describe('arbitrary locale (not es/en)', () => {
    it('returns fieldEs for any non-en locale', () => {
      expect(loc({ titleEs: 'Hola', titleEn: 'Hello' }, 'title', 'fr')).toBe('Hola');
      expect(loc({ titleEs: 'Hola', titleEn: 'Hello' }, 'title', 'pt')).toBe('Hola');
      expect(loc({ titleEs: 'Hola', titleEn: 'Hello' }, 'title', '')).toBe('Hola');
    });
  });

  describe('object safety', () => {
    it('does not throw on unexpected value types', () => {
      // Same nullish-coalescing behavior: a number cast as string is not
      // nullish, so it gets returned as-is.
      expect(loc({ titleEs: 123 as unknown as string }, 'title', 'es')).toBe(
        123 as unknown as string
      );
    });

    it('handles deeply nested keys without exploding', () => {
      const obj = { deeplyNestedEs: 'a' };
      expect(loc(obj, 'deeplyNested', 'es')).toBe('a');
    });
  });

  describe('concrete examples from the codebase', () => {
    it('handles a full project item', () => {
      const project = {
        tag: 'Industrial',
        periodEs: '2023',
        periodEn: '2023',
        titleEs: 'Optimización línea A',
        titleEn: 'Line A optimization',
        challengeEs: 'C',
        challengeEn: 'C',
        interventionEs: 'I',
        interventionEn: 'I',
        outcomeEs: 'O',
        outcomeEn: 'O',
      };
      expect(loc(project, 'title', 'es')).toBe('Optimización línea A');
      expect(loc(project, 'title', 'en')).toBe('Line A optimization');
    });

    it('handles a testimonial item', () => {
      const t = {
        quoteEs: 'Excelente',
        quoteEn: 'Excellent',
        roleEs: 'CEO',
        roleEn: 'CEO',
        sectorEs: 'Industrial',
        sectorEn: 'Industrial',
      };
      expect(loc(t, 'quote', 'es')).toBe('Excelente');
      expect(loc(t, 'role', 'en')).toBe('CEO');
    });
  });
});
