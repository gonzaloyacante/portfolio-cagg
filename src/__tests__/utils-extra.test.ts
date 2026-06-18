import { describe, expect, it } from 'vitest';

import { clientKey } from '@/lib/rate-limit';
import { cn } from '@/lib/utils';
import { loc } from '@/utils/locale';

describe('utilities — extra density', () => {
  describe('cn()', () => {
    it('combines many classes', () => {
      expect(cn('a', 'b', 'c', 'd', 'e', 'f')).toBe('a b c d e f');
    });

    it('handles all kinds of falsy', () => {
      expect(cn('a', false, null, undefined, 0, '', 'b', NaN)).toBe('a b');
    });

    it('handles deeply nested arrays', () => {
      expect(cn(['a', ['b', ['c', ['d', 'e']]]])).toBe('a b c d e');
    });

    it('combines object notation with strings', () => {
      const result = cn('base', { active: true, disabled: false, hidden: true });
      expect(result).toContain('base');
      expect(result).toContain('active');
      expect(result).not.toContain('disabled');
      expect(result).toContain('hidden');
    });

    it('resolves tailwind conflicts', () => {
      expect(cn('p-2', 'p-4')).toBe('p-4');
      expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500');
      expect(cn('m-1', 'm-2', 'm-3', 'm-4')).toBe('m-4');
    });

    it('keeps non-conflicting classes', () => {
      expect(cn('p-4', 'm-2', 'text-sm', 'font-bold', 'rounded', 'border')).toBe(
        'p-4 m-2 text-sm font-bold rounded border'
      );
    });

    it('handles very long class strings', () => {
      const longClass = 'a'.repeat(1000);
      expect(cn(longClass)).toBe(longClass);
    });
  });

  describe('loc()', () => {
    it('every two-letter field with both locales', () => {
      const fields = ['id', 'to', 'cc', 'aa'];
      for (const field of fields) {
        const obj = { [`${field}Es`]: 'es', [`${field}En`]: 'en' };
        expect(loc(obj, field, 'es')).toBe('es');
        expect(loc(obj, field, 'en')).toBe('en');
      }
    });

    it('handles every English locale (returns En)', () => {
      const obj = { titleEs: 'Hola', titleEn: 'Hello' };
      expect(loc(obj, 'title', 'en')).toBe('Hello');
    });

    it('handles every non-English locale (returns Es)', () => {
      const obj = { titleEs: 'Hola', titleEn: 'Hello' };
      for (const locale of [
        'es',
        'fr',
        'de',
        'it',
        'pt',
        'ja',
        'zh',
        'ru',
        'ar',
        'ko',
        'th',
        'vi',
      ]) {
        expect(loc(obj, 'title', locale)).toBe('Hola');
      }
    });

    it('handles empty string locale', () => {
      const obj = { titleEs: 'Hola', titleEn: 'Hello' };
      expect(loc(obj, 'title', '')).toBe('Hola');
    });

    it('handles missing locale param', () => {
      const obj = { titleEs: 'Hola' };
      expect(loc(obj, 'title', '' as unknown as 'es' | 'en')).toBe('Hola');
    });

    it('preserves special characters', () => {
      const obj = { bodyEs: 'áéíóú ñ ¿?', bodyEn: 'aeiou n ?' };
      expect(loc(obj, 'body', 'es')).toBe('áéíóú ñ ¿?');
      expect(loc(obj, 'body', 'en')).toBe('aeiou n ?');
    });

    it('preserves HTML/script content as-is', () => {
      const obj = { bodyEs: '<script>alert(1)</script>', bodyEn: 'safe' };
      expect(loc(obj, 'body', 'es')).toBe('<script>alert(1)</script>');
    });

    it('handles very long values', () => {
      const long = 'a'.repeat(10_000);
      const obj = { titleEs: long, titleEn: 'en' };
      expect(loc(obj, 'title', 'es').length).toBe(10_000);
    });
  });

  describe('clientKey()', () => {
    it.each([
      ['1.1.1.1', '1.1.1.1'],
      ['10.0.0.1', '10.0.0.1'],
      ['192.168.1.1', '192.168.1.1'],
      ['255.255.255.255', '255.255.255.255'],
      ['0.0.0.0', '0.0.0.0'],
      ['127.0.0.1', '127.0.0.1'],
      ['2001:db8::1', '2001:db8::1'],
      ['::1', '::1'],
    ])('extracts IP: %s', (ip, expected) => {
      const req = new Request('https://x.com', { headers: { 'x-forwarded-for': ip } });
      expect(clientKey(req)).toBe(expected);
    });

    it('uses first IP in comma list', () => {
      const req = new Request('https://x.com', {
        headers: { 'x-forwarded-for': '1.1.1.1, 2.2.2.2, 3.3.3.3' },
      });
      expect(clientKey(req)).toBe('1.1.1.1');
    });

    it('trims whitespace from first IP', () => {
      const req = new Request('https://x.com', {
        headers: { 'x-forwarded-for': '  1.1.1.1  ,  2.2.2.2  ' },
      });
      expect(clientKey(req)).toBe('1.1.1.1');
    });

    it('falls back to x-real-ip when no x-forwarded-for', () => {
      const req = new Request('https://x.com', { headers: { 'x-real-ip': '1.2.3.4' } });
      expect(clientKey(req)).toBe('1.2.3.4');
    });

    it('falls back to "local" when no headers', () => {
      const req = new Request('https://x.com');
      expect(clientKey(req)).toBe('local');
    });
  });
});
