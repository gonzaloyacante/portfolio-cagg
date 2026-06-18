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

const CARD = {
  id: 'card-1',
  code: '01',
  titleEs: 'Senior',
  titleEn: 'Senior',
  bodyEs: 'Cuerpo',
  bodyEn: 'Body',
  order: 0,
};

const VALID = {
  code: '01',
  titleEs: 'Senior',
  titleEn: 'Senior',
  bodyEs: 'Cuerpo',
  bodyEn: 'Body',
  order: 0,
};

describe('/api/admin/experience', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    headers.mockResolvedValue(new Map());
    auth.api.getSession.mockResolvedValue({ user: { id: 'u1' } });
    prisma.experienceCard.findMany.mockResolvedValue([CARD]);
    prisma.experienceCard.create.mockResolvedValue(CARD);
    prisma.experienceCard.update.mockResolvedValue(CARD);
    prisma.experienceCard.delete.mockResolvedValue(CARD);
  });

  describe('GET', () => {
    it('returns 401 without session', async () => {
      auth.api.getSession.mockResolvedValueOnce(null);
      const res = await GET(new Request('https://x.com'), { params: Promise.resolve({}) });
      expect(res.status).toBe(401);
    });

    it('returns 200 with items ordered by order asc', async () => {
      const res = await GET(new Request('https://x.com'), { params: Promise.resolve({}) });
      expect(res.status).toBe(200);
      expect(prisma.experienceCard.findMany).toHaveBeenCalledWith({ orderBy: { order: 'asc' } });
    });

    it('returns the array', async () => {
      const res = await GET(new Request('https://x.com'), { params: Promise.resolve({}) });
      const body = await res.json();
      expect(body.length).toBe(1);
    });
  });

  describe('POST', () => {
    it('returns 401 without session', async () => {
      auth.api.getSession.mockResolvedValueOnce(null);
      const req = new Request('https://x.com', { method: 'POST', body: JSON.stringify(VALID) });
      const res = await POST(req, { params: Promise.resolve({}) });
      expect(res.status).toBe(401);
    });

    it('returns 201 on valid payload', async () => {
      const req = new Request('https://x.com', { method: 'POST', body: JSON.stringify(VALID) });
      const res = await POST(req, { params: Promise.resolve({}) });
      expect(res.status).toBe(201);
    });

    it('creates with the parsed data', async () => {
      const req = new Request('https://x.com', { method: 'POST', body: JSON.stringify(VALID) });
      await POST(req, { params: Promise.resolve({}) });
      expect(prisma.experienceCard.create).toHaveBeenCalledWith({ data: VALID });
    });

    it('calls revalidateLanding after success', async () => {
      const req = new Request('https://x.com', { method: 'POST', body: JSON.stringify(VALID) });
      await POST(req, { params: Promise.resolve({}) });
      expect(revalidateLanding).toHaveBeenCalled();
    });

    it('returns 422 on invalid body', async () => {
      const req = new Request('https://x.com', {
        method: 'POST',
        body: JSON.stringify({ code: '' }),
      });
      const res = await POST(req, { params: Promise.resolve({}) });
      expect(res.status).toBe(422);
    });

    it('returns 422 on non-JSON', async () => {
      const req = new Request('https://x.com', { method: 'POST', body: 'nope' });
      const res = await POST(req, { params: Promise.resolve({}) });
      expect(res.status).toBe(422);
    });

    it.each(['code', 'titleEs', 'titleEn', 'bodyEs', 'bodyEn'])(
      'rejects empty %s',
      async (field) => {
        const req = new Request('https://x.com', {
          method: 'POST',
          body: JSON.stringify({ ...VALID, [field]: '' }),
        });
        const res = await POST(req, { params: Promise.resolve({}) });
        expect(res.status).toBe(422);
      }
    );
  });
});

