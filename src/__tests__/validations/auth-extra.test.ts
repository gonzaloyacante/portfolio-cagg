import { describe, expect, it } from 'vitest';

import { forgotPasswordSchema } from '@/validations/forgot-password';
import { loginSchema } from '@/validations/login';
import { resetPasswordSchema } from '@/validations/reset-password';

// Massive density

describe('login/forgot/reset validations — extra density', () => {
  describe('loginSchema: comprehensive', () => {
    it.each([
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
      'contact@very-long-domain-name-that-is-still-valid.com',
      'me@a.cars',
      'me@a.technology',
      'me@a.consulting',
      'me@a.manufacturing',
    ])('accepts email: %s', (email) => {
      expect(loginSchema.safeParse({ email, password: 'x' }).success).toBe(true);
    });

    it.each([
      [''],
      ['not-an-email'],
      ['missing-at-sign.com'],
      ['@no-local.com'],
      ['no-domain@'],
      ['spaces in@email.com'],
      ['no@tld'],
      ['double@@at.com'],
      ['user@'],
      ['user@.com'],
      ['user@example.'],
      ['user@.example.com'],
      ['user@example..com'],
      ['user@@example.com'],
      ['user @example.com'],
      [' user@example.com'],
      ['user@ example.com'],
      ['user@example com'],
      ['user@example.com '],
      ['just-text'],
      ['mailto:test@example.com'],
      ['tel:+1234567890'],
      ['http://example.com'],
    ])('rejects email: %s', (email) => {
      expect(loginSchema.safeParse({ email, password: 'x' }).success).toBe(false);
    });

    it.each([
      'x',
      'a',
      '12345678',
      'p4$$w0rd!',
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
      'a'.repeat(1000),
      'a'.repeat(10_000),
    ])('accepts password: %j', (password) => {
      expect(loginSchema.safeParse({ email: 'a@b.co', password }).success).toBe(true);
    });
  });

  describe('forgotPasswordSchema: comprehensive', () => {
    it.each([
      'a@b.co',
      'me@x.io',
      'user+tag@gmail.com',
      'carlos.guerra@example.com',
      'a@b.cars',
      'a@b.technology',
      'a@b.consulting',
      'verify@stripe.com',
      'admin@localhost.localdomain',
      'postmaster@example.com',
    ])('accepts: %s', (email) => {
      expect(forgotPasswordSchema.safeParse({ email }).success).toBe(true);
    });

    it.each(['', 'not-an-email', '@b.com', 'a@', 'a@.com', 'a@b..com'])('rejects: %s', (email) => {
      expect(forgotPasswordSchema.safeParse({ email }).success).toBe(false);
    });

    it('rejects non-string email', () => {
      expect(forgotPasswordSchema.safeParse({ email: 123 }).success).toBe(false);
    });

    it('rejects null', () => {
      expect(forgotPasswordSchema.safeParse({ email: null }).success).toBe(false);
    });

    it('rejects undefined', () => {
      expect(forgotPasswordSchema.safeParse({ email: undefined }).success).toBe(false);
    });

    it('rejects empty object', () => {
      expect(forgotPasswordSchema.safeParse({}).success).toBe(false);
    });
  });

  describe('resetPasswordSchema: comprehensive', () => {
    it.each([
      ['12345678', '12345678'],
      ['p4$$w0rd!', 'p4$$w0rd!'],
      ['very long password with spaces and éàü', 'very long password with spaces and éàü'],
      ['🔐secure🔐', '🔐secure🔐'],
      ['a'.repeat(100), 'a'.repeat(100)],
      ['short-ish', 'short-ish'],
      ['with-dashes-and_underscores.123', 'with-dashes-and_underscores.123'],
      ['   leading-spaces-shared   ', '   leading-spaces-shared   '],
      ['"quoted"', '"quoted"'],
      ["'single'", "'single'"],
      ['semi;colon', 'semi;colon'],
      ['emoji-😀', 'emoji-😀'],
      ['multibyte-字符-日', 'multibyte-字符-日'],
      ['a'.repeat(8), 'a'.repeat(8)],
      ['Password1!', 'Password1!'],
    ])('accepts: %j', (password, confirm) => {
      expect(resetPasswordSchema.safeParse({ password, confirm }).success).toBe(true);
    });

    it.each([
      ['1234567', '1234567'],
      ['7chars', '7chars'],
    ])('rejects too short: %j', (password) => {
      expect(resetPasswordSchema.safeParse({ password, confirm: password }).success).toBe(false);
    });

    it.each([
      [{ password: 'password123', confirm: 'password124' }],
      [{ password: 'Password1!', confirm: 'password1!' }],
      [{ password: 'password123', confirm: ' password123' }],
      [{ password: 'password123', confirm: 'password123 ' }],
      [{ password: 'p4$$w0rd', confirm: 'p4$$w0rd!' }],
    ])('rejects mismatched: %j', (input) => {
      expect(resetPasswordSchema.safeParse(input).success).toBe(false);
    });
  });
});
