import { beforeEach, describe, expect, it, vi } from 'vitest';

import { DELETE, PATCH } from '@/app/api/admin/messages/[id]/route';
import { GET } from '@/app/api/admin/messages/route';

const { prisma, revalidateLanding, auth, headers } = vi.hoisted(() => ({
  prisma: {
    contactMessage: { findMany: vi.fn(), count: vi.fn(), update: vi.fn(), delete: vi.fn() },
  },
  revalidateLanding: vi.fn(),
  auth: { api: { getSession: vi.fn() } },
  headers: vi.fn(),
}));

vi.mock('@/lib/prisma', () => ({ prisma }));
vi.mock('@/lib/revalidate', () => ({ revalidateLanding }));
vi.mock('@/lib/auth', () => ({ auth }));
vi.mock('next/headers', () => ({ headers }));

const MSG = {
  id: 'm-1',
  name: 'A',
  email: 'a@b.co',
  message: 'm',
  read: false,
  createdAt: new Date(),
};

describe('/api/admin/messages — extra density', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    headers.mockResolvedValue(new Headers());
    auth.api.getSession.mockResolvedValue({ user: { id: 'u1' } });
    prisma.contactMessage.findMany.mockResolvedValue([MSG]);
    prisma.contactMessage.count.mockResolvedValue(1);
    prisma.contactMessage.update.mockResolvedValue({ ...MSG, read: true });
    prisma.contactMessage.delete.mockResolvedValue(MSG);
  });

  describe('GET', () => {
    it('returns 401 without session', async () => {
      auth.api.getSession.mockResolvedValueOnce(null);
      const res = await GET(new Request('https://x.com'), { params: Promise.resolve({}) });
      expect(res.status).toBe(401);
    });

    it('returns 200 with items, total, unread', async () => {
      const res = await GET(new Request('https://x.com'), { params: Promise.resolve({}) });
      const body = await res.json();
      expect(body).toHaveProperty('items');
      expect(body).toHaveProperty('total');
      expect(body).toHaveProperty('unread');
    });

    it.each([
      ['/'],
      ['?skip=0'],
      ['?limit=10'],
      ['?skip=20&limit=10'],
      ['?skip=0&limit=100'],
      ['?skip=1000&limit=100'],
    ])('handles query string: %s', async (qs) => {
      const req = new Request(`https://x.com/admin/messages${qs}`);
      const res = await GET(req, { params: Promise.resolve({}) });
      expect(res.status).toBe(200);
    });

    it.each([0, 10, 50, 100, 500])('handles limit %d', async (limit) => {
      const req = new Request(`https://x.com/admin/messages?limit=${limit}`);
      const res = await GET(req, { params: Promise.resolve({}) });
      expect(res.status).toBe(200);
    });

    it('handles 100 messages', async () => {
      prisma.contactMessage.findMany.mockResolvedValueOnce(
        Array.from({ length: 100 }, (_, i) => ({ ...MSG, id: `m-${i}` }))
      );
      prisma.contactMessage.count.mockResolvedValueOnce(100);
      const res = await GET(new Request('https://x.com'), { params: Promise.resolve({}) });
      const body = await res.json();
      expect(body.items.length).toBe(100);
      expect(body.total).toBe(100);
    });

    it('orders by createdAt desc', async () => {
      await GET(new Request('https://x.com'), { params: Promise.resolve({}) });
      expect(prisma.contactMessage.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ orderBy: { createdAt: 'desc' } })
      );
    });
  });

  describe('PATCH [id]', () => {
    it('returns 401 without session', async () => {
      auth.api.getSession.mockResolvedValueOnce(null);
      const req = new Request('https://x.com', {
        method: 'PATCH',
        body: JSON.stringify({ read: true }),
      });
      const res = await PATCH(req, { params: Promise.resolve({ id: 'm-1' }) });
      expect(res.status).toBe(401);
    });

    it('marks as read', async () => {
      const req = new Request('https://x.com', {
        method: 'PATCH',
        body: JSON.stringify({ read: true }),
      });
      const res = await PATCH(req, { params: Promise.resolve({ id: 'm-1' }) });
      expect(res.status).toBe(200);
    });

    it('marks as unread', async () => {
      const req = new Request('https://x.com', {
        method: 'PATCH',
        body: JSON.stringify({ read: false }),
      });
      const res = await PATCH(req, { params: Promise.resolve({ id: 'm-1' }) });
      expect(res.status).toBe(200);
    });

    it('returns 422 on missing read field', async () => {
      const req = new Request('https://x.com', { method: 'PATCH', body: JSON.stringify({}) });
      const res = await PATCH(req, { params: Promise.resolve({ id: 'm-1' }) });
      expect(res.status).toBe(422);
    });

    it('returns 422 on non-JSON', async () => {
      const req = new Request('https://x.com', { method: 'PATCH', body: 'garbage' });
      const res = await PATCH(req, { params: Promise.resolve({ id: 'm-1' }) });
      expect(res.status).toBe(422);
    });

    it('returns 422 on read=string', async () => {
      const req = new Request('https://x.com', {
        method: 'PATCH',
        body: JSON.stringify({ read: 'yes' }),
      });
      const res = await PATCH(req, { params: Promise.resolve({ id: 'm-1' }) });
      expect(res.status).toBe(422);
    });

    it('returns 404 when message not found', async () => {
      prisma.contactMessage.update.mockRejectedValueOnce(new Error('not found'));
      const req = new Request('https://x.com', {
        method: 'PATCH',
        body: JSON.stringify({ read: true }),
      });
      const res = await PATCH(req, { params: Promise.resolve({ id: 'missing' }) });
      expect(res.status).toBe(404);
    });
  });

  describe('DELETE [id]', () => {
    it('returns 401 without session', async () => {
      auth.api.getSession.mockResolvedValueOnce(null);
      const req = new Request('https://x.com', { method: 'DELETE' });
      const res = await DELETE(req, { params: Promise.resolve({ id: 'm-1' }) });
      expect(res.status).toBe(401);
    });

    it('returns 204 on success', async () => {
      const req = new Request('https://x.com', { method: 'DELETE' });
      const res = await DELETE(req, { params: Promise.resolve({ id: 'm-1' }) });
      expect(res.status).toBe(204);
    });

    it('returns 404 when not found', async () => {
      prisma.contactMessage.delete.mockRejectedValueOnce(new Error('not found'));
      const req = new Request('https://x.com', { method: 'DELETE' });
      const res = await DELETE(req, { params: Promise.resolve({ id: 'missing' }) });
      expect(res.status).toBe(404);
    });
  });
});
