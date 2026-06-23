import { beforeEach, describe, expect, it, vi } from 'vitest';

import { GET, PUT } from '@/app/api/admin/contact-info/route';

const { prisma, revalidateLanding, auth, headers } = vi.hoisted(() => ({
  prisma: {
    contactInfo: { findFirst: vi.fn(), update: vi.fn() },
  },
  revalidateLanding: vi.fn(),
  auth: { api: { getSession: vi.fn() } },
  headers: vi.fn(),
}));

vi.mock('@/lib/prisma', () => ({ prisma }));
vi.mock('@/lib/revalidate', () => ({ revalidateLanding }));
vi.mock('@/lib/auth', () => ({ auth }));
vi.mock('next/headers', () => ({ headers }));

const CONTACT = {
  id: 'ci-1',
  name: 'Carlos',
  email: 'carlos@example.com',
};

describe('/api/admin/contact-info', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    headers.mockResolvedValue(new Map());
    auth.api.getSession.mockResolvedValue({ user: { id: 'u1' } });
    prisma.contactInfo.findFirst.mockResolvedValue(CONTACT);
    prisma.contactInfo.update.mockResolvedValue({ ...CONTACT, name: 'New Name' });
  });

  describe('GET', () => {
    it('returns 401 without session', async () => {
      auth.api.getSession.mockResolvedValueOnce(null);
      const res = await GET(new Request('https://x.com'), { params: Promise.resolve({}) });
      expect(res.status).toBe(401);
    });

    it('returns 200 with contact info', async () => {
      const res = await GET(new Request('https://x.com'), { params: Promise.resolve({}) });
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.id).toBe('ci-1');
    });

    it('returns 404 when no contact info exists', async () => {
      prisma.contactInfo.findFirst.mockResolvedValueOnce(null);
      const res = await GET(new Request('https://x.com'), { params: Promise.resolve({}) });
      expect(res.status).toBe(404);
    });
  });

  describe('PUT', () => {
    it('returns 401 without session', async () => {
      auth.api.getSession.mockResolvedValueOnce(null);
      const req = new Request('https://x.com', { method: 'PUT', body: JSON.stringify({}) });
      const res = await PUT(req, { params: Promise.resolve({}) });
      expect(res.status).toBe(401);
    });

    it('returns 422 on invalid body', async () => {
      const req = new Request('https://x.com', {
        method: 'PUT',
        body: JSON.stringify({ email: 'bad' }),
      });
      const res = await PUT(req, { params: Promise.resolve({}) });
      expect(res.status).toBe(422);
    });

    it('returns 422 on non-JSON', async () => {
      const req = new Request('https://x.com', { method: 'PUT', body: 'not json' });
      const res = await PUT(req, { params: Promise.resolve({}) });
      expect(res.status).toBe(422);
    });

    it('returns 404 when no contact info exists', async () => {
      prisma.contactInfo.findFirst.mockResolvedValueOnce(null);
      const req = new Request('https://x.com', {
        method: 'PUT',
        body: JSON.stringify({ name: 'X' }),
      });
      const res = await PUT(req, { params: Promise.resolve({}) });
      expect(res.status).toBe(404);
    });

    it('updates fields with provided data', async () => {
      const req = new Request('https://x.com', {
        method: 'PUT',
        body: JSON.stringify({ name: 'New Name', email: 'new@example.com' }),
      });
      await PUT(req, { params: Promise.resolve({}) });
      expect(prisma.contactInfo.update).toHaveBeenCalledWith({
        where: { id: 'ci-1' },
        data: { name: 'New Name', email: 'new@example.com' },
      });
    });

    it('calls revalidateLanding after success', async () => {
      const req = new Request('https://x.com', {
        method: 'PUT',
        body: JSON.stringify({ name: 'X' }),
      });
      await PUT(req, { params: Promise.resolve({}) });
      expect(revalidateLanding).toHaveBeenCalledOnce();
    });

    it('accepts valid email', async () => {
      const req = new Request('https://x.com', {
        method: 'PUT',
        body: JSON.stringify({ email: 'carlos@example.com' }),
      });
      const res = await PUT(req, { params: Promise.resolve({}) });
      expect(res.status).toBe(200);
    });

    it('accepts valid linkedin URL', async () => {
      const req = new Request('https://x.com', {
        method: 'PUT',
        body: JSON.stringify({ linkedinUrl: 'https://linkedin.com/in/carlos' }),
      });
      const res = await PUT(req, { params: Promise.resolve({}) });
      expect(res.status).toBe(200);
    });

    it('rejects invalid linkedin URL', async () => {
      const req = new Request('https://x.com', {
        method: 'PUT',
        body: JSON.stringify({ linkedinUrl: 'not-a-url' }),
      });
      const res = await PUT(req, { params: Promise.resolve({}) });
      expect(res.status).toBe(422);
    });

    it('accepts empty body (all fields optional)', async () => {
      const req = new Request('https://x.com', { method: 'PUT', body: JSON.stringify({}) });
      const res = await PUT(req, { params: Promise.resolve({}) });
      expect(res.status).toBe(200);
    });

    // The PUT handler maps the wire-format "clear this field" sentinel
    // (`null` for non-nullable columns, `''` for linkedinUrl) into the
    // DB-format value. Each mapping is one branch in route.ts.
    describe('null ↔ empty-string mapping', () => {
      it('converts null on a regular field to empty string', async () => {
        const req = new Request('https://x.com', {
          method: 'PUT',
          body: JSON.stringify({ name: null }),
        });
        await PUT(req, { params: Promise.resolve({}) });
        expect(prisma.contactInfo.update).toHaveBeenCalledWith({
          where: { id: 'ci-1' },
          data: { name: '' },
        });
      });

      it('converts empty linkedinUrl to null (the nullable column)', async () => {
        const req = new Request('https://x.com', {
          method: 'PUT',
          body: JSON.stringify({ linkedinUrl: '' }),
        });
        await PUT(req, { params: Promise.resolve({}) });
        expect(prisma.contactInfo.update).toHaveBeenCalledWith({
          where: { id: 'ci-1' },
          data: { linkedinUrl: null },
        });
      });

      it('passes a non-empty linkedinUrl through unchanged', async () => {
        const req = new Request('https://x.com', {
          method: 'PUT',
          body: JSON.stringify({ linkedinUrl: 'https://linkedin.com/in/carlos' }),
        });
        await PUT(req, { params: Promise.resolve({}) });
        expect(prisma.contactInfo.update).toHaveBeenCalledWith({
          where: { id: 'ci-1' },
          data: { linkedinUrl: 'https://linkedin.com/in/carlos' },
        });
      });

      it('combines null clear on a regular field with a linkedinUrl in the same call', async () => {
        const req = new Request('https://x.com', {
          method: 'PUT',
          body: JSON.stringify({ phoneDisplay: null, linkedinUrl: 'https://x.com' }),
        });
        await PUT(req, { params: Promise.resolve({}) });
        expect(prisma.contactInfo.update).toHaveBeenCalledWith({
          where: { id: 'ci-1' },
          data: { phoneDisplay: '', linkedinUrl: 'https://x.com' },
        });
      });

      it('does not include a key when the value is undefined (skip branch)', async () => {
        // The schema is .nullish() so the client may omit a field; the
        // handler must skip undefined entries rather than write them.
        const req = new Request('https://x.com', {
          method: 'PUT',
          body: JSON.stringify({ name: 'Only Name' }),
        });
        await PUT(req, { params: Promise.resolve({}) });
        const call = prisma.contactInfo.update.mock.calls.at(-1)?.[0] as {
          data: Record<string, unknown>;
        };
        expect(call.data).toEqual({ name: 'Only Name' });
        expect('phoneDisplay' in call.data).toBe(false);
        expect('linkedinUrl' in call.data).toBe(false);
      });
    });
  });
});
