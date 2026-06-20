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
    // The route reads these env vars to decide whether to call
    // Resend. Tests that exercise the email body need both set.
    process.env.RESEND_FROM_EMAIL = 'noreply@example.com';
  });

  afterEach(() => {
    vi.restoreAllMocks();
    delete process.env.RESEND_FROM_EMAIL;
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

  describe('email body HTML escaping (XSS defense)', () => {
    /**
     * The notification email body is rendered by webmail clients.
     * User-controlled fields (name, email, phone, message) are
     * interpolated into HTML. Without escaping, a payload like
     * `<img src=x onerror=...>` executes in the admin's webmail
     * context. The route MUST escape all four fields before
     * interpolating them. Newlines in the message body are converted
     * to <br/> tags AFTER escaping (so the literal `<br/>` markup
     * survives).
     */
    async function sendAndGetHtml(body: unknown): Promise<{ subject: string; html: string }> {
      // sendMock must return a thenable — the route chains `.catch()`
      // on the result.
      const sendMock = vi.fn().mockResolvedValue({ id: 'sent' });
      getResend.mockReturnValue({ emails: { send: sendMock } });
      prisma.setting.findMany.mockResolvedValue([
        { key: 'notification_email', value: 'me@example.com' },
        { key: 'notifications_enabled', value: 'true' },
      ]);
      const req = new Request('https://x.com/api/messages', {
        method: 'POST',
        body: JSON.stringify(body),
      });
      await POST(req);
      const call = sendMock.mock.calls[0]![0] as { subject: string; html: string };
      return call;
    }

    it('escapes <script> payload in name field', async () => {
      const sent = await sendAndGetHtml({
        ...VALID_BODY,
        name: '<script>alert(1)</script>',
      });
      expect(sent.subject).toContain('&lt;script&gt;');
      expect(sent.html).toContain('&lt;script&gt;alert(1)&lt;/script&gt;');
      // The raw payload must NOT appear in the rendered body.
      expect(sent.html).not.toContain('<script>alert(1)</script>');
    });

    it('escapes event handler attribute injection in name field', async () => {
      const sent = await sendAndGetHtml({
        ...VALID_BODY,
        name: '"><img src=x onerror=alert(1)>',
      });
      expect(sent.html).not.toMatch(/<img/);
      expect(sent.html).toContain('&quot;');
    });

    it('includes the email in the body (and escapes it on the way through)', async () => {
      // The email field's Zod schema rejects angle brackets, so it
      // cannot carry a live XSS payload. The route still routes it
      // through escapeHtml, which is the defense-in-depth that
      // matters if a future schema change loosens the constraint.
      const sent = await sendAndGetHtml(VALID_BODY);
      expect(sent.html).toContain(VALID_BODY.email);
      // And `name` and `phone` payloads that DO smuggle brackets
      // through are escaped in the same pass — covered by the other
      // tests in this block.
    });

    it('escapes phone field', async () => {
      // Must be ≤ 20 chars (schema constraint).
      const sent = await sendAndGetHtml({
        ...VALID_BODY,
        phone: '+1<script>evil',
      });
      expect(sent.html).not.toContain('<script>evil');
      expect(sent.html).toContain('&lt;script&gt;');
    });

    it('escapes message field but preserves <br/> for newlines', async () => {
      const sent = await sendAndGetHtml({
        ...VALID_BODY,
        message: 'Line 1\nLine 2 <script>evil()</script>\nLine 3',
      });
      // The script tag must be escaped.
      expect(sent.html).toContain('&lt;script&gt;evil()&lt;/script&gt;');
      expect(sent.html).not.toContain('<script>evil()</script>');
      // Newlines still converted to <br/>.
      expect(sent.html).toContain('Line 1<br/>Line 2');
      expect(sent.html).toContain('Line 3');
    });

    it('escapes javascript: URL inside message', async () => {
      const sent = await sendAndGetHtml({
        ...VALID_BODY,
        message: 'Click <a href="javascript:alert(1)">here</a>',
      });
      // The href must not be a live javascript: URL after escaping.
      expect(sent.html).not.toMatch(/href="javascript:/);
      expect(sent.html).toContain('href=&quot;javascript:');
    });

    it('does not escape the static <strong>/<p>/<hr> markup we author', async () => {
      const sent = await sendAndGetHtml(VALID_BODY);
      // The static markup we control should be preserved verbatim.
      expect(sent.html).toContain('<strong>Nombre:</strong>');
      expect(sent.html).toContain('<strong>Email:</strong>');
      expect(sent.html).toContain('<hr/>');
    });
  });
});
