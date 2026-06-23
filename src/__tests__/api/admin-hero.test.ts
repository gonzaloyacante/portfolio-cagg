import { beforeEach, describe, expect, it, vi } from 'vitest';

import { GET, PUT } from '@/app/api/admin/hero/route';

const { prisma, revalidateLanding, auth, headers, schemaOverrides } = vi.hoisted(() => ({
  prisma: {
    hero: { findFirst: vi.fn(), update: vi.fn() },
    heroStat: { deleteMany: vi.fn(), createMany: vi.fn() },
    $transaction: vi.fn(),
  },
  revalidateLanding: vi.fn(),
  auth: { api: { getSession: vi.fn() } },
  headers: vi.fn(),
  // Per-test override of what heroUpdateSchema.safeParse() returns.
  // Lets us exercise code paths that Zod's default(0) would otherwise
  // hide (e.g. `s.order ?? i` when order is undefined).
  schemaOverrides: { parseResult: null as null | { success: true; data: unknown } },
}));

vi.mock('@/lib/prisma', () => ({ prisma }));
vi.mock('@/lib/revalidate', () => ({ revalidateLanding }));
vi.mock('@/lib/auth', () => ({ auth }));
vi.mock('next/headers', () => ({ headers }));
vi.mock('@/validations/admin', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/validations/admin')>();
  return {
    ...actual,
    heroUpdateSchema: {
      safeParse: (body: unknown) =>
        schemaOverrides.parseResult ?? actual.heroUpdateSchema.safeParse(body),
    },
  };
});

const HERO = {
  id: 'hero-1',
  overlineEs: 'Consultor',
  name: 'Carlos',
  stats: [],
};

