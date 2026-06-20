import { beforeEach, describe, expect, it, vi } from 'vitest';

import { PUT } from '@/app/api/admin/reorder/[slug]/route';

const { prisma, revalidateLanding, auth, headers } = vi.hoisted(() => ({
  prisma: {
    brand: { update: vi.fn() },
    experienceCard: { update: vi.fn() },
    processStep: { update: vi.fn() },
    service: { update: vi.fn() },
    project: { update: vi.fn() },
    resultItem: { update: vi.fn() },
    testimonial: { update: vi.fn() },
    timelineItem: { update: vi.fn() },
    faqItem: { update: vi.fn() },
  },
  revalidateLanding: vi.fn(),
  auth: { api: { getSession: vi.fn() } },
  headers: vi.fn(),
}));

vi.mock('@/lib/prisma', () => ({ prisma }));
vi.mock('@/lib/revalidate', () => ({ revalidateLanding }));
vi.mock('@/lib/auth', () => ({ auth }));
vi.mock('next/headers', () => ({ headers }));

// Map slug -> model key on prisma, since the route uses the model name
// (e.g. faqs slug maps to prisma.faqItem).
const SLUG_TO_MODEL: Record<string, keyof typeof prisma> = {
  brands: 'brand',
  experience: 'experienceCard',
  process: 'processStep',
  services: 'service',
  projects: 'project',
  results: 'resultItem',
  testimonials: 'testimonial',
  timeline: 'timelineItem',
  faqs: 'faqItem',
};
const SLUGS = Object.keys(SLUG_TO_MODEL);

describe('/api/admin/reorder/[slug] PUT', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    headers.mockResolvedValue(new Map());
    auth.api.getSession.mockResolvedValue({ user: { id: 'u1' } });
    prisma.brand.update.mockResolvedValue({ id: 'x' });
    prisma.experienceCard.update.mockResolvedValue({ id: 'x' });
    prisma.processStep.update.mockResolvedValue({ id: 'x' });
    prisma.service.update.mockResolvedValue({ id: 'x' });
    prisma.project.update.mockResolvedValue({ id: 'x' });
    prisma.resultItem.update.mockResolvedValue({ id: 'x' });
    prisma.testimonial.update.mockResolvedValue({ id: 'x' });
    prisma.timelineItem.update.mockResolvedValue({ id: 'x' });
    prisma.faqItem.update.mockResolvedValue({ id: 'x' });
  });

  it('returns 401 without session', async () => {
    auth.api.getSession.mockResolvedValueOnce(null);
    const req = new Request('https://x.com', {
      method: 'PUT',
      body: JSON.stringify({ ids: ['a'] }),
    });
    const res = await PUT(req, { params: Promise.resolve({ slug: 'brands' }) });
    expect(res.status).toBe(401);
  });

  it('returns 404 for unknown slug', async () => {
    const req = new Request('https://x.com', {
      method: 'PUT',
      body: JSON.stringify({ ids: ['a'] }),
    });
    const res = await PUT(req, { params: Promise.resolve({ slug: 'unknown' }) });
    expect(res.status).toBe(404);
  });

  it('returns 422 on empty ids array', async () => {
    const req = new Request('https://x.com', { method: 'PUT', body: JSON.stringify({ ids: [] }) });
    const res = await PUT(req, { params: Promise.resolve({ slug: 'brands' }) });
    expect(res.status).toBe(422);
  });

  it('returns 422 on non-array ids', async () => {
    const req = new Request('https://x.com', { method: 'PUT', body: JSON.stringify({ ids: 'a' }) });
    const res = await PUT(req, { params: Promise.resolve({ slug: 'brands' }) });
    expect(res.status).toBe(422);
  });

  it('returns 422 on non-string ids', async () => {
    const req = new Request('https://x.com', {
      method: 'PUT',
      body: JSON.stringify({ ids: [1, 2, 3] }),
    });
    const res = await PUT(req, { params: Promise.resolve({ slug: 'brands' }) });
    expect(res.status).toBe(422);
  });

  it('returns 422 on empty-string ids', async () => {
    const req = new Request('https://x.com', {
      method: 'PUT',
      body: JSON.stringify({ ids: [''] }),
    });
    const res = await PUT(req, { params: Promise.resolve({ slug: 'brands' }) });
    expect(res.status).toBe(422);
  });

  it('returns 422 on non-JSON body', async () => {
    const req = new Request('https://x.com', { method: 'PUT', body: 'nope' });
    const res = await PUT(req, { params: Promise.resolve({ slug: 'brands' }) });
    expect(res.status).toBe(422);
  });

  describe.each(SLUGS)('slug=%s', (slug) => {
    it('updates the order for each id', async () => {
      const req = new Request('https://x.com', {
        method: 'PUT',
        body: JSON.stringify({ ids: ['a', 'b', 'c'] }),
      });
      const res = await PUT(req, { params: Promise.resolve({ slug }) });
      expect(res.status).toBe(200);
    });

    it('assigns orders 0, 1, 2, ... based on array position', async () => {
      const req = new Request('https://x.com', {
        method: 'PUT',
        body: JSON.stringify({ ids: ['a', 'b', 'c'] }),
      });
      await PUT(req, { params: Promise.resolve({ slug }) });
      const modelKey = SLUG_TO_MODEL[slug];
      const updateMock = prisma[modelKey] as unknown as { update: ReturnType<typeof vi.fn> };
      const calls = updateMock.update.mock.calls;
      expect(calls.length).toBe(3);
      expect(calls[0]?.[0]).toEqual({ where: { id: 'a' }, data: { order: 0 } });
      expect(calls[1]?.[0]).toEqual({ where: { id: 'b' }, data: { order: 1 } });
      expect(calls[2]?.[0]).toEqual({ where: { id: 'c' }, data: { order: 2 } });
    });

    it('calls revalidateLanding after success', async () => {
      const req = new Request('https://x.com', {
        method: 'PUT',
        body: JSON.stringify({ ids: ['a'] }),
      });
      await PUT(req, { params: Promise.resolve({ slug }) });
      expect(revalidateLanding).toHaveBeenCalled();
    });

    it('returns 500 on update failure', async () => {
      const modelKey = SLUG_TO_MODEL[slug];
      (
        prisma[modelKey] as unknown as { update: ReturnType<typeof vi.fn> }
      ).update.mockRejectedValueOnce(new Error('db down'));
      const req = new Request('https://x.com', {
        method: 'PUT',
        body: JSON.stringify({ ids: ['a'] }),
      });
      const res = await PUT(req, { params: Promise.resolve({ slug }) });
      expect(res.status).toBe(500);
    });
  });
});
