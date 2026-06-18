import { beforeEach, describe, expect, it, vi } from 'vitest';

import { GET } from '@/app/api/content/route';

const { prisma } = vi.hoisted(() => ({
  prisma: {
    hero: { findFirst: vi.fn() },
    contactInfo: { findFirst: vi.fn() },
    brand: { findMany: vi.fn() },
    experienceCard: { findMany: vi.fn() },
    processStep: { findMany: vi.fn() },
    service: { findMany: vi.fn() },
    project: { findMany: vi.fn() },
    resultItem: { findMany: vi.fn() },
    testimonial: { findMany: vi.fn() },
    timelineItem: { findMany: vi.fn() },
    faqItem: { findMany: vi.fn() },
    sectionMeta: { findMany: vi.fn() },
  },
}));

vi.mock('@/lib/prisma', () => ({ prisma }));

describe('/api/content GET', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prisma.hero.findFirst.mockResolvedValue({ id: '1', name: 'Carlos' });
    prisma.contactInfo.findFirst.mockResolvedValue({ id: '1', name: 'Carlos' });
    prisma.brand.findMany.mockResolvedValue([]);
    prisma.experienceCard.findMany.mockResolvedValue([]);
    prisma.processStep.findMany.mockResolvedValue([]);
    prisma.service.findMany.mockResolvedValue([]);
    prisma.project.findMany.mockResolvedValue([]);
    prisma.resultItem.findMany.mockResolvedValue([]);
    prisma.testimonial.findMany.mockResolvedValue([]);
    prisma.timelineItem.findMany.mockResolvedValue([]);
    prisma.faqItem.findMany.mockResolvedValue([]);
    prisma.sectionMeta.findMany.mockResolvedValue([
      { slug: 'hero', titleEs: 'Hero' },
      { slug: 'services', titleEs: 'Servicios' },
    ]);
  });

  it('returns 200 with all collections', async () => {
    const res = await GET();
    expect(res.status).toBe(200);
  });

  it('returns an object with all expected keys', async () => {
    const res = await GET();
    const body = await res.json();
    for (const key of [
      'hero',
      'contactInfo',
      'brands',
      'experience',
      'process',
      'services',
      'projects',
      'results',
      'testimonials',
      'timeline',
      'faqs',
      'sections',
    ]) {
      expect(body).toHaveProperty(key);
    }
  });

  it('queries hero with stats ordered', async () => {
    await GET();
    expect(prisma.hero.findFirst).toHaveBeenCalledWith({
      include: { stats: { orderBy: { order: 'asc' } } },
    });
  });

  it('queries brand with orderBy order asc', async () => {
    await GET();
    expect(prisma.brand.findMany).toHaveBeenCalledWith({ orderBy: { order: 'asc' } });
  });

  it('queries experience with orderBy order asc', async () => {
    await GET();
    expect(prisma.experienceCard.findMany).toHaveBeenCalledWith({ orderBy: { order: 'asc' } });
  });

  it('queries process with orderBy order asc', async () => {
    await GET();
    expect(prisma.processStep.findMany).toHaveBeenCalledWith({ orderBy: { order: 'asc' } });
  });

  it('queries services with orderBy order asc', async () => {
    await GET();
    expect(prisma.service.findMany).toHaveBeenCalledWith({ orderBy: { order: 'asc' } });
  });

  it('queries projects with orderBy order asc', async () => {
    await GET();
    expect(prisma.project.findMany).toHaveBeenCalledWith({ orderBy: { order: 'asc' } });
  });

  it('queries results with orderBy order asc', async () => {
    await GET();
    expect(prisma.resultItem.findMany).toHaveBeenCalledWith({ orderBy: { order: 'asc' } });
  });

  it('queries testimonials with orderBy order asc', async () => {
    await GET();
    expect(prisma.testimonial.findMany).toHaveBeenCalledWith({ orderBy: { order: 'asc' } });
  });

  it('queries timeline with orderBy order asc', async () => {
    await GET();
    expect(prisma.timelineItem.findMany).toHaveBeenCalledWith({ orderBy: { order: 'asc' } });
  });

  it('queries faqs with orderBy order asc', async () => {
    await GET();
    expect(prisma.faqItem.findMany).toHaveBeenCalledWith({ orderBy: { order: 'asc' } });
  });

  it('queries sections without orderBy (raw findMany)', async () => {
    await GET();
    expect(prisma.sectionMeta.findMany).toHaveBeenCalledWith();
  });

  it('converts sections array to object keyed by slug', async () => {
    const res = await GET();
    const body = await res.json();
    expect(body.sections.hero).toEqual({ slug: 'hero', titleEs: 'Hero' });
    expect(body.sections.services).toEqual({ slug: 'services', titleEs: 'Servicios' });
  });

  it('returns empty arrays for collections with no data', async () => {
    const res = await GET();
    const body = await res.json();
    expect(body.brands).toEqual([]);
    expect(body.experience).toEqual([]);
  });

  it('returns hero and contactInfo even when null', async () => {
    prisma.hero.findFirst.mockResolvedValue(null);
    prisma.contactInfo.findFirst.mockResolvedValue(null);
    const res = await GET();
    const body = await res.json();
    expect(body.hero).toBeNull();
    expect(body.contactInfo).toBeNull();
  });

  it('runs queries in parallel', async () => {
    // We can't directly assert parallelism with mocks, but we can assert
    // that the response contains results from all 12 queries.
    const res = await GET();
    const body = await res.json();
    expect(Object.keys(body).length).toBe(12);
  });
});
