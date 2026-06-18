import { describe, expect, it } from 'vitest';

import { forgotPasswordSchema } from '@/validations/forgot-password';

describe('forgotPasswordSchema', () => {
  describe('valid emails', () => {
    it.each([
      'a@b.co',
      'carlos@portfolio-cag.app',
      'me+tag@gmail.com',
      'user_name@sub.domain.org',
      'UPPERCASE@DOMAIN.COM',
      'numbers123@example.com',
      't@x.io',
      'first.last@example.co.uk',
      'team@startup.example.io',
      'a@b.io',
      'a@b.co',
      'a@b.dev',
    ])('accepts: %s', (email) => {
      const result = forgotPasswordSchema.safeParse({ email });
      expect(result.success).toBe(true);
    });
  });

  describe('invalid emails', () => {
    it.each([
      '',
      'bad',
      '@b.com',
      'a@',
      'a@.com',
      'a@b.',
      'a b@c.com',
      'a@@b.com',
      'a@-b.com',
      'a@b..com',
      'a@b.com ',
      ' a@b.com',
    ])('rejects: %s', (email) => {
      const result = forgotPasswordSchema.safeParse({ email });
      expect(result.success).toBe(false);
    });
  });

  describe('error messages', () => {
    it('mentions "Email inválido" on bad email', () => {
      const result = forgotPasswordSchema.safeParse({ email: 'nope' });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain('Email inválido');
      }
    });
  });

  describe('type errors', () => {
    it.each([[null], [undefined], [123], [{}], [[]], ['plain string instead of object']])(
      'rejects non-object: %j',
      (input) => {
        const result = forgotPasswordSchema.safeParse(input);
        expect(result.success).toBe(false);
      }
    );
  });
});
