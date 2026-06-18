import { describe, expect, it } from 'vitest';

import { contactMessageSchema } from '@/validations/message';

// Massive density: every kind of input the form can receive.

const VALID_NAME = 'Carlos Armando Guerra';
const VALID_EMAIL = 'carlos@example.com';
const VALID_MESSAGE = 'Hola, me gustaría contratar tus servicios para una auditoría industrial.';

describe('contactMessageSchema — extra density', () => {
  describe('name: long unicode strings', () => {
    it.each([
      'José María',
      'François Hollande',
      'Müller',
      'Łukasz',
      'Владимир',
      'Иван Петров',
      '王小明',
      '田中太郎',
      '김민수',
      'محمد علي',
      'שלום',
      '🔥🚀💻🎉👨‍👩‍👧‍👦',
      '𓀀𓂀𓆎𓈖', // Egyptian hieroglyphs
      'a'.repeat(100),
      'a'.repeat(2),
      '   a   ', // leading/trailing whitespace
      'a-b-c-d',
      'a_b_c_d',
      'a.b.c.d',
      "O'Brien",
      'Anne-Marie',
      'Jr. Smith',
      'Carlos  Armando  Guerra', // double spaces
    ])('accepts name: %j', (name) => {
      const result = contactMessageSchema.safeParse({
        name,
        email: VALID_EMAIL,
        message: VALID_MESSAGE,
      });
      expect(result.success, name).toBe(true);
    });
  });

  describe('email: exhaustive format checks', () => {
    it.each([
      'a@b.co',
      'a@b.io',
      'a@b.dev',
      'a@b.com',
      'a@b.com.ar',
      'a@b.cars',
      'a@b.technology',
      'a@b.accountants',
      'a@b.agency',
      'a@b.consulting',
      'a@b.solutions',
      'a@b.industries',
      'a@b.consultancy',
      'a@b.engineering',
      'a@b.manufacturing',
      'a@b.automation',
      'a@b.controls',
      'me@x.io',
      'me+x@gmail.com',
      'me_x@gmail.com',
      'me-x@gmail.com',
      'me.x@gmail.com',
      '1234567890@example.com',
      'tricky+mail-action@support.zendesk.com',
      'newsletter@substack.com',
      'verify@stripe.com',
      'noreply@notifications.github.com',
      'contact@very-long-domain-name-that-is-still-valid.com',
      'a@b.cars',
    ])('accepts email: %s', (email) => {
      const result = contactMessageSchema.safeParse({
        name: VALID_NAME,
        email,
        message: VALID_MESSAGE,
      });
      expect(result.success, email).toBe(true);
    });
  });

  describe('message: edge cases', () => {
    it.each([
      'a'.repeat(10), // min
      'a'.repeat(20),
      'a'.repeat(100),
      'a'.repeat(500),
      'a'.repeat(1000),
      'a'.repeat(1999),
      'a'.repeat(2000), // max
      'Hola, me gustaría contratar tus servicios para una auditoría industrial.',
      'This is a longer message with enough characters to pass the minimum',
      'Línea 1\nLínea 2\nLínea 3 with more text',
      'Mixed "quotes" and \'apostrophes\' in long text',
      '<html>html in body with more content</html>',
      'Visit https://example.com for more info',
      '$pecial ch@racters! and some long text here',
      '你好世界 with more characters to pass min',
      '🚀💻🎉 with more text',
    ])('accepts message of length: %j', (message) => {
      const result = contactMessageSchema.safeParse({
        name: VALID_NAME,
        email: VALID_EMAIL,
        message,
      });
      expect(result.success).toBe(true);
    });
  });

  describe('phone: every plausible format', () => {
    it.each([
      [''],
      ['+'],
      ['1'],
      ['+1'],
      ['+54'],
      ['+54 9 11 5555 5555'],
      ['+1-555-123-4567'],
      ['+1 (555) 123-4567'],
      ['(011) 4444-5555'],
      ['011-4444-5555'],
      ['15-5555-5555'],
      ['5491155555555'],
      ['+54 9 11 5555-5555'],
      ['5491155555555 '],
      [' 5491155555555'],
      ['a'],
      ['ab'],
      ['123'],
      ['1'.repeat(20)],
      ['+'.repeat(20)],
      [' '.repeat(20)],
      ['-'.repeat(20)],
      ['. '.repeat(10)],
    ])('phone %j is accepted (max 20 chars)', (phone) => {
      const result = contactMessageSchema.safeParse({
        name: VALID_NAME,
        email: VALID_EMAIL,
        phone,
        message: VALID_MESSAGE,
      });
      expect(result.success, JSON.stringify(phone)).toBe(true);
    });
  });

  describe('phone: rejected (too long)', () => {
    it.each([['1'.repeat(21)], ['+1'.repeat(20)], ['a'.repeat(21)], [' '.repeat(21)]])(
      'phone %j (length 21+) is rejected',
      (phone) => {
        const result = contactMessageSchema.safeParse({
          name: VALID_NAME,
          email: VALID_EMAIL,
          phone,
          message: VALID_MESSAGE,
        });
        expect(result.success).toBe(false);
      }
    );
  });

  describe('website honeypot: edge cases', () => {
    it('accepts website as undefined', () => {
      const result = contactMessageSchema.safeParse({
        name: VALID_NAME,
        email: VALID_EMAIL,
        message: VALID_MESSAGE,
      });
      expect(result.success).toBe(true);
    });

    it('accepts website as empty string (current schema enforces max(0))', () => {
      const result = contactMessageSchema.safeParse({
        name: VALID_NAME,
        email: VALID_EMAIL,
        message: VALID_MESSAGE,
        website: '',
      });
      expect(result.success).toBe(true);
    });

    it('rejects website with any character (current schema: max(0))', () => {
      const result = contactMessageSchema.safeParse({
        name: VALID_NAME,
        email: VALID_EMAIL,
        message: VALID_MESSAGE,
        website: 'a',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('combined edge cases', () => {
    it('accepts the most minimal valid payload', () => {
      const result = contactMessageSchema.safeParse({
        name: 'ab',
        email: 'a@b.co',
        message: 'x'.repeat(10),
      });
      expect(result.success).toBe(true);
    });

    it('accepts a max-length payload', () => {
      const result = contactMessageSchema.safeParse({
        name: 'a'.repeat(100),
        email: `${'a'.repeat(50)}@${'b'.repeat(50)}.com`,
        phone: '1'.repeat(20),
        message: 'a'.repeat(2000),
      });
      expect(result.success).toBe(true);
    });

    it('accepts payload with website=undefined (omitted)', () => {
      const result = contactMessageSchema.safeParse({
        name: 'ab',
        email: 'a@b.co',
        message: 'x'.repeat(10),
        website: undefined,
      });
      expect(result.success).toBe(true);
    });
  });
});
