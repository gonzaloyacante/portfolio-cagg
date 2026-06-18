import { describe, expect, it } from 'vitest';

import { enableTotpSchema, verifyTotpSetupSchema, disableTotpSchema } from '@/validations/security';
import { totpSchema } from '@/validations/totp';

// Massive density: every kind of input

describe('security/totp validations — extra density', () => {
  describe('enableTotpSchema: password variations', () => {
    it.each([
      'a',
      'ab',
      'abc',
      'password',
      'P4$$w0rd',
      '12345',
      'a'.repeat(100),
      'a'.repeat(1000),
      'a'.repeat(10_000),
      '   spaces   ',
      'tabs\there\tok',
      'newlines\nhere\nok',
      '   ',
      'with "quotes"',
      "with 'apostrophes'",
      'with <html>injection</html>',
      'unicode: 你好 🔐',
      'with emoji 🔐',
      "'); DROP TABLE users;--",
      "'; DROP TABLE users; --",
      '<script>alert(1)</script>',
      'javascript:alert(1)',
    ])('accepts password: %j', (password) => {
      expect(enableTotpSchema.safeParse({ password }).success).toBe(true);
    });

    it.each([['']])('rejects empty password: %j', (password) => {
      expect(enableTotpSchema.safeParse({ password }).success).toBe(false);
    });
  });

  describe('verifyTotpSetupSchema: code variations', () => {
    it.each([
      '000000',
      '111111',
      '999999',
      '100000',
      '010101',
      '000001',
      '000010',
      '000100',
      '001000',
      '010000',
      '100000',
      '123456',
      '654321',
      '424242',
      '867530',
      '135790',
      '246802',
      '112233',
      '445566',
      '778899',
      '001100',
      '110011',
      '101010',
      '010101',
      '121212',
      '212121',
      '000000',
    ])('accepts 6-digit code: %s', (code) => {
      expect(verifyTotpSetupSchema.safeParse({ code }).success).toBe(true);
    });

    it.each([
      '',
      '0',
      '00',
      '000',
      '0000',
      '00000',
      '0000000',
      '00000000',
      '000000000',
      'a23456',
      '1a3456',
      '12a456',
      '123a56',
      '1234a6',
      '12345a',
      'abcdef',
      '12 456',
      '12-456',
      '12.456',
      '12_456',
      '12+456',
      '12,456',
      '12\n456',
      '12\t456',
      'AB1234',
      '12#456',
      '12$456',
    ])('rejects invalid code: %j', (code) => {
      expect(verifyTotpSetupSchema.safeParse({ code }).success).toBe(false);
    });
  });

  describe('disableTotpSchema: password variations', () => {
    it.each([
      'a',
      'password',
      'P4$$w0rd',
      '12345',
      'a'.repeat(100),
      'with unicode 你好',
      'with emoji 🔐',
    ])('accepts password: %j', (password) => {
      expect(disableTotpSchema.safeParse({ password }).success).toBe(true);
    });

    it.each([['']])('rejects empty password: %j', (password) => {
      expect(disableTotpSchema.safeParse({ password }).success).toBe(false);
    });
  });

  describe('totpSchema: code variations', () => {
    it.each([
      '000000',
      '123456',
      '999999',
      '111111',
      '222222',
      '333333',
      '444444',
      '555555',
      '666666',
      '777777',
      '888888',
    ])('accepts code: %s', (code) => {
      expect(totpSchema.safeParse({ code }).success).toBe(true);
    });

    it.each([
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
      'a23456',
      '12 456',
      '12-456',
      'AB1234',
      '12#456',
    ])('rejects code: %j', (code) => {
      expect(totpSchema.safeParse({ code }).success).toBe(false);
    });
  });

  describe('error message text', () => {
    it('enableTotpSchema: empty password gives "Contraseña requerida"', () => {
      const r = enableTotpSchema.safeParse({ password: '' });
      expect(r.success).toBe(false);
      if (!r.success) {
        expect(r.error.issues[0]?.message).toContain('Contraseña requerida');
      }
    });

    it('verifyTotpSetupSchema: short code gives "6 dígitos"', () => {
      const r = verifyTotpSetupSchema.safeParse({ code: '123' });
      expect(r.success).toBe(false);
      if (!r.success) {
        expect(r.error.issues[0]?.message).toContain('6 dígitos');
      }
    });

    it('verifyTotpSetupSchema: alpha code gives "Solo números"', () => {
      const r = verifyTotpSetupSchema.safeParse({ code: 'abcdef' });
      expect(r.success).toBe(false);
      if (!r.success) {
        expect(r.error.issues[0]?.message).toContain('Solo números');
      }
    });

    it('totpSchema: short code gives "6 dígitos"', () => {
      const r = totpSchema.safeParse({ code: '12345' });
      expect(r.success).toBe(false);
      if (!r.success) {
        expect(r.error.issues[0]?.message).toContain('6 dígitos');
      }
    });

    it('totpSchema: alpha code gives "Solo números"', () => {
      const r = totpSchema.safeParse({ code: 'abcdef' });
      expect(r.success).toBe(false);
      if (!r.success) {
        expect(r.error.issues[0]?.message).toContain('Solo números');
      }
    });

    it('disableTotpSchema: empty password gives "Contraseña requerida"', () => {
      const r = disableTotpSchema.safeParse({ password: '' });
      expect(r.success).toBe(false);
      if (!r.success) {
        expect(r.error.issues[0]?.message).toContain('Contraseña requerida');
      }
    });
  });

  describe('type error cases', () => {
    it.each([123, null, undefined, true, false, [], {}, 'string'])(
      'enableTotpSchema rejects non-object: %j',
      (input) => {
        expect(enableTotpSchema.safeParse(input).success).toBe(false);
      }
    );

    it.each([123, null, undefined, true, false, [], {}, 'string'])(
      'verifyTotpSetupSchema rejects non-object: %j',
      (input) => {
        expect(verifyTotpSetupSchema.safeParse(input).success).toBe(false);
      }
    );

    it.each([123, null, undefined, true, false, [], {}, 'string'])(
      'disableTotpSchema rejects non-object: %j',
      (input) => {
        expect(disableTotpSchema.safeParse(input).success).toBe(false);
      }
    );

    it.each([123, null, undefined, true, false, [], {}, 'string'])(
      'totpSchema rejects non-object: %j',
      (input) => {
        expect(totpSchema.safeParse(input).success).toBe(false);
      }
    );

    it('enableTotpSchema rejects missing password', () => {
      expect(enableTotpSchema.safeParse({}).success).toBe(false);
    });

    it('verifyTotpSetupSchema rejects missing code', () => {
      expect(verifyTotpSetupSchema.safeParse({}).success).toBe(false);
    });

    it('disableTotpSchema rejects missing password', () => {
      expect(disableTotpSchema.safeParse({}).success).toBe(false);
    });

    it('totpSchema rejects missing code', () => {
      expect(totpSchema.safeParse({}).success).toBe(false);
    });
  });
});
