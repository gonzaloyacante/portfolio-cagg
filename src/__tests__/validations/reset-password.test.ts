import { describe, expect, it } from 'vitest';

import { resetPasswordSchema } from '@/validations/reset-password';

const VALID_PAIRS: Array<[string, string]> = [
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
];

const TOO_SHORT_PASSWORDS = ['', 'a', '1', 'short', '1234567', '7chars'];

describe('resetPasswordSchema', () => {
  describe('valid pairs (passwords match and meet min length)', () => {
    it.each(VALID_PAIRS)('accepts matching pair: password=%j', (password, confirm) => {
      const result = resetPasswordSchema.safeParse({ password, confirm });
      expect(result.success).toBe(true);
    });
  });

  describe('short passwords', () => {
    it.each(TOO_SHORT_PASSWORDS)('rejects password under 8 chars: %j', (password) => {
      const result = resetPasswordSchema.safeParse({ password, confirm: password });
      expect(result.success).toBe(false);
    });

    it('rejects empty confirm even if password is valid', () => {
      const result = resetPasswordSchema.safeParse({ password: '12345678', confirm: '' });
      expect(result.success).toBe(false);
    });
  });

  describe('passwords that do not match', () => {
    it.each([
      [{ password: 'password123', confirm: 'password124' }],
      [{ password: 'password123', confirm: 'Password123' }], // case sensitive
      [{ password: 'password123', confirm: ' password123' }], // leading space
      [{ password: 'password123', confirm: 'password123 ' }], // trailing space
      [{ password: 'p4$$w0rd', confirm: 'p4$$w0rd!' }],
      [{ password: '12345678', confirm: '123456789' }],
      [{ password: 'aaaaaaaa', confirm: 'bbbbbbbb' }],
    ])('rejects mismatched: %j', (input) => {
      const result = resetPasswordSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it('routes the mismatch error to the confirm field', () => {
      const result = resetPasswordSchema.safeParse({
        password: 'password123',
        confirm: 'different',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        const confirmIssue = result.error.issues.find((i) => i.path[0] === 'confirm');
        expect(confirmIssue?.message).toContain('no coinciden');
      }
    });
  });

  describe('error messages', () => {
    it('mentions "Mínimo 8 caracteres" for short password', () => {
      const result = resetPasswordSchema.safeParse({ password: 'short', confirm: 'short' });
      expect(result.success).toBe(false);
      if (!result.success) {
        const msg = result.error.issues.map((i) => i.message).join(' ');
        expect(msg).toContain('Mínimo 8 caracteres');
      }
    });

    it('mentions "Requerido" for empty confirm', () => {
      const result = resetPasswordSchema.safeParse({ password: '12345678', confirm: '' });
      expect(result.success).toBe(false);
      if (!result.success) {
        const msg = result.error.issues.map((i) => i.message).join(' ');
        expect(msg).toContain('Requerido');
      }
    });
  });

  describe('type errors', () => {
    it.each([[null], [undefined], [123], [{}], [[]]])('rejects non-object: %j', (input) => {
      const result = resetPasswordSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it('rejects non-string password', () => {
      const result = resetPasswordSchema.safeParse({ password: 12345678, confirm: 12345678 });
      expect(result.success).toBe(false);
    });
  });
});
