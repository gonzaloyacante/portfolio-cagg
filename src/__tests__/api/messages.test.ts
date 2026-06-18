import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { POST } from '@/app/api/messages/route';

const { prisma, getResend, rateLimit, headers, revalidateLanding } = vi.hoisted(() => ({
  prisma: {
    contactMessage: { create: vi.fn() },
    setting: { findMany: vi.fn() },
  },
  getResend: vi.fn(),
  rateLimit: vi.fn(),
  headers: vi.fn(),
  revalidateLanding: vi.fn(),
}));

vi.mock('@/lib/prisma', () => ({ prisma }));
vi.mock('@/lib/resend', () => ({ getResend }));
vi.mock('@/lib/rate-limit', () => ({
  rateLimit,
  clientKey: vi.fn((req: Request) => req.headers.get('x-forwarded-for') ?? 'local'),
}));
vi.mock('@/lib/revalidate', () => ({ revalidateLanding }));
vi.mock('next/headers', () => ({ headers }));

const VALID_BODY = {
  name: 'Carlos Armando Guerra',
  email: 'carlos@example.com',
  phone: '+54 9 11 5555 5555',
  message: 'Hola, me gustaría contratar tus servicios para una auditoría industrial.',
};

describe('/api/messages POST', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prisma.contactMessage.create.mockResolvedValue({ id: '1' });
    prisma.setting.findMany.mockResolvedValue([]);
    rateLimit.mockReturnValue({ ok: true, retryAfterMs: 0 });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('rate limit', () => {
    it('returns 429 when rate limit hits', async () => {
      rateLimit.mockReturnValue({ ok: false, retryAfterMs: 60_000 });
      const req = new Request('https://x.com/api/messages', {
        method: 'POST',
        body: JSON.stringify(VALID_BODY),
      });
      const res = await POST(req);
      expect(res.status).toBe(429);
      expect(res.headers.get('Retry-After')).toBe('60');
    });

    it('includes a Retry-After header in seconds (rounded up)', async () => {
      rateLimit.mockReturnValue({ ok: false, retryAfterMs: 1500 });
      const req = new Request('https://x.com/api/messages', {
        method: 'POST',
        body: JSON.stringify(VALID_BODY),
      });
      const res = await POST(req);
      expect(res.headers.get('Retry-After')).toBe('2');
    });

    it('does not call prisma when rate limit hits', async () => {
      rateLimit.mockReturnValue({ ok: false, retryAfterMs: 0 });
      const req = new Request('https://x.com/api/messages', {
        method: 'POST',
        body: JSON.stringify(VALID_BODY),
      });
      await POST(req);
      expect(prisma.contactMessage.create).not.toHaveBeenCalled();
    });
  });

  describe('validation', () => {
    it('returns 422 on invalid body', async () => {
      const req = new Request('https://x.com/api/messages', {
        method: 'POST',
        body: JSON.stringify({ name: 'a', email: 'bad', message: 'short' }),
      });
      const res = await POST(req);
      expect(res.status).toBe(422);
      const body = await res.json();
      expect(body.error).toBe('Invalid data');
    });

    it('returns 422 on non-JSON body', async () => {
      const req = new Request('https://x.com/api/messages', {
        method: 'POST',
        body: 'not json',
      });
      const res = await POST(req);
      expect(res.status).toBe(422);
    });

    it('returns 422 on null body', async () => {
      const req = new Request('https://x.com/api/messages', {
        method: 'POST',
      });
      const res = await POST(req);
      expect(res.status).toBe(422);
    });
  });

  describe('honeypot', () => {
    it('returns 422 when website is a non-empty string (schema enforces max(0))', async () => {
      // The current schema is `z.string().max(0).optional()` so a non-empty
      // website fails validation. The route's honeypot branch is effectively
      // dead code under the current schema. This test documents that.
      const req = new Request('https://x.com/api/messages', {
        method: 'POST',
        body: JSON.stringify({ ...VALID_BODY, website: 'http://spam.example.com' }),
      });
      const res = await POST(req);
      expect(res.status).toBe(422);
    });

    it('does not create a contact message when validation fails on honeypot', async () => {
      const req = new Request('https://x.com/api/messages', {
        method: 'POST',
        body: JSON.stringify({ ...VALID_BODY, website: 'spam' }),
      });
      await POST(req);
      expect(prisma.contactMessage.create).not.toHaveBeenCalled();
    });

    it('accepts empty-string website and proceeds to create the message', async () => {
      const req = new Request('https://x.com/api/messages', {
        method: 'POST',
        body: JSON.stringify({ ...VALID_BODY, website: '' }),
      });
      const res = await POST(req);
      expect(res.status).toBe(200);
      expect(prisma.contactMessage.create).toHaveBeenCalled();
    });
  });

  describe('happy path', () => {
    it('creates a contact message and returns success', async () => {
      const req = new Request('https://x.com/api/messages', {
        method: 'POST',
        body: JSON.stringify(VALID_BODY),
      });
      const res = await POST(req);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(prisma.contactMessage.create).toHaveBeenCalledWith({
        data: {
          name: VALID_BODY.name,
          email: VALID_BODY.email,
          phone: VALID_BODY.phone,
          message: VALID_BODY.message,
        },
      });
    });

    it('defaults phone to empty string when not provided', async () => {
      const { phone: _phone, ...body } = VALID_BODY;
      void _phone;
      const req = new Request('https://x.com/api/messages', {
        method: 'POST',
        body: JSON.stringify(body),
      });
      await POST(req);
      expect(prisma.contactMessage.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ phone: '' }),
      });
    });

    it('queries notification settings', async () => {
      const req = new Request('https://x.com/api/messages', {
        method: 'POST',
        body: JSON.stringify(VALID_BODY),
      });
      await POST(req);
      expect(prisma.setting.findMany).toHaveBeenCalledWith({
        where: { key: { in: ['notification_email', 'notifications_enabled'] } },
      });
    });
  });

  describe('email notification', () => {
    it('does not send email when notifications are disabled', async () => {
      prisma.setting.findMany.mockResolvedValue([
        { key: 'notifications_enabled', value: 'false' },
        { key: 'notification_email', value: 'me@example.com' },
      ]);
      const sendMock = vi.fn();
      getResend.mockReturnValue({ emails: { send: sendMock } });

      const req = new Request('https://x.com/api/messages', {
        method: 'POST',
        body: JSON.stringify(VALID_BODY),
      });
      await POST(req);
      expect(sendMock).not.toHaveBeenCalled();
    });

    it('does not send email when toEmail is missing and ADMIN_EMAIL env is not set', async () => {
      // prisma.setting.findMany returns [] → notification_email is undefined
      // and we don't depend on env here
      const sendMock = vi.fn();
      getResend.mockReturnValue({ emails: { send: sendMock } });

      const req = new Request('https://x.com/api/messages', {
        method: 'POST',
        body: JSON.stringify(VALID_BODY),
      });
      await POST(req);
      expect(sendMock).not.toHaveBeenCalled();
    });

    it('does not throw when resend is not configured', async () => {
      getResend.mockReturnValue(null);
      const req = new Request('https://x.com/api/messages', {
        method: 'POST',
        body: JSON.stringify(VALID_BODY),
      });
      const res = await POST(req);
      expect(res.status).toBe(200);
    });

    it('does not throw when resend send fails', async () => {
      const sendMock = vi.fn().mockRejectedValue(new Error('SMTP down'));
      getResend.mockReturnValue({ emails: { send: sendMock } });
      prisma.setting.findMany.mockResolvedValue([
        { key: 'notification_email', value: 'me@example.com' },
        { key: 'notifications_enabled', value: 'true' },
      ]);
      const req = new Request('https://x.com/api/messages', {
        method: 'POST',
        body: JSON.stringify(VALID_BODY),
      });
      const res = await POST(req);
      expect(res.status).toBe(200);
    });
  });
});
