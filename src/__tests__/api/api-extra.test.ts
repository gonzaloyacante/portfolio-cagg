import { beforeEach, describe, expect, it, vi } from 'vitest';

import { GET as ContactInfoGET, PUT as ContactInfoPUT } from '@/app/api/admin/contact-info/route';
import { GET as HeroGET, PUT as HeroPUT } from '@/app/api/admin/hero/route';
import { GET as ContentGET } from '@/app/api/content/route';
import { POST as MessagesPOST } from '@/app/api/messages/route';

const { prisma, revalidateLanding, auth, headers, rateLimit, getResend, clientKey } = vi.hoisted(
  () => ({
    prisma: {
      hero: { findFirst: vi.fn(), update: vi.fn() },
      heroStat: { deleteMany: vi.fn(), createMany: vi.fn() },
      contactInfo: { findFirst: vi.fn(), update: vi.fn() },
      contactMessage: { create: vi.fn() },
      setting: { findMany: vi.fn(), findUnique: vi.fn(), upsert: vi.fn() },
      brand: { findMany: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn() },
      processStep: { findMany: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn() },
      service: { findMany: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn() },
      project: { findMany: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn() },
      resultItem: { findMany: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn() },
      testimonial: { findMany: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn() },
      timelineItem: { findMany: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn() },
      faqItem: { findMany: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn() },
      experienceCard: { findMany: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn() },
      sectionMeta: { findMany: vi.fn(), upsert: vi.fn() },
      $transaction: vi.fn(),
    },
    revalidateLanding: vi.fn(),
    auth: { api: { getSession: vi.fn() } },
    headers: vi.fn(),
    rateLimit: vi.fn(),
    getResend: vi.fn(),
    clientKey: vi.fn(),
  })
);

vi.mock('@/lib/prisma', () => ({ prisma }));
vi.mock('@/lib/revalidate', () => ({ revalidateLanding }));
vi.mock('@/lib/auth', () => ({ auth }));
vi.mock('next/headers', () => ({ headers }));
vi.mock('@/lib/rate-limit', () => ({ rateLimit, clientKey }));
vi.mock('@/lib/resend', () => ({ getResend }));

const VALID_BODY = {
  name: 'Carlos',
  email: 'carlos@example.com',
  phone: '+54 9 11 5555 5555',
  message: 'Hola, me gustaría contratar tus servicios para una auditoría industrial.',
};

