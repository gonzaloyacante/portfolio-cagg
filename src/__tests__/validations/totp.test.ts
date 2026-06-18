import { describe, expect, it } from 'vitest';

import { totpSchema } from '@/validations/totp';

const VALID_CODES = [
  '000000',
  '123456',
  '999999',
  '100000',
  '010101',
  '987654',
  '111111',
  '000001',
  '000010',
  '000100',
  '001000',
  '010000',
  '100000',
  '424242',
  '867530',
  '135790',
  '246802',
  '111222',
  '123321',
  '321123',
];

const INVALID_LENGTHS = [
  '',
  '1',
  '12',
  '123',
  '1234',
  '12345',
  '1234567',
  '12345678',
  '123456789',
  '1234567890',
];

const INVALID_CHARS = [
  '12345a',
  'a23456',
  'abcdef',
  '123-56',
  '12 456',
  '12.456',
  '12_456',
  '12+456',
  'AB1234',
  '12,456',
  '12\n456',
  '12\t456',
  '12\r456',
  '12 4 5 6',
  '12345!',
  '12345?',
  '12#456',
  '12$456',
  '1.2345e1',
  'NaN',
  'undefined',
  'null',
];

describe('totpSchema', () => {
  describe('valid 6-digit numeric codes', () => {
    it.each(VALID_CODES)('accepts: %s', (code) => {
      const result = totpSchema.safeParse({ code });
      expect(result.success).toBe(true);
    });
  });

  describe('rejects codes with wrong length', () => {
    it.each(INVALID_LENGTHS)('rejects (length mismatch): %s', (code) => {
      const result = totpSchema.safeParse({ code });
      expect(result.success).toBe(false);
    });
  });

  describe('rejects codes with non-digits', () => {
    it.each(INVALID_CHARS)('rejects (non-digit): %s', (code) => {
      const result = totpSchema.safeParse({ code });
      expect(result.success).toBe(false);
    });
  });

  describe('error messages', () => {
    it('mentions "6 dígitos" on length mismatch', () => {
      const result = totpSchema.safeParse({ code: '12345' });
      expect(result.success).toBe(false);
      if (!result.success) {
        const msg = result.error.issues.map((i) => i.message).join(' ');
        expect(msg).toContain('6 dígitos');
      }
    });

    it('mentions "Solo números" on non-digit input', () => {
      const result = totpSchema.safeParse({ code: '12345a' });
      expect(result.success).toBe(false);
      if (!result.success) {
        const msg = result.error.issues.map((i) => i.message).join(' ');
        expect(msg).toContain('Solo números');
      }
    });
  });

  describe('type errors', () => {
    it.each([[123456], [123.456], [true], [null], [undefined], [{}], [[]]])(
      'rejects non-string code: %j',
      (code) => {
        const result = totpSchema.safeParse({ code });
        expect(result.success).toBe(false);
      }
    );
  });
});
