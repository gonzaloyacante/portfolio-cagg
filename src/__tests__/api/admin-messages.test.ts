import { beforeEach, describe, expect, it, vi } from 'vitest';

import { DELETE, PATCH } from '@/app/api/admin/messages/[id]/route';
import { GET } from '@/app/api/admin/messages/route';

const { prisma, auth, headers } = vi.hoisted(() => ({
  prisma: {
    contactMessage: { findMany: vi.fn(), count: vi.fn(), update: vi.fn(), delete: vi.fn() },
  },
  auth: { api: { getSession: vi.fn() } },
  headers: vi.fn(),
}));

vi.mock('@/lib/prisma', () => ({ prisma }));
vi.mock('@/lib/auth', () => ({ auth }));
vi.mock('next/headers', () => ({ headers }));

const MSG = {
  id: 'm-1',
  name: 'A',
  email: 'a@b.co',
  message: 'msg',
  read: false,
  createdAt: new Date(),
};

describe('/api/admin/messages GET', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    headers.mockResolvedValue(new Map());
    auth.api.getSession.mockResolvedValue({ user: { id: 'u1' } });
    prisma.contactMessage.findMany.mockResolvedValue([MSG]);
    prisma.contactMessage.count.mockResolvedValue(1);
  });

  it('returns 401 without session', async () => {
    auth.api.getSession.mockResolvedValueOnce(null);
    const req = new Request('https://x.com');
    const res = await GET(req, { params: Promise.resolve({}) });
    expect(res.status).toBe(401);
  });

  it('returns items, total, unread', async () => {
    const req = new Request('https://x.com');
    const res = await GET(req, { params: Promise.resolve({}) });
    const body = await res.json();
    expect(body).toHaveProperty('items');
    expect(body).toHaveProperty('total');
    expect(body).toHaveProperty('unread');
  });

  it('uses default skip=0 limit=50', async () => {
    const req = new Request('https://x.com');
    await GET(req, { params: Promise.resolve({}) });
    expect(prisma.contactMessage.findMany).toHaveBeenCalledWith({
      orderBy: { createdAt: 'desc' },
      skip: 0,
      take: 50,
    });
  });

  it('parses skip and limit from query string', async () => {
    const req = new Request('https://x.com?skip=20&limit=10');
    await GET(req, { params: Promise.resolve({}) });
    expect(prisma.contactMessage.findMany).toHaveBeenCalledWith({
      orderBy: { createdAt: 'desc' },
      skip: 20,
      take: 10,
    });
  });

  it('orders by createdAt desc', async () => {
    const req = new Request('https://x.com');
    await GET(req, { params: Promise.resolve({}) });
    expect(prisma.contactMessage.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ orderBy: { createdAt: 'desc' } })
    );
  });

  it('counts total and unread in parallel', async () => {
    const req = new Request('https://x.com');
    await GET(req, { params: Promise.resolve({}) });
    expect(prisma.contactMessage.count).toHaveBeenCalledWith();
    expect(prisma.contactMessage.count).toHaveBeenCalledWith({ where: { read: false } });
  });
});

describe('/api/admin/messages/[id] PATCH', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    headers.mockResolvedValue(new Map());
    auth.api.getSession.mockResolvedValue({ user: { id: 'u1' } });
    prisma.contactMessage.update.mockResolvedValue({ ...MSG, read: true });
  });

  it('returns 401 without session', async () => {
    auth.api.getSession.mockResolvedValueOnce(null);
    const req = new Request('https://x.com', {
      method: 'PATCH',
      body: JSON.stringify({ read: true }),
    });
    const res = await PATCH(req, { params: Promise.resolve({ id: 'm-1' }) });
    expect(res.status).toBe(401);
  });

  it('marks a message as read', async () => {
    const req = new Request('https://x.com', {
      method: 'PATCH',
      body: JSON.stringify({ read: true }),
    });
    const res = await PATCH(req, { params: Promise.resolve({ id: 'm-1' }) });
    expect(res.status).toBe(200);
    expect(prisma.contactMessage.update).toHaveBeenCalledWith({
      where: { id: 'm-1' },
      data: { read: true },
    });
  });

  it('marks a message as unread', async () => {
    const req = new Request('https://x.com', {
      method: 'PATCH',
      body: JSON.stringify({ read: false }),
    });
    await PATCH(req, { params: Promise.resolve({ id: 'm-1' }) });
    expect(prisma.contactMessage.update).toHaveBeenCalledWith({
      where: { id: 'm-1' },
      data: { read: false },
    });
  });

  it('returns 422 on invalid body', async () => {
    const req = new Request('https://x.com', {
      method: 'PATCH',
      body: JSON.stringify({ read: 'yes' }),
    });
    const res = await PATCH(req, { params: Promise.resolve({ id: 'm-1' }) });
    expect(res.status).toBe(422);
  });

  it('returns 422 on non-JSON', async () => {
    const req = new Request('https://x.com', { method: 'PATCH', body: 'nope' });
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

describe('/api/admin/messages/[id] DELETE', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    headers.mockResolvedValue(new Map());
    auth.api.getSession.mockResolvedValue({ user: { id: 'u1' } });
    prisma.contactMessage.delete.mockResolvedValue(MSG);
  });

  it('returns 401 without session', async () => {
    auth.api.getSession.mockResolvedValueOnce(null);
    const res = await DELETE(new Request('https://x.com', { method: 'DELETE' }), {
      params: Promise.resolve({ id: 'm-1' }),
    });
    expect(res.status).toBe(401);
  });

  it('returns 204 on success', async () => {
    const res = await DELETE(new Request('https://x.com', { method: 'DELETE' }), {
      params: Promise.resolve({ id: 'm-1' }),
    });
    expect(res.status).toBe(204);
  });

  it('returns 404 when not found', async () => {
    prisma.contactMessage.delete.mockRejectedValueOnce(new Error('not found'));
    const res = await DELETE(new Request('https://x.com', { method: 'DELETE' }), {
      params: Promise.resolve({ id: 'missing' }),
    });
    expect(res.status).toBe(404);
  });
});