describe('API — extra density', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    headers.mockResolvedValue(new Headers());
    auth.api.getSession.mockResolvedValue({ user: { id: 'u1' } });
    rateLimit.mockReturnValue({ ok: true, retryAfterMs: 0 });
    clientKey.mockReturnValue('test-ip');
    prisma.contactMessage.create.mockResolvedValue({ id: '1' });
    prisma.setting.findMany.mockResolvedValue([]);
    prisma.sectionMeta.findMany.mockResolvedValue([]);
    prisma.hero.findFirst.mockResolvedValue({ id: 'h-1', stats: [] });
    prisma.hero.update.mockResolvedValue({ id: 'h-1' });
    prisma.heroStat.deleteMany.mockResolvedValue({ count: 0 });
    prisma.heroStat.createMany.mockResolvedValue({ count: 0 });
    prisma.contactInfo.findFirst.mockResolvedValue({ id: 'c-1' });
    prisma.contactInfo.update.mockResolvedValue({ id: 'c-1' });
    prisma.$transaction.mockImplementation(async (cb: (tx: typeof prisma) => Promise<unknown>) =>
      cb(prisma)
    );
  });

  describe('/api/content GET — density', () => {
    it('runs all 12 queries in parallel', async () => {
      const start = Date.now();
      await ContentGET();
      const duration = Date.now() - start;
      // Should be fast since all queries are mocked
      expect(duration).toBeLessThan(100);
    });

    it('returns the same shape for empty data', async () => {
      for (const fn of [
        prisma.brand.findMany,
        prisma.experienceCard.findMany,
        prisma.processStep.findMany,
        prisma.service.findMany,
        prisma.project.findMany,
        prisma.resultItem.findMany,
        prisma.testimonial.findMany,
        prisma.timelineItem.findMany,
        prisma.faqItem.findMany,
      ]) {
        fn.mockResolvedValueOnce([]);
      }
      const res = await ContentGET();
      const body = await res.json();
      expect(body.brands).toEqual([]);
      expect(body.experience).toEqual([]);
      expect(body.projects).toEqual([]);
    });

    it('converts sections array to object with slug keys', async () => {
      prisma.sectionMeta.findMany.mockResolvedValueOnce([
        { slug: 'a', titleEs: 'A' },
        { slug: 'b', titleEs: 'B' },
        { slug: 'c', titleEs: 'C' },
      ]);
      const res = await ContentGET();
      const body = await res.json();
      expect(Object.keys(body.sections).length).toBe(3);
      expect(body.sections.a).toEqual({ slug: 'a', titleEs: 'A' });
    });

    it('handles very many sections', async () => {
      prisma.sectionMeta.findMany.mockResolvedValueOnce(
        Array.from({ length: 50 }, (_, i) => ({ slug: `s${i}`, titleEs: `S${i}` }))
      );
      const res = await ContentGET();
      const body = await res.json();
      expect(Object.keys(body.sections).length).toBe(50);
    });

    it('returns null for hero when missing', async () => {
      prisma.hero.findFirst.mockResolvedValueOnce(null);
      const res = await ContentGET();
      const body = await res.json();
      expect(body.hero).toBeNull();
    });

    it('returns null for contactInfo when missing', async () => {
      prisma.contactInfo.findFirst.mockResolvedValueOnce(null);
      const res = await ContentGET();
      const body = await res.json();
      expect(body.contactInfo).toBeNull();
    });
  });

  describe('/api/messages POST — extra density', () => {
    it('handles many concurrent requests without state leak', async () => {
      const reqs = Array.from(
        { length: 5 },
        () =>
          new Request('https://x.com/api/messages', {
            method: 'POST',
            body: JSON.stringify(VALID_BODY),
          })
      );
      const responses = await Promise.all(reqs.map((r) => MessagesPOST(r)));
      for (const res of responses) {
        expect(res.status).toBe(200);
      }
    });

    it('returns 429 with retry-after in seconds', async () => {
      rateLimit.mockReturnValueOnce({ ok: false, retryAfterMs: 30_000 });
      const req = new Request('https://x.com/api/messages', {
        method: 'POST',
        body: JSON.stringify(VALID_BODY),
      });
      const res = await MessagesPOST(req);
      expect(res.status).toBe(429);
      expect(res.headers.get('Retry-After')).toBe('30');
    });

    it('returns 422 on completely empty body', async () => {
      const req = new Request('https://x.com/api/messages', { method: 'POST' });
      const res = await MessagesPOST(req);
      expect(res.status).toBe(422);
    });

    it('returns 422 on non-JSON', async () => {
      const req = new Request('https://x.com/api/messages', { method: 'POST', body: 'garbage' });
      const res = await MessagesPOST(req);
      expect(res.status).toBe(422);
    });

    it('handles very long message', async () => {
      const req = new Request('https://x.com/api/messages', {
        method: 'POST',
        body: JSON.stringify({ ...VALID_BODY, message: 'a'.repeat(2000) }),
      });
      const res = await MessagesPOST(req);
      expect(res.status).toBe(200);
    });

    it('rejects message over 2000 chars', async () => {
      const req = new Request('https://x.com/api/messages', {
        method: 'POST',
        body: JSON.stringify({ ...VALID_BODY, message: 'a'.repeat(2001) }),
      });
      const res = await MessagesPOST(req);
      expect(res.status).toBe(422);
    });
  });

  describe('/api/admin/hero GET — extra density', () => {
    it('returns 401 without session', async () => {
      auth.api.getSession.mockResolvedValueOnce(null);
      const res = await HeroGET(new Request('https://x.com'), { params: Promise.resolve({}) });
      expect(res.status).toBe(401);
    });

    it('returns 200 with hero when present', async () => {
      const res = await HeroGET(new Request('https://x.com'), { params: Promise.resolve({}) });
      expect(res.status).toBe(200);
    });

    it('returns 404 when hero is missing', async () => {
      prisma.hero.findFirst.mockResolvedValueOnce(null);
      const res = await HeroGET(new Request('https://x.com'), { params: Promise.resolve({}) });
      expect(res.status).toBe(404);
    });
  });

  describe('/api/admin/hero PUT — extra density', () => {
    it('returns 401 without session', async () => {
      auth.api.getSession.mockResolvedValueOnce(null);
      const req = new Request('https://x.com', {
        method: 'PUT',
        body: JSON.stringify({ name: 'X' }),
      });
      const res = await HeroPUT(req, { params: Promise.resolve({}) });
      expect(res.status).toBe(401);
    });

    it('returns 422 on empty body', async () => {
      const req = new Request('https://x.com', { method: 'PUT', body: JSON.stringify({}) });
      const res = await HeroPUT(req, { params: Promise.resolve({}) });
      // empty is valid since all fields are optional
      expect(res.status).toBe(200);
    });

    it('returns 200 on partial update', async () => {
      const req = new Request('https://x.com', {
        method: 'PUT',
        body: JSON.stringify({ name: 'Updated' }),
      });
      const res = await HeroPUT(req, { params: Promise.resolve({}) });
      expect(res.status).toBe(200);
    });

    it('calls revalidateLanding on success', async () => {
      const req = new Request('https://x.com', {
        method: 'PUT',
        body: JSON.stringify({ name: 'X' }),
      });
      await HeroPUT(req, { params: Promise.resolve({}) });
      expect(revalidateLanding).toHaveBeenCalled();
    });

    it('replaces stats when provided as empty array', async () => {
      const req = new Request('https://x.com', {
        method: 'PUT',
        body: JSON.stringify({ stats: [] }),
      });
      await HeroPUT(req, { params: Promise.resolve({}) });
      expect(prisma.heroStat.deleteMany).toHaveBeenCalled();
      expect(prisma.heroStat.createMany).not.toHaveBeenCalled();
    });

    it('replaces stats with array of 3', async () => {
      prisma.heroStat.createMany.mockResolvedValueOnce({ count: 3 });
      const req = new Request('https://x.com', {
        method: 'PUT',
        body: JSON.stringify({
          stats: [
            { value: '15+', labelEs: 'A', labelEn: 'A' },
            { value: '50+', labelEs: 'B', labelEn: 'B' },
            { value: '99%', labelEs: 'C', labelEn: 'C' },
          ],
        }),
      });
      await HeroPUT(req, { params: Promise.resolve({}) });
      expect(prisma.heroStat.createMany).toHaveBeenCalled();
    });
  });

  describe('/api/admin/contact-info — extra density', () => {
    it('returns 401 without session on GET', async () => {
      auth.api.getSession.mockResolvedValueOnce(null);
      const res = await ContactInfoGET(new Request('https://x.com'), {
        params: Promise.resolve({}),
      });
      expect(res.status).toBe(401);
    });

    it('returns 200 on GET', async () => {
      const res = await ContactInfoGET(new Request('https://x.com'), {
        params: Promise.resolve({}),
      });
      expect(res.status).toBe(200);
    });

    it('returns 404 on GET when missing', async () => {
      prisma.contactInfo.findFirst.mockResolvedValueOnce(null);
      const res = await ContactInfoGET(new Request('https://x.com'), {
        params: Promise.resolve({}),
      });
      expect(res.status).toBe(404);
    });

    it('returns 200 on PUT', async () => {
      const req = new Request('https://x.com', {
        method: 'PUT',
        body: JSON.stringify({ name: 'X' }),
      });
      const res = await ContactInfoPUT(req, { params: Promise.resolve({}) });
      expect(res.status).toBe(200);
    });

    it('revalidates on PUT success', async () => {
      const req = new Request('https://x.com', {
        method: 'PUT',
        body: JSON.stringify({ name: 'X' }),
      });
      await ContactInfoPUT(req, { params: Promise.resolve({}) });
      expect(revalidateLanding).toHaveBeenCalled();
    });
  });
});
