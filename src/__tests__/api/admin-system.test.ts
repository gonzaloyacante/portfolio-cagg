import { beforeEach, describe, expect, it, vi } from 'vitest';

import { GET, PUT } from '@/app/api/admin/system/route';

const { prisma, revalidateLanding, auth, headers } = vi.hoisted(() => ({
  prisma: { setting: { findUnique: vi.fn(), upsert: vi.fn() } },
  revalidateLanding: vi.fn(),
  auth: { api: { getSession: vi.fn() } },
  headers: vi.fn(),
}));

vi.mock('@/lib/prisma', () => ({ prisma }));
vi.mock('@/lib/revalidate', () => ({ revalidateLanding }));
vi.mock('@/lib/auth', () => ({ auth }));
vi.mock('next/headers', () => ({ headers }));

describe('/api/admin/system', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    headers.mockResolvedValue(new Map());
    auth.api.getSession.mockResolvedValue({ user: { id: 'u1' } });
    prisma.setting.findUnique.mockResolvedValue(null);
    prisma.setting.upsert.mockResolvedValue({ key: 'x', value: 'y' });
  });

  describe('GET', () => {
    it('returns 401 without session', async () => {
      auth.api.getSession.mockResolvedValueOnce(null);
      const res = await (GET as unknown as () => Promise<Response>)();
      expect(res.status).toBe(401);
    });

    it('defaults acceptingProjects to true when no setting', async () => {
      const res = await (GET as unknown as () => Promise<Response>)();
      const body = await res.json();
      expect(body.acceptingProjects).toBe(true);
    });

    it('returns acceptingProjects=false when stored as "false"', async () => {
      prisma.setting.findUnique.mockResolvedValueOnce({ value: 'false' });
      const res = await (GET as unknown as () => Promise<Response>)();
      const body = await res.json();
      expect(body.acceptingProjects).toBe(false);
    });

    it('returns acceptingProjects=true when stored as "true"', async () => {
      prisma.setting.findUnique.mockResolvedValueOnce({ value: 'true' });
      const res = await (GET as unknown as () => Promise<Response>)();
      const body = await res.json();
      expect(body.acceptingProjects).toBe(true);
    });

    it('queries the accepting_projects key', async () => {
      await (GET as unknown as () => Promise<Response>)();
      expect(prisma.setting.findUnique).toHaveBeenCalledWith({
        where: { key: 'accepting_projects' },
      });
    });
  });

  describe('PUT', () => {
    it('returns 401 without session', async () => {
      auth.api.getSession.mockResolvedValueOnce(null);
      const req = new Request('https://x.com', {
        method: 'PUT',
        body: JSON.stringify({ acceptingProjects: true }),
      });
      const res = await PUT(req, { params: Promise.resolve({}) });
      expect(res.status).toBe(401);
    });

    it('returns 422 on invalid body', async () => {
      const req = new Request('https://x.com', {
        method: 'PUT',
        body: JSON.stringify({ acceptingProjects: 'yes' }),
      });
      const res = await PUT(req, { params: Promise.resolve({}) });
      expect(res.status).toBe(422);
    });

    it('upserts the setting', async () => {
      const req = new Request('https://x.com', {
        method: 'PUT',
        body: JSON.stringify({ acceptingProjects: false }),
      });
      await PUT(req, { params: Promise.resolve({}) });
      expect(prisma.setting.upsert).toHaveBeenCalledWith({
        where: { key: 'accepting_projects' },
        update: { value: 'false' },
        create: { key: 'accepting_projects', value: 'false' },
      });
    });

    it('stores the value as a string', async () => {
      const req = new Request('https://x.com', {
        method: 'PUT',
        body: JSON.stringify({ acceptingProjects: true }),
      });
      await PUT(req, { params: Promise.resolve({}) });
      const call = prisma.setting.upsert.mock.calls[0];
      expect(call?.[0]?.update).toEqual({ value: 'true' });
    });

    it('calls revalidateLanding after success', async () => {
      const req = new Request('https://x.com', {
        method: 'PUT',
        body: JSON.stringify({ acceptingProjects: false }),
      });
      await PUT(req, { params: Promise.resolve({}) });
      expect(revalidateLanding).toHaveBeenCalled();
    });

    it('returns 200 with success: true', async () => {
      const req = new Request('https://x.com', {
        method: 'PUT',
        body: JSON.stringify({ acceptingProjects: true }),
      });
      const res = await PUT(req, { params: Promise.resolve({}) });
      const body = await res.json();
      expect(body).toEqual({ success: true });
    });
  });
});
