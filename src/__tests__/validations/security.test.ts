import { describe, expect, it } from 'vitest';

import { disableTotpSchema, enableTotpSchema, verifyTotpSetupSchema } from '@/validations/security';

describe('enableTotpSchema', () => {
  it.each(['a', '1', 'short', 'x', 'a'.repeat(100), 'p4$$w0rd', 'with spaces', '🔐'])(
    'accepts non-empty password: %j',
    (password) => {
      const result = enableTotpSchema.safeParse({ password });
      expect(result.success).toBe(true);
    }
  );

  it.each([['']])('rejects empty password: %j', (password) => {
    const result = enableTotpSchema.safeParse({ password });
    expect(result.success).toBe(false);
  });

  it('accepts a single space (min(1) is a length check)', () => {
    const result = enableTotpSchema.safeParse({ password: ' ' });
    expect(result.success).toBe(true);
  });

  it('rejects null', () => {
    const result = enableTotpSchema.safeParse({ password: null });
    expect(result.success).toBe(false);
  });

  it('mentions "Contraseña requerida" on empty password', () => {
    const result = enableTotpSchema.safeParse({ password: '' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toContain('Contraseña requerida');
    }
  });
});

describe('verifyTotpSetupSchema', () => {
  it.each([
    '000000',
    '123456',
    '999999',
    '111111',
    '424242',
    '867530',
    '135790',
    '000001',
    '100000',
    '010101',
  ])('accepts valid 6-digit code: %s', (code) => {
    const result = verifyTotpSetupSchema.safeParse({ code });
    expect(result.success).toBe(true);
  });

  it.each(['', '1', '12', '123', '1234', '12345', '1234567', '12345678'])(
    'rejects code with wrong length: %j',
    (code) => {
      const result = verifyTotpSetupSchema.safeParse({ code });
      expect(result.success).toBe(false);
    }
  );

  it.each([
    '12345a',
    'a23456',
    'abcdef',
    '12-456',
    '12 456',
    '12.456',
    'AB1234',
    '12,456',
    '12\n456',
  ])('rejects code with non-digits: %j', (code) => {
    const result = verifyTotpSetupSchema.safeParse({ code });
    expect(result.success).toBe(false);
  });

  it('mentions "6 dígitos" on length mismatch', () => {
    const result = verifyTotpSetupSchema.safeParse({ code: '12345' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.map((i) => i.message).join(' ')).toContain('6 dígitos');
    }
  });

  it('mentions "Solo números" on non-digit input', () => {
    const result = verifyTotpSetupSchema.safeParse({ code: '12345a' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.map((i) => i.message).join(' ')).toContain('Solo números');
    }
  });
});

describe('disableTotpSchema', () => {
  it.each(['a', '1', 'short', 'x', 'a'.repeat(100), 'p4$$w0rd', 'with spaces'])(
    'accepts non-empty password: %j',
    (password) => {
      const result = disableTotpSchema.safeParse({ password });
      expect(result.success).toBe(true);
    }
  );

  it.each([['']])('rejects empty password: %j', (password) => {
    const result = disableTotpSchema.safeParse({ password });
    expect(result.success).toBe(false);
  });

  it('accepts a single space (min(1) is a length check)', () => {
    const result = disableTotpSchema.safeParse({ password: ' ' });
    expect(result.success).toBe(true);
  });

  it('rejects null', () => {
    const result = disableTotpSchema.safeParse({ password: null });
    expect(result.success).toBe(false);
  });

  it('rejects number', () => {
    const result = disableTotpSchema.safeParse({ password: 12345 });
    expect(result.success).toBe(false);
  });
});
