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
  });
});
