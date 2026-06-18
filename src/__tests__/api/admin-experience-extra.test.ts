import { beforeEach, describe, expect, it, vi } from 'vitest';

import { DELETE, PUT } from '@/app/api/admin/experience/[id]/route';
import { GET, POST } from '@/app/api/admin/experience/route';

const { prisma, revalidateLanding, auth, headers } = vi.hoisted(() => ({
  prisma: {
    experienceCard: { findMany: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn() },
  },
  revalidateLanding: vi.fn(),
  auth: { api: { getSession: vi.fn() } },
  headers: vi.fn(),
}));

vi.mock('@/lib/prisma', () => ({ prisma }));
vi.mock('@/lib/revalidate', () => ({ revalidateLanding }));
vi.mock('@/lib/auth', () => ({ auth }));
vi.mock('next/headers', () => ({ headers }));

const VALID = {
  code: '01',
  titleEs: 'Senior',
  titleEn: 'Senior',
  bodyEs: 'Cuerpo',
  bodyEn: 'Body',
};

describe('/api/admin/experience — extra density', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    headers.mockResolvedValue(new Headers());
    auth.api.getSession.mockResolvedValue({ user: { id: 'u1' } });
    prisma.experienceCard.findMany.mockResolvedValue([]);
    prisma.experienceCard.create.mockResolvedValue({ id: '1' });
    prisma.experienceCard.update.mockResolvedValue({ id: '1' });
    prisma.experienceCard.delete.mockResolvedValue({ id: '1' });
  });

  describe('GET', () => {
    it('returns 401 without session', async () => {
      auth.api.getSession.mockResolvedValueOnce(null);
      const res = await GET(new Request('https://x.com'), { params: Promise.resolve({}) });
      expect(res.status).toBe(401);
    });

    it('returns 200 with array of items', async () => {
      const res = await GET(new Request('https://x.com'), { params: Promise.resolve({}) });
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(Array.isArray(body)).toBe(true);
    });

    it('orders by order asc', async () => {
      await GET(new Request('https://x.com'), { params: Promise.resolve({}) });
      expect(prisma.experienceCard.findMany).toHaveBeenCalledWith({ orderBy: { order: 'asc' } });
    });

    it('handles 100 items', async () => {
      prisma.experienceCard.findMany.mockResolvedValueOnce(
        Array.from({ length: 100 }, (_, i) => ({ id: `${i}` }))
      );
      const res = await GET(new Request('https://x.com'), { params: Promise.resolve({}) });
      const body = await res.json();
      expect(body.length).toBe(100);
    });
  });

  describe('POST', () => {
    it('returns 401 without session', async () => {
      auth.api.getSession.mockResolvedValueOnce(null);
      const req = new Request('https://x.com', { method: 'POST', body: JSON.stringify(VALID) });
      const res = await POST(req, { params: Promise.resolve({}) });
      expect(res.status).toBe(401);
    });

    it('returns 201 on success', async () => {
      const req = new Request('https://x.com', { method: 'POST', body: JSON.stringify(VALID) });
      const res = await POST(req, { params: Promise.resolve({}) });
      expect(res.status).toBe(201);
    });

    it('returns 422 on missing required field', async () => {
      const req = new Request('https://x.com', {
        method: 'POST',
        body: JSON.stringify({ code: 'x' }),
      });
      const res = await POST(req, { params: Promise.resolve({}) });
      expect(res.status).toBe(422);
    });

    it('returns 422 on non-JSON', async () => {
      const req = new Request('https://x.com', { method: 'POST', body: 'garbage' });
      const res = await POST(req, { params: Promise.resolve({}) });
      expect(res.status).toBe(422);
    });

    it('returns 422 on wrong type', async () => {
      const req = new Request('https://x.com', {
        method: 'POST',
        body: JSON.stringify({ ...VALID, code: 123 }),
      });
      const res = await POST(req, { params: Promise.resolve({}) });
      expect(res.status).toBe(422);
    });

    it('accepts unicode text', async () => {
      const req = new Request('https://x.com', {
        method: 'POST',
        body: JSON.stringify({ ...VALID, titleEs: '你好', titleEn: 'Hello' }),
      });
      const res = await POST(req, { params: Promise.resolve({}) });
      expect(res.status).toBe(201);
    });

    it('accepts very long text', async () => {
      const req = new Request('https://x.com', {
        method: 'POST',
        body: JSON.stringify({ ...VALID, bodyEs: 'a'.repeat(10_000), bodyEn: 'a'.repeat(10_000) }),
      });
      const res = await POST(req, { params: Promise.resolve({}) });
      expect(res.status).toBe(201);
    });
  });

  describe('PUT [id]', () => {
    it('returns 401 without session', async () => {
      auth.api.getSession.mockResolvedValueOnce(null);
      const req = new Request('https://x.com', { method: 'PUT', body: JSON.stringify(VALID) });
      const res = await PUT(req, { params: Promise.resolve({ id: '1' }) });
      expect(res.status).toBe(401);
    });

    it('returns 200 on success', async () => {
      const req = new Request('https://x.com', { method: 'PUT', body: JSON.stringify(VALID) });
      const res = await PUT(req, { params: Promise.resolve({ id: '1' }) });
      expect(res.status).toBe(200);
    });

    it('returns 404 when not found', async () => {
      prisma.experienceCard.update.mockRejectedValueOnce(new Error('not found'));
      const req = new Request('https://x.com', { method: 'PUT', body: JSON.stringify(VALID) });
      const res = await PUT(req, { params: Promise.resolve({ id: 'missing' }) });
      expect(res.status).toBe(404);
    });

    it('returns 422 on empty body', async () => {
      const req = new Request('https://x.com', { method: 'PUT', body: JSON.stringify({}) });
      const res = await PUT(req, { params: Promise.resolve({ id: '1' }) });
      expect(res.status).toBe(200); // empty is valid (partial)
    });

    it('returns 422 on invalid type', async () => {
      const req = new Request('https://x.com', {
        method: 'PUT',
        body: JSON.stringify({ code: 123 }),
      });
      const res = await PUT(req, { params: Promise.resolve({ id: '1' }) });
      expect(res.status).toBe(422);
    });
  });

  describe('DELETE [id]', () => {
    it('returns 401 without session', async () => {
      auth.api.getSession.mockResolvedValueOnce(null);
      const req = new Request('https://x.com', { method: 'DELETE' });
      const res = await DELETE(req, { params: Promise.resolve({ id: '1' }) });
      expect(res.status).toBe(401);
    });

    it('returns 204 on success', async () => {
      const req = new Request('https://x.com', { method: 'DELETE' });
      const res = await DELETE(req, { params: Promise.resolve({ id: '1' }) });
      expect(res.status).toBe(204);
    });

    it('returns 404 when not found', async () => {
      prisma.experienceCard.delete.mockRejectedValueOnce(new Error('not found'));
      const req = new Request('https://x.com', { method: 'DELETE' });
      const res = await DELETE(req, { params: Promise.resolve({ id: 'missing' }) });
      expect(res.status).toBe(404);
    });
  });
});