describe('/api/admin/hero', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    schemaOverrides.parseResult = null;
    headers.mockResolvedValue(new Map());
    auth.api.getSession.mockResolvedValue({ user: { id: 'u1' } });
    prisma.hero.findFirst.mockResolvedValue(HERO);
    prisma.$transaction.mockImplementation(async (cb: (tx: typeof prisma) => Promise<unknown>) =>
      cb(prisma)
    );
  });

  describe('GET', () => {
    it('returns 401 without session', async () => {
      auth.api.getSession.mockResolvedValueOnce(null);
      const res = await GET(new Request('https://x.com'), { params: Promise.resolve({}) });
      expect(res.status).toBe(401);
    });

    it('returns 200 with hero data', async () => {
      const res = await GET(new Request('https://x.com'), { params: Promise.resolve({}) });
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.id).toBe('hero-1');
    });

    it('includes stats ordered asc', async () => {
      await GET(new Request('https://x.com'), { params: Promise.resolve({}) });
      expect(prisma.hero.findFirst).toHaveBeenCalledWith({
        include: { stats: { orderBy: { order: 'asc' } } },
      });
    });

    it('returns 404 when no hero exists', async () => {
      prisma.hero.findFirst.mockResolvedValueOnce(null);
      const res = await GET(new Request('https://x.com'), { params: Promise.resolve({}) });
      expect(res.status).toBe(404);
    });
  });

  describe('PUT', () => {
    it('returns 401 without session', async () => {
      auth.api.getSession.mockResolvedValueOnce(null);
      const req = new Request('https://x.com', {
        method: 'PUT',
        body: JSON.stringify({ name: 'X' }),
      });
      const res = await PUT(req, { params: Promise.resolve({}) });
      expect(res.status).toBe(401);
    });

    it('returns 422 on invalid body', async () => {
      const req = new Request('https://x.com', {
        method: 'PUT',
        body: JSON.stringify({ name: '' }),
      });
      const res = await PUT(req, { params: Promise.resolve({}) });
      expect(res.status).toBe(422);
    });

    it('returns 422 on non-JSON body', async () => {
      const req = new Request('https://x.com', { method: 'PUT', body: 'not json' });
      const res = await PUT(req, { params: Promise.resolve({}) });
      expect(res.status).toBe(422);
    });

    it('returns 404 when no hero exists', async () => {
      prisma.hero.findFirst.mockResolvedValueOnce(null);
      const req = new Request('https://x.com', {
        method: 'PUT',
        body: JSON.stringify({ name: 'X' }),
      });
      const res = await PUT(req, { params: Promise.resolve({}) });
      expect(res.status).toBe(404);
    });

    it('updates hero fields', async () => {
      const req = new Request('https://x.com', {
        method: 'PUT',
        body: JSON.stringify({ name: 'New Name', headlineEs: 'New headline' }),
      });
      const res = await PUT(req, { params: Promise.resolve({}) });
      expect(res.status).toBe(200);
      expect(prisma.$transaction).toHaveBeenCalled();
      expect(prisma.hero.update).toHaveBeenCalledWith({
        where: { id: 'hero-1' },
        data: { name: 'New Name', headlineEs: 'New headline' },
      });
    });

    it('replaces stats when provided', async () => {
      prisma.heroStat.createMany.mockResolvedValue({ count: 2 });
      const req = new Request('https://x.com', {
        method: 'PUT',
        body: JSON.stringify({
          stats: [
            { value: '15+', labelEs: 'Años', labelEn: 'Years' },
            { value: '50+', labelEs: 'Proyectos', labelEn: 'Projects' },
          ],
        }),
      });
      await PUT(req, { params: Promise.resolve({}) });
      expect(prisma.heroStat.deleteMany).toHaveBeenCalledWith({ where: { heroId: 'hero-1' } });
      expect(prisma.heroStat.createMany).toHaveBeenCalled();
    });

    it('does not call createMany when stats is empty', async () => {
      const req = new Request('https://x.com', {
        method: 'PUT',
        body: JSON.stringify({ stats: [] }),
      });
      await PUT(req, { params: Promise.resolve({}) });
      expect(prisma.heroStat.deleteMany).toHaveBeenCalled();
      expect(prisma.heroStat.createMany).not.toHaveBeenCalled();
    });

    it('does not touch stats when not provided', async () => {
      const req = new Request('https://x.com', {
        method: 'PUT',
        body: JSON.stringify({ name: 'X' }),
      });
      await PUT(req, { params: Promise.resolve({}) });
      expect(prisma.heroStat.deleteMany).not.toHaveBeenCalled();
    });

    it('calls revalidateLanding after success', async () => {
      const req = new Request('https://x.com', {
        method: 'PUT',
        body: JSON.stringify({ name: 'X' }),
      });
      await PUT(req, { params: Promise.resolve({}) });
      expect(revalidateLanding).toHaveBeenCalledOnce();
    });

    it('does not call revalidateLanding on validation error', async () => {
      // Empty body is valid for heroUpdateSchema (all fields optional), so
      // we use a known-invalid one: empty string for a min(1) field.
      const req = new Request('https://x.com', {
        method: 'PUT',
        body: JSON.stringify({ name: '' }),
      });
      await PUT(req, { params: Promise.resolve({}) });
      expect(revalidateLanding).not.toHaveBeenCalled();
    });

    it('transforms portraitUrl "" to null', async () => {
      const req = new Request('https://x.com', {
        method: 'PUT',
        body: JSON.stringify({ portraitUrl: '' }),
      });
      await PUT(req, { params: Promise.resolve({}) });
      expect(prisma.hero.update).toHaveBeenCalledWith({
        where: { id: 'hero-1' },
        data: { portraitUrl: null },
      });
    });

    it('accepts valid portraitUrl as a string', async () => {
      const req = new Request('https://x.com', {
        method: 'PUT',
        body: JSON.stringify({ portraitUrl: 'https://res.cloudinary.com/x.jpg' }),
      });
      await PUT(req, { params: Promise.resolve({}) });
      expect(prisma.hero.update).toHaveBeenCalledWith({
        where: { id: 'hero-1' },
        data: { portraitUrl: 'https://res.cloudinary.com/x.jpg' },
      });
    });

    it('accepts portraitUrl as null', async () => {
      const req = new Request('https://x.com', {
        method: 'PUT',
        body: JSON.stringify({ portraitUrl: null }),
      });
      await PUT(req, { params: Promise.resolve({}) });
      expect(prisma.hero.update).toHaveBeenCalledWith({
        where: { id: 'hero-1' },
        data: { portraitUrl: null },
      });
    });

    it('rejects invalid portraitUrl', async () => {
      const req = new Request('https://x.com', {
        method: 'PUT',
        body: JSON.stringify({ portraitUrl: 'not-a-url' }),
      });
      const res = await PUT(req, { params: Promise.resolve({}) });
      expect(res.status).toBe(422);
    });

    // The PUT handler maps `s.order ?? i` to fall back to the array
    // index when an individual stat has no order. Zod's .default(0)
    // would hide that branch in normal flow, so we feed the route a
    // raw parsed shape with explicit undefined orders.
    describe('stats ordering fallback', () => {
      it('falls back to array index when individual stat.order is undefined', async () => {
        // Parsed shape with order deliberately undefined — bypasses Zod's
        // default(0) so the `?? i` branch is exercised.
        schemaOverrides.parseResult = {
          success: true,
          data: {
            stats: [
              { value: '15+', labelEs: 'Años', labelEn: 'Years' },
              { value: '50+', labelEs: 'Proyectos', labelEn: 'Projects' },
            ],
          },
        };
        const req = new Request('https://x.com', {
          method: 'PUT',
          body: JSON.stringify({ stats: [] }),
        });
        await PUT(req, { params: Promise.resolve({}) });

        const call = prisma.heroStat.createMany.mock.calls.at(-1)?.[0] as {
          data: Array<{ value: string; order: number; heroId: string }>;
        };
        expect(
          call.data.map((s) => ({ value: s.value, order: s.order, heroId: s.heroId }))
        ).toEqual([
          { value: '15+', order: 0, heroId: 'hero-1' },
          { value: '50+', order: 1, heroId: 'hero-1' },
        ]);
      });

      it('keeps explicit s.order when provided (no fallback)', async () => {
        schemaOverrides.parseResult = {
          success: true,
          data: {
            stats: [
              { value: 'A', labelEs: 'a', labelEn: 'a', order: 7 },
              { value: 'B', labelEs: 'b', labelEn: 'b', order: 3 },
            ],
          },
        };
        const req = new Request('https://x.com', {
          method: 'PUT',
          body: JSON.stringify({ stats: [] }),
        });
        await PUT(req, { params: Promise.resolve({}) });

        const call = prisma.heroStat.createMany.mock.calls.at(-1)?.[0] as {
          data: Array<{ order: number }>;
        };
        expect(call.data.map((s) => s.order)).toEqual([7, 3]);
      });
    });
  });
});
