import { describe, expect, it } from 'vitest';

import { loginSchema, type LoginData } from '@/validations/login';

const VALID: LoginData = { email: 'user@example.com', password: 'super-secret-123' };

const VALID_EMAILS = [
  'a@b.co',
  'john.doe@acme.com',
  'carlos.guerra@portfolio-cag.app',
  'user+tag@gmail.com',
  'user_name@sub.domain.org',
  'admin@xn--80akhbyknj4f.com',
  'info@example.museum',
  'sales@portfolio.io',
  'me+filter@github.com',
  'team-lead@startup.co',
  'carlos@carlos-armando-guerra.dev',
  'contact@123.example.com',
  'first.last@example.co.uk',
  'a+b+c+d@example.com',
  'all-lowercase-here@example.com',
  'UPPERCASE@DOMAIN.COM',
  'MixedCase@Domain.Org',
  'numbers123@example.com',
  'with-dashes@my-domain.com',
  'with_underscores@example.com',
  'underscore_in_local@example.com',
  'dotted.local@example.com',
  'multi.word.email@deeply.nested.domain.io',
  '1234567890@example.com',
  't@x.io',
  'single-letter-local@example.com',
  'dot.dot.dot@example.com',
  'dash-and-dots@example-domain.org',
  'subdomain@api.v2.example.com',
  'tricky+mail-action@support.zendesk.com',
  'newsletter@substack.com',
  'verify@stripe.com',
  'noreply@notifications.github.com',
  'admin@localhost.localdomain',
  'postmaster@example.com',
];

const INVALID_EMAILS = [
  '',
  'not-an-email',
  'missing-at-sign.com',
  '@no-local.com',
  'no-domain@',
  'spaces in@email.com',
  'no@tld',
  'double@@at.com',
  'user@',
  'user@.com',
  'user@example.',
  'user@.example.com',
  'user@-example.com',
  'user@example..com',
  'user@example.com.',
  'user@@example.com',
  'user @example.com',
  'user@ example.com',
  'user@example com',
  'just-text',
  'mailto:test@example.com',
  'tel:+1234567890',
  'http://example.com',
  'user@.com',
  'user@com.',
  '.user@example.com',
  'user.@example.com',
];

const VALID_PASSWORDS = [
  'x',
  'a',
  '12345678',
  'p4$$w0rd',
  'with spaces ok',
  '   leading-spaces',
  'trailing-spaces   ',
  'very-long-' + 'x'.repeat(100),
  'with-unicode-字符',
  'emoji-🔐-allowed',
  'with\nnewlines',
  'with\ttabs',
  '"quoted"',
  "'single-quoted'",
  '<html>injection</html>',
  "'; DROP TABLE users;--",
  'password',
  'correct horse battery staple',
  'p',
  'PASSWORD',
];

const INVALID_PASSWORDS = [''];

describe('loginSchema', () => {
  describe('valid inputs', () => {
    it.each(VALID_EMAILS)('accepts valid email: %s', (email) => {
      const result = loginSchema.safeParse({ email, password: 'x' });
      expect(result.success).toBe(true);
    });

    it.each(VALID_PASSWORDS)('accepts non-empty password: %s', (password) => {
      const result = loginSchema.safeParse({ email: 'a@b.co', password });
      expect(result.success).toBe(true);
    });

    it('accepts the canonical valid payload', () => {
      const result = loginSchema.parse(VALID);
      expect(result).toEqual(VALID);
    });

    it('trims and lowercases email before validation', () => {
      const result = loginSchema.safeParse({ email: '  A@B.COM  ', password: 'x' });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe('a@b.com');
      }
    });

    it('does not require the password to have any specific character class', () => {
      const result = loginSchema.safeParse({ email: 'a@b.co', password: 'a' });
      expect(result.success).toBe(true);
    });
  });

  describe('invalid emails', () => {
    it.each(INVALID_EMAILS)('rejects invalid email: %s', (email) => {
      const result = loginSchema.safeParse({ email, password: 'x' });
      expect(result.success).toBe(false);
    });
  });

  describe('invalid passwords', () => {
    it.each(INVALID_PASSWORDS)('rejects empty password: %j', (password) => {
      const result = loginSchema.safeParse({ email: 'a@b.co', password });
      expect(result.success).toBe(false);
    });

    it('accepts a single space (Zod min(1) is a length check, not a trim check)', () => {
      const result = loginSchema.safeParse({ email: 'a@b.co', password: ' ' });
      expect(result.success).toBe(true);
    });
  });

  describe('type errors', () => {
    it('rejects non-string email', () => {
      const result = loginSchema.safeParse({ email: 123, password: 'x' });
      expect(result.success).toBe(false);
    });

    it('rejects null email', () => {
      const result = loginSchema.safeParse({ email: null, password: 'x' });
      expect(result.success).toBe(false);
    });

    it('rejects null password', () => {
      const result = loginSchema.safeParse({ email: 'a@b.co', password: null });
      expect(result.success).toBe(false);
    });

    it('rejects number password', () => {
      const result = loginSchema.safeParse({ email: 'a@b.co', password: 1234 });
      expect(result.success).toBe(false);
    });

    it('rejects missing email field', () => {
      const result = loginSchema.safeParse({ password: 'x' });
      expect(result.success).toBe(false);
    });

    it('rejects missing password field', () => {
      const result = loginSchema.safeParse({ email: 'a@b.co' });
      expect(result.success).toBe(false);
    });

    it('rejects empty object', () => {
      const result = loginSchema.safeParse({});
      expect(result.success).toBe(false);
    });

    it('rejects undefined', () => {
      const result = loginSchema.safeParse(undefined);
      expect(result.success).toBe(false);
    });

    it('rejects null', () => {
      const result = loginSchema.safeParse(null);
      expect(result.success).toBe(false);
    });

    it('rejects arrays', () => {
      const result = loginSchema.safeParse([]);
      expect(result.success).toBe(false);
    });
  });

  describe('error messages', () => {
    it('mentions "Email inválido" when email is bad', () => {
      const result = loginSchema.safeParse({ email: 'bad', password: 'x' });
      expect(result.success).toBe(false);
      if (!result.success) {
        const msg = result.error.issues.map((i) => i.message).join(' ');
        expect(msg).toContain('Email inválido');
      }
    });

    it('mentions "Contraseña requerida" when password is empty', () => {
      const result = loginSchema.safeParse({ email: 'a@b.co', password: '' });
      expect(result.success).toBe(false);
      if (!result.success) {
        const msg = result.error.issues.map((i) => i.message).join(' ');
        expect(msg).toContain('Contraseña requerida');
      }
    });
  });

  describe('type inference', () => {
    it('infers LoginData with the right fields', () => {
      const result: LoginData = { email: 'a@b.co', password: 'x' };
      expect(result.email).toBe('a@b.co');
      expect(result.password).toBe('x');
    });
  });
});
