import { describe, it, expect } from 'vitest';

import { contactMessageSchema } from '@/validations/message';

describe('contactMessageSchema', () => {
  const valid = {
    name: 'Carlos Guerra',
    email: 'carlos@example.com',
    message: 'Hola, me interesa trabajar juntos en un proyecto industrial.',
  };

  it('accepts valid input', () => {
    const result = contactMessageSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it('accepts valid input with optional fields', () => {
    const result = contactMessageSchema.safeParse({
      ...valid,
      phone: '+54 11 1234-5678',
      website: '',
    });
    expect(result.success).toBe(true);
  });

  it('rejects missing name', () => {
    const result = contactMessageSchema.safeParse({ ...valid, name: '' });
    expect(result.success).toBe(false);
  });

  it('rejects name too short', () => {
    const result = contactMessageSchema.safeParse({ ...valid, name: 'A' });
    expect(result.success).toBe(false);
  });

  it('rejects invalid email', () => {
    const result = contactMessageSchema.safeParse({ ...valid, email: 'not-an-email' });
    expect(result.success).toBe(false);
  });

  it('rejects missing email', () => {
    const result = contactMessageSchema.safeParse({ ...valid, email: '' });
    expect(result.success).toBe(false);
  });

  it('rejects message too short', () => {
    const result = contactMessageSchema.safeParse({ ...valid, message: 'corto' });
    expect(result.success).toBe(false);
  });

  it('rejects message too long', () => {
    const result = contactMessageSchema.safeParse({ ...valid, message: 'a'.repeat(2001) });
    expect(result.success).toBe(false);
  });

  it('honeypot field website defaults to undefined when omitted', () => {
    const result = contactMessageSchema.safeParse(valid);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.website).toBeUndefined();
    }
  });
});
