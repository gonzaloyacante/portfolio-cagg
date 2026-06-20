import { describe, expect, it } from 'vitest';

import { contactMessageSchema, type ContactMessageData } from '@/validations/message';

const VALID: ContactMessageData = {
  name: 'Carlos Armando Guerra',
  email: 'carlos@example.com',
  phone: '+54 9 11 5555 5555',
  message: 'Hola, me gustaría contratar tus servicios para una auditoría industrial.',
};

describe('contactMessageSchema', () => {
  describe('valid inputs', () => {
    it('accepts the canonical valid payload', () => {
      const result = contactMessageSchema.parse(VALID);
      expect(result.name).toBe(VALID.name);
      expect(result.email).toBe(VALID.email);
      expect(result.message).toBe(VALID.message);
    });

    it('defaults phone to empty string when omitted', () => {
      const result = contactMessageSchema.parse({
        name: 'Test User',
        email: 't@t.co',
        message: 'A long enough message here.',
      });
      expect(result.phone).toBe('');
    });

    it('accepts name at min length (2)', () => {
      const result = contactMessageSchema.safeParse({
        name: 'ab',
        email: 'a@b.co',
        message: 'x'.repeat(10),
      });
      expect(result.success).toBe(true);
    });

    it('accepts name at max length (100)', () => {
      const result = contactMessageSchema.safeParse({
        name: 'a'.repeat(100),
        email: 'a@b.co',
        message: 'x'.repeat(10),
      });
      expect(result.success).toBe(true);
    });

    it('accepts message at min length (10)', () => {
      const result = contactMessageSchema.safeParse({
        name: 'ab',
        email: 'a@b.co',
        message: 'x'.repeat(10),
      });
      expect(result.success).toBe(true);
    });

    it('accepts message at max length (2000)', () => {
      const result = contactMessageSchema.safeParse({
        name: 'ab',
        email: 'a@b.co',
        message: 'x'.repeat(2000),
      });
      expect(result.success).toBe(true);
    });

    it('accepts various phone formats', () => {
      const phones = [
        '',
        '+54 9 11 5555 5555',
        '+1-555-123-4567',
        '5491155555555',
        '(011) 4444-5555',
        '15-5555-5555',
        '555 555 5555',
        'tel:5551234567',
        ' '.repeat(20),
        'a'.repeat(20),
      ];
      for (const phone of phones) {
        const result = contactMessageSchema.safeParse({
          name: 'ab',
          email: 'a@b.co',
          phone,
          message: 'x'.repeat(10),
        });
        expect(result.success, `phone ${JSON.stringify(phone)} should be accepted`).toBe(true);
      }
    });

    it('rejects phone longer than 20 chars', () => {
      const result = contactMessageSchema.safeParse({
        name: 'ab',
        email: 'a@b.co',
        phone: 'whatsapp:+5491155555555',
        message: 'x'.repeat(10),
      });
      expect(result.success).toBe(false);
    });

    it.each([
      ['plain ascii', 'Carlos Armando Guerra'],
      ['with accents', 'José María Pérez'],
      ['with numbers', 'User 1234'],
      ['with apostrophe', "O'Brien"],
      ['with hyphen', 'Anne-Marie'],
      ['with dots', 'Jr. Smith'],
      ['single char above min', 'abc'],
      ['emoji', 'Carlos 💼 Guerra'],
      ['cyrillic', 'Иван Петров'],
      ['chinese', '王小明'],
      ['arabic', 'محمد علي'],
      ['numbers-only name (valid by min)', '12 34'],
      ['with slash', 'A/B Testing'],
    ])('accepts name variation: %s — %s', (_label, name) => {
      const result = contactMessageSchema.safeParse({
        name,
        email: 'a@b.co',
        message: 'x'.repeat(10),
      });
      expect(result.success).toBe(true);
    });
  });

  describe('invalid inputs', () => {
    it('rejects name shorter than 2', () => {
      const result = contactMessageSchema.safeParse({
        name: 'a',
        email: 'a@b.co',
        message: 'x'.repeat(10),
      });
      expect(result.success).toBe(false);
    });

    it('rejects name longer than 100', () => {
      const result = contactMessageSchema.safeParse({
        name: 'a'.repeat(101),
        email: 'a@b.co',
        message: 'x'.repeat(10),
      });
      expect(result.success).toBe(false);
    });

    it('rejects message shorter than 10', () => {
      const result = contactMessageSchema.safeParse({
        name: 'ab',
        email: 'a@b.co',
        message: 'x'.repeat(9),
      });
      expect(result.success).toBe(false);
    });

    it('rejects message longer than 2000', () => {
      const result = contactMessageSchema.safeParse({
        name: 'ab',
        email: 'a@b.co',
        message: 'x'.repeat(2001),
      });
      expect(result.success).toBe(false);
    });

    it('rejects email over 254 chars (the RFC max)', () => {
      const local = 'a'.repeat(250);
      const result = contactMessageSchema.safeParse({
        name: 'ab',
        email: `${local}@b.co`,
        message: 'x'.repeat(10),
      });
      expect(result.success).toBe(false);
    });

    it('rejects email without @', () => {
      const result = contactMessageSchema.safeParse({
        name: 'ab',
        email: 'not-an-email',
        message: 'x'.repeat(10),
      });
      expect(result.success).toBe(false);
    });

    it('rejects email without local part', () => {
      const result = contactMessageSchema.safeParse({
        name: 'ab',
        email: '@b.com',
        message: 'x'.repeat(10),
      });
      expect(result.success).toBe(false);
    });

    it('rejects email without domain', () => {
      const result = contactMessageSchema.safeParse({
        name: 'ab',
        email: 'a@',
        message: 'x'.repeat(10),
      });
      expect(result.success).toBe(false);
    });

    it('rejects phone over 20 chars', () => {
      const result = contactMessageSchema.safeParse({
        name: 'ab',
        email: 'a@b.co',
        phone: 'x'.repeat(21),
        message: 'x'.repeat(10),
      });
      expect(result.success).toBe(false);
    });

    it('rejects empty name', () => {
      const result = contactMessageSchema.safeParse({
        name: '',
        email: 'a@b.co',
        message: 'x'.repeat(10),
      });
      expect(result.success).toBe(false);
    });

    it('rejects empty message', () => {
      const result = contactMessageSchema.safeParse({ name: 'ab', email: 'a@b.co', message: '' });
      expect(result.success).toBe(false);
    });

    it('rejects empty email', () => {
      const result = contactMessageSchema.safeParse({
        name: 'ab',
        email: '',
        message: 'x'.repeat(10),
      });
      expect(result.success).toBe(false);
    });
  });

  describe('honeypot (website) field', () => {
    it('accepts when website is omitted', () => {
      const result = contactMessageSchema.safeParse({
        name: 'ab',
        email: 'a@b.co',
        message: 'x'.repeat(10),
      });
      expect(result.success).toBe(true);
    });

    it('accepts when website is undefined', () => {
      const result = contactMessageSchema.safeParse({
        name: 'ab',
        email: 'a@b.co',
        message: 'x'.repeat(10),
        website: undefined,
      });
      expect(result.success).toBe(true);
    });

    it('rejects when website is non-empty (honeypot trap)', () => {
      const result = contactMessageSchema.safeParse({
        name: 'ab',
        email: 'a@b.co',
        message: 'x'.repeat(10),
        website: 'http://spam.example.com',
      });
      expect(result.success).toBe(false);
    });

    it('rejects any non-empty string in website', () => {
      const result = contactMessageSchema.safeParse({
        name: 'ab',
        email: 'a@b.co',
        message: 'x'.repeat(10),
        website: 'a',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('type errors', () => {
    it.each([
      [{ name: 1, email: 'a@b.co', message: 'x'.repeat(10) }],
      [{ name: null, email: 'a@b.co', message: 'x'.repeat(10) }],
      [{ name: 'ab', email: 123, message: 'x'.repeat(10) }],
      [{ name: 'ab', email: null, message: 'x'.repeat(10) }],
      [{ name: 'ab', email: 'a@b.co', message: null }],
      [{ name: 'ab', email: 'a@b.co', message: 12345 }],
      [{ name: [], email: 'a@b.co', message: 'x'.repeat(10) }],
      [{ name: 'ab', email: [], message: 'x'.repeat(10) }],
    ])('rejects payload with wrong types: %j', (payload) => {
      const result = contactMessageSchema.safeParse(payload);
      expect(result.success).toBe(false);
    });
  });
});
