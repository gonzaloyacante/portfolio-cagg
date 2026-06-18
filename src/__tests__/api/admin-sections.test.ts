import { beforeEach, describe, expect, it, vi } from 'vitest';

import { PUT as UpdateSection } from '@/app/api/admin/sections/[slug]/route';
import { GET } from '@/app/api/admin/sections/route';

const { prisma, revalidateLanding, auth, headers } = vi.hoisted(() => ({
  prisma: {
    sectionMeta: { findMany: vi.fn(), upsert: vi.fn() },
  },
  revalidateLanding: vi.fn(),
  auth: { api: { getSession: vi.fn() } },
  headers: vi.fn(),
}));

vi.mock('@/lib/prisma', () => ({ prisma }));
vi.mock('@/lib/revalidate', () => ({ revalidateLanding }));
vi.mock('@/lib/auth', () => ({ auth }));
vi.mock('next/headers', () => ({ headers }));

describe('/api/admin/sections', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    headers.mockResolvedValue(new Map());
    auth.api.getSession.mockResolvedValue({ user: { id: 'u1' } });
    prisma.sectionMeta.findMany.mockResolvedValue([{ slug: 'hero' }, { slug: 'services' }]);
  });

  describe('GET', () => {
    it('returns 401 without session', async () => {
      auth.api.getSession.mockResolvedValueOnce(null);
      const res = await GET(new Request('https://x.com'), { params: Promise.resolve({}) });
      expect(res.status).toBe(401);
    });

    it('returns 200 with sections ordered by slug', async () => {
      const res = await GET(new Request('https://x.com'), { params: Promise.resolve({}) });
      expect(res.status).toBe(200);
      expect(prisma.sectionMeta.findMany).toHaveBeenCalledWith({ orderBy: { slug: 'asc' } });
    });

    it('returns the array of sections', async () => {
      const res = await GET(new Request('https://x.com'), { params: Promise.resolve({}) });
      const body = await res.json();
      expect(Array.isArray(body)).toBe(true);
    });
  });
});

describe('/api/admin/sections/[slug] PUT', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    headers.mockResolvedValue(new Map());
    auth.api.getSession.mockResolvedValue({ user: { id: 'u1' } });
  });

  const makeReq = (body: unknown) =>
    new Request('https://x.com', {
      method: 'PUT',
      body: typeof body === 'string' ? body : JSON.stringify(body),
    });

  it('returns 401 without session', async () => {
    auth.api.getSession.mockResolvedValueOnce(null);
    const res = await UpdateSection(makeReq({}), { params: Promise.resolve({ slug: 'hero' }) });
    expect(res.status).toBe(401);
  });

  it('upserts the section', async () => {
    prisma.sectionMeta.upsert.mockResolvedValue({ id: '1', slug: 'hero', titleEs: 'Hero' });
    const res = await UpdateSection(makeReq({ titleEs: 'Hero' }), {
      params: Promise.resolve({ slug: 'hero' }),
    });
    expect(res.status).toBe(200);
    expect(prisma.sectionMeta.upsert).toHaveBeenCalledWith({
      where: { slug: 'hero' },
      create: { slug: 'hero', titleEs: 'Hero' },
      update: { titleEs: 'Hero' },
    });
  });

  it('calls revalidateLanding after success', async () => {
    prisma.sectionMeta.upsert.mockResolvedValue({ id: '1', slug: 'hero' });
    await UpdateSection(makeReq({ titleEs: 'Hero' }), {
      params: Promise.resolve({ slug: 'hero' }),
    });
    expect(revalidateLanding).toHaveBeenCalledOnce();
  });

  it('accepts all fields together', async () => {
    prisma.sectionMeta.upsert.mockResolvedValue({ id: '1', slug: 'hero' });
    const body = {
      overlineEs: 'Eyebrow',
      overlineEn: 'Eyebrow EN',
      titleEs: 'Hero',
      titleEn: 'Hero',
      descEs: 'Description',
      descEn: 'Description',
    };
    await UpdateSection(makeReq(body), { params: Promise.resolve({ slug: 'hero' }) });
    expect(prisma.sectionMeta.upsert).toHaveBeenCalledWith({
      where: { slug: 'hero' },
      create: { slug: 'hero', ...body },
      update: body,
    });
  });

  it('accepts each field as null', async () => {
    prisma.sectionMeta.upsert.mockResolvedValue({ id: '1', slug: 'hero' });
    const body = {
      overlineEs: null,
      overlineEn: null,
      titleEs: null,
      titleEn: null,
      descEs: null,
      descEn: null,
    };
    const res = await UpdateSection(makeReq(body), { params: Promise.resolve({ slug: 'hero' }) });
    expect(res.status).toBe(200);
  });

  it('accepts empty body', async () => {
    prisma.sectionMeta.upsert.mockResolvedValue({ id: '1', slug: 'hero' });
    const res = await UpdateSection(makeReq({}), { params: Promise.resolve({ slug: 'hero' }) });
    expect(res.status).toBe(200);
  });

  it('returns 422 on non-JSON body', async () => {
    const res = await UpdateSection(makeReq('not json'), {
      params: Promise.resolve({ slug: 'hero' }),
    });
    expect(res.status).toBe(422);
  });
});
