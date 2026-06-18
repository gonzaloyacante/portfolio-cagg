import { beforeEach, describe, expect, it, vi } from 'vitest';

import { GET, PUT } from '@/app/api/admin/email-settings/route';

const { prisma, auth, headers } = vi.hoisted(() => ({
  prisma: { setting: { findMany: vi.fn(), upsert: vi.fn() }, $transaction: vi.fn() },
  auth: { api: { getSession: vi.fn() } },
  headers: vi.fn(),
}));

vi.mock('@/lib/prisma', () => ({ prisma }));
vi.mock('@/lib/auth', () => ({ auth }));
vi.mock('next/headers', () => ({ headers }));

describe('/api/admin/email-settings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    headers.mockResolvedValue(new Map());
    auth.api.getSession.mockResolvedValue({ user: { id: 'u1' } });
    prisma.setting.findMany.mockResolvedValue([]);
    prisma.$transaction.mockResolvedValue(undefined);
  });

  describe('GET', () => {
    it('returns 401 without session', async () => {
      auth.api.getSession.mockResolvedValueOnce(null);
      const res = await GET(new Request('https://x.com'), { params: Promise.resolve({}) });
      expect(res.status).toBe(401);
    });

    it('returns 200 with empty defaults when no settings', async () => {
      const res = await GET(new Request('https://x.com'), { params: Promise.resolve({}) });
      const body = await res.json();
      expect(body).toEqual({ notificationEmail: '', notificationsEnabled: true });
    });

    it('returns 200 with stored values', async () => {
      prisma.setting.findMany.mockResolvedValueOnce([
        { key: 'notification_email', value: 'me@example.com' },
        { key: 'notifications_enabled', value: 'false' },
      ]);
      const res = await GET(new Request('https://x.com'), { params: Promise.resolve({}) });
      const body = await res.json();
      expect(body.notificationEmail).toBe('me@example.com');
      expect(body.notificationsEnabled).toBe(false);
    });

    it('queries the expected keys', async () => {
      await GET(new Request('https://x.com'), { params: Promise.resolve({}) });
      expect(prisma.setting.findMany).toHaveBeenCalledWith({
        where: { key: { in: ['notification_email', 'notifications_enabled'] } },
      });
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
        body: JSON.stringify({ notificationEmail: 'bad' }),
      });
      const res = await PUT(req, { params: Promise.resolve({}) });
      expect(res.status).toBe(422);
    });

    it('upserts both settings in a transaction', async () => {
      prisma.setting.upsert.mockResolvedValue({ key: 'x', value: 'y' });
      const req = new Request('https://x.com', {
        method: 'PUT',
        body: JSON.stringify({ notificationEmail: 'me@example.com', notificationsEnabled: false }),
      });
      await PUT(req, { params: Promise.resolve({}) });
      expect(prisma.$transaction).toHaveBeenCalled();
      expect(prisma.setting.upsert).toHaveBeenCalledTimes(2);
    });

    it('accepts an empty notification email (clears it)', async () => {
      const req = new Request('https://x.com', {
        method: 'PUT',
        body: JSON.stringify({ notificationEmail: '', notificationsEnabled: true }),
      });
      const res = await PUT(req, { params: Promise.resolve({}) });
      expect(res.status).toBe(200);
    });

    it('stores notificationsEnabled as a string', async () => {
      const req = new Request('https://x.com', {
        method: 'PUT',
        body: JSON.stringify({ notificationEmail: 'me@example.com', notificationsEnabled: true }),
      });
      await PUT(req, { params: Promise.resolve({}) });
      const calls = prisma.setting.upsert.mock.calls;
      const notifCall = calls.find((c) => c[0]?.where?.key === 'notifications_enabled');
      expect(notifCall?.[0]?.update).toEqual({ value: 'true' });
    });

    it('returns 200 with success: true', async () => {
      const req = new Request('https://x.com', {
        method: 'PUT',
        body: JSON.stringify({ notificationEmail: 'me@example.com', notificationsEnabled: true }),
      });
      const res = await PUT(req, { params: Promise.resolve({}) });
      const body = await res.json();
      expect(body).toEqual({ success: true });
    });
  });
});