describe('/api/admin/experience/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    headers.mockResolvedValue(new Map());
    auth.api.getSession.mockResolvedValue({ user: { id: 'u1' } });
    prisma.experienceCard.update.mockResolvedValue(CARD);
    prisma.experienceCard.delete.mockResolvedValue(CARD);
  });

  describe('PUT', () => {
    it('returns 401 without session', async () => {
      auth.api.getSession.mockResolvedValueOnce(null);
      const req = new Request('https://x.com', { method: 'PUT', body: JSON.stringify(VALID) });
      const res = await PUT(req, { params: Promise.resolve({ id: 'card-1' }) });
      expect(res.status).toBe(401);
    });

    it('updates the card', async () => {
      prisma.experienceCard.update.mockResolvedValueOnce({ ...CARD, titleEs: 'New' });
      const req = new Request('https://x.com', {
        method: 'PUT',
        body: JSON.stringify({ titleEs: 'New' }),
      });
      const res = await PUT(req, { params: Promise.resolve({ id: 'card-1' }) });
      expect(res.status).toBe(200);
      // Schema applies .partial() and order has default(0) — so parsed data
      // includes { order: 0, titleEs: 'New' }.
      expect(prisma.experienceCard.update).toHaveBeenCalledWith({
        where: { id: 'card-1' },
        data: { order: 0, titleEs: 'New' },
      });
    });

    it('accepts partial payload (only one field)', async () => {
      prisma.experienceCard.update.mockResolvedValueOnce({ ...CARD, code: 'A2' });
      const req = new Request('https://x.com', {
        method: 'PUT',
        body: JSON.stringify({ code: 'A2' }),
      });
      await PUT(req, { params: Promise.resolve({ id: 'card-1' }) });
      expect(prisma.experienceCard.update).toHaveBeenCalledWith({
        where: { id: 'card-1' },
        data: { order: 0, code: 'A2' },
      });
    });

    it('calls revalidateLanding after success', async () => {
      const req = new Request('https://x.com', { method: 'PUT', body: JSON.stringify({}) });
      await PUT(req, { params: Promise.resolve({ id: 'card-1' }) });
      expect(revalidateLanding).toHaveBeenCalled();
    });

    it('returns 404 when card not found', async () => {
      prisma.experienceCard.update.mockRejectedValueOnce(new Error('not found'));
      const req = new Request('https://x.com', { method: 'PUT', body: JSON.stringify({}) });
      const res = await PUT(req, { params: Promise.resolve({ id: 'missing' }) });
      expect(res.status).toBe(404);
    });

    it('returns 422 on invalid body', async () => {
      const req = new Request('https://x.com', {
        method: 'PUT',
        body: JSON.stringify({ code: '' }),
      });
      const res = await PUT(req, { params: Promise.resolve({ id: 'card-1' }) });
      expect(res.status).toBe(422);
    });

    it('returns 422 on non-JSON', async () => {
      const req = new Request('https://x.com', { method: 'PUT', body: 'nope' });
      const res = await PUT(req, { params: Promise.resolve({ id: 'card-1' }) });
      expect(res.status).toBe(422);
    });
  });

  describe('DELETE', () => {
    it('returns 401 without session', async () => {
      auth.api.getSession.mockResolvedValueOnce(null);
      const res = await DELETE(new Request('https://x.com', { method: 'DELETE' }), {
        params: Promise.resolve({ id: 'card-1' }),
      });
      expect(res.status).toBe(401);
    });

    it('returns 204 on success', async () => {
      const res = await DELETE(new Request('https://x.com', { method: 'DELETE' }), {
        params: Promise.resolve({ id: 'card-1' }),
      });
      expect(res.status).toBe(204);
    });

    it('calls revalidateLanding after delete', async () => {
      await DELETE(new Request('https://x.com', { method: 'DELETE' }), {
        params: Promise.resolve({ id: 'card-1' }),
      });
      expect(revalidateLanding).toHaveBeenCalled();
    });

    it('returns 404 when card not found', async () => {
      prisma.experienceCard.delete.mockRejectedValueOnce(new Error('not found'));
      const res = await DELETE(new Request('https://x.com', { method: 'DELETE' }), {
        params: Promise.resolve({ id: 'missing' }),
      });
      expect(res.status).toBe(404);
    });
  });
});
