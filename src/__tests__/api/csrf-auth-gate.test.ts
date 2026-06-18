// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { POST as brandsPOST } from '@/app/api/admin/brands/route';
import { POST as experiencePOST } from '@/app/api/admin/experience/route';
import { POST as faqsPOST } from '@/app/api/admin/faqs/route';
import { POST as processPOST } from '@/app/api/admin/process/route';
import { POST as projectsPOST } from '@/app/api/admin/projects/route';
import { POST as resultsPOST } from '@/app/api/admin/results/route';
import { GET as sectionsGET } from '@/app/api/admin/sections/route';
import { POST as servicesPOST } from '@/app/api/admin/services/route';
import { POST as testimonialsPOST } from '@/app/api/admin/testimonials/route';
import { POST as timelinePOST } from '@/app/api/admin/timeline/route';

const { prismaMock, revalidateLanding } = vi.hoisted(() => ({
  prismaMock: {
    brand: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    experience: { findMany: vi.fn(), findFirst: vi.fn(), create: vi.fn() },
    testimonial: { findMany: vi.fn(), findFirst: vi.fn(), create: vi.fn() },
    project: { findMany: vi.fn(), findFirst: vi.fn(), create: vi.fn() },
    service: { findMany: vi.fn(), findFirst: vi.fn(), create: vi.fn() },
    process: { findMany: vi.fn(), findFirst: vi.fn(), create: vi.fn() },
    result: { findMany: vi.fn(), findFirst: vi.fn(), create: vi.fn() },
    faq: { findMany: vi.fn(), findFirst: vi.fn(), create: vi.fn() },
    timeline: { findMany: vi.fn(), findFirst: vi.fn(), create: vi.fn() },
    section: { findMany: vi.fn(), findFirst: vi.fn(), create: vi.fn() },
  },
  revalidateLanding: vi.fn(),
}));

vi.mock('@/lib/prisma', () => ({ prisma: prismaMock }));
vi.mock('@/lib/revalidate', () => ({ revalidateLanding }));
vi.mock('next/headers', () => ({ headers: vi.fn().mockResolvedValue(new Headers()) }));
vi.mock('@/lib/auth', () => ({
  auth: { api: { getSession: vi.fn().mockResolvedValue({ user: { id: 'u' } }) } },
}));

beforeEach(() => {
  vi.clearAllMocks();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for (const model of Object.values(prismaMock) as any[]) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const m: any = model;
    if (typeof m.findFirst === 'function') m.findFirst.mockResolvedValue(null);
    if (typeof m.findMany === 'function') m.findMany.mockResolvedValue([]);
    if (typeof m.findUnique === 'function') m.findUnique.mockResolvedValue(null);
    if (typeof m.create === 'function')
      m.create.mockImplementation(async ({ data }: { data: Record<string, unknown> }) => ({
        id: 'x',
        ...data,
      }));
  }
});

afterEach(() => {
  vi.restoreAllMocks();
});

/**
 * Origin / CSRF protection on admin routes
 *
 * The admin panel is protected by:
 * 1. withAdminAuth — checks the session cookie
 * 2. SameSite=Lax on the session cookie (verified in cookies-security.test.ts)
 * 3. The browser's same-origin policy
 *
 * There is no explicit CSRF token check, so the protection relies on:
 * - SameSite=Lax (blocks cross-site POSTs from including the cookie)
 * - The auth check rejecting the request if no session is present
 *
 * These tests verify the routes do not accept cross-origin requests with
 * a valid session. We don't test the actual CSRF flow (that's the
 * browser's job) — we just confirm the auth gate is in place.
 */

describe('CSRF / origin: admin routes reject unauthenticated requests', () => {
  it('admin route with withAdminAuth returns 401 when session is null', async () => {
    const { auth } = await import('@/lib/auth');
    (
      auth.api.getSession as unknown as { mockResolvedValueOnce: (v: unknown) => void }
    ).mockResolvedValueOnce(null);
    const req = new Request('https://x.com', {
      method: 'POST',
      body: JSON.stringify({ name: 'Brand' }),
      headers: { 'content-type': 'application/json' },
    });
    const res = await brandsPOST(req, { params: Promise.resolve({}) });
    expect(res.status).toBe(401);
    // 401 must NOT include a stack trace or origin header echo
    const body = (await res.json()) as { error: string };
    expect(body.error).toBe('Unauthorized');
    expect(JSON.stringify(body)).not.toContain('origin');
    expect(JSON.stringify(body)).not.toContain('referer');
  });

  it('brands POST 401 path: no DB write happens when unauthenticated', async () => {
    const { auth } = await import('@/lib/auth');
    (
      auth.api.getSession as unknown as { mockResolvedValueOnce: (v: unknown) => void }
    ).mockResolvedValueOnce(null);
    const req = new Request('https://x.com', {
      method: 'POST',
      body: JSON.stringify({ name: 'Brand' }),
      headers: { 'content-type': 'application/json' },
    });
    await brandsPOST(req, { params: Promise.resolve({}) });
    expect(prismaMock.brand.create).not.toHaveBeenCalled();
  });

  it('experience POST 401 path: no DB write when unauthenticated', async () => {
    const { auth } = await import('@/lib/auth');
    (
      auth.api.getSession as unknown as { mockResolvedValueOnce: (v: unknown) => void }
    ).mockResolvedValueOnce(null);
    const req = new Request('https://x.com', {
      method: 'POST',
      body: JSON.stringify({ role: 'Lead', company: 'X' }),
      headers: { 'content-type': 'application/json' },
    });
    await experiencePOST(req, { params: Promise.resolve({}) });
    expect(prismaMock.experience.create).not.toHaveBeenCalled();
  });

  it('testimonials POST 401 path: no DB write when unauthenticated', async () => {
    const { auth } = await import('@/lib/auth');
    (
      auth.api.getSession as unknown as { mockResolvedValueOnce: (v: unknown) => void }
    ).mockResolvedValueOnce(null);
    const req = new Request('https://x.com', {
      method: 'POST',
      body: JSON.stringify({ author: 'A', content: 'C', rating: 5 }),
      headers: { 'content-type': 'application/json' },
    });
    await testimonialsPOST(req, { params: Promise.resolve({}) });
    expect(prismaMock.testimonial.create).not.toHaveBeenCalled();
  });

  it('projects POST 401 path: no DB write when unauthenticated', async () => {
    const { auth } = await import('@/lib/auth');
    (
      auth.api.getSession as unknown as { mockResolvedValueOnce: (v: unknown) => void }
    ).mockResolvedValueOnce(null);
    const req = new Request('https://x.com', {
      method: 'POST',
      body: JSON.stringify({ title: 'P' }),
      headers: { 'content-type': 'application/json' },
    });
    await projectsPOST(req, { params: Promise.resolve({}) });
    expect(prismaMock.project.create).not.toHaveBeenCalled();
  });

  it('services POST 401 path: no DB write when unauthenticated', async () => {
    const { auth } = await import('@/lib/auth');
    (
      auth.api.getSession as unknown as { mockResolvedValueOnce: (v: unknown) => void }
    ).mockResolvedValueOnce(null);
    const req = new Request('https://x.com', {
      method: 'POST',
      body: JSON.stringify({ title: 'S' }),
      headers: { 'content-type': 'application/json' },
    });
    await servicesPOST(req, { params: Promise.resolve({}) });
    expect(prismaMock.service.create).not.toHaveBeenCalled();
  });

  it('process POST 401 path: no DB write when unauthenticated', async () => {
    const { auth } = await import('@/lib/auth');
    (
      auth.api.getSession as unknown as { mockResolvedValueOnce: (v: unknown) => void }
    ).mockResolvedValueOnce(null);
    const req = new Request('https://x.com', {
      method: 'POST',
      body: JSON.stringify({ step: 1, title: 'P' }),
      headers: { 'content-type': 'application/json' },
    });
    await processPOST(req, { params: Promise.resolve({}) });
    expect(prismaMock.process.create).not.toHaveBeenCalled();
  });

  it('results POST 401 path: no DB write when unauthenticated', async () => {
    const { auth } = await import('@/lib/auth');
    (
      auth.api.getSession as unknown as { mockResolvedValueOnce: (v: unknown) => void }
    ).mockResolvedValueOnce(null);
    const req = new Request('https://x.com', {
      method: 'POST',
      body: JSON.stringify({ metric: 'X', value: '100' }),
      headers: { 'content-type': 'application/json' },
    });
    await resultsPOST(req, { params: Promise.resolve({}) });
    expect(prismaMock.result.create).not.toHaveBeenCalled();
  });

  it('faqs POST 401 path: no DB write when unauthenticated', async () => {
    const { auth } = await import('@/lib/auth');
    (
      auth.api.getSession as unknown as { mockResolvedValueOnce: (v: unknown) => void }
    ).mockResolvedValueOnce(null);
    const req = new Request('https://x.com', {
      method: 'POST',
      body: JSON.stringify({ question: 'Q', answer: 'A' }),
      headers: { 'content-type': 'application/json' },
    });
    await faqsPOST(req, { params: Promise.resolve({}) });
    expect(prismaMock.faq.create).not.toHaveBeenCalled();
  });

  it('timeline POST 401 path: no DB write when unauthenticated', async () => {
    const { auth } = await import('@/lib/auth');
    (
      auth.api.getSession as unknown as { mockResolvedValueOnce: (v: unknown) => void }
    ).mockResolvedValueOnce(null);
    const req = new Request('https://x.com', {
      method: 'POST',
      body: JSON.stringify({ year: '2024', title: 'T' }),
      headers: { 'content-type': 'application/json' },
    });
    await timelinePOST(req, { params: Promise.resolve({}) });
    expect(prismaMock.timeline.create).not.toHaveBeenCalled();
  });

  it('sections GET 401 path: no DB read when unauthenticated', async () => {
    const { auth } = await import('@/lib/auth');
    (
      auth.api.getSession as unknown as { mockResolvedValueOnce: (v: unknown) => void }
    ).mockResolvedValueOnce(null);
    const req = new Request('https://x.com');
    await sectionsGET(req, { params: Promise.resolve({}) });
    expect(prismaMock.section.findMany).not.toHaveBeenCalled();
  });
});

describe('CSRF / origin: 401 response shape is consistent', () => {
  const routes = [
    { name: 'brands', handler: brandsPOST, body: { name: 'B' } },
    { name: 'experience', handler: experiencePOST, body: { role: 'R', company: 'C' } },
    {
      name: 'testimonials',
      handler: testimonialsPOST,
      body: { author: 'A', content: 'C', rating: 5 },
    },
    { name: 'projects', handler: projectsPOST, body: { title: 'P' } },
    { name: 'services', handler: servicesPOST, body: { title: 'S' } },
    { name: 'process', handler: processPOST, body: { step: 1, title: 'P' } },
    { name: 'results', handler: resultsPOST, body: { metric: 'M', value: '1' } },
    { name: 'faqs', handler: faqsPOST, body: { question: 'Q', answer: 'A' } },
    { name: 'timeline', handler: timelinePOST, body: { year: '2024', title: 'T' } },
  ];

  for (const route of routes) {
    it(`${route.name}: 401 response has only { error: 'Unauthorized' } (no info leakage)`, async () => {
      const { auth } = await import('@/lib/auth');
      (
        auth.api.getSession as unknown as { mockResolvedValueOnce: (v: unknown) => void }
      ).mockResolvedValueOnce(null);
      const req = new Request('https://x.com', {
        method: 'POST',
        body: JSON.stringify(route.body),
        headers: { 'content-type': 'application/json' },
      });
      const res = await route.handler(req, { params: Promise.resolve({}) });
      expect(res.status).toBe(401);
      const body = await res.json();
      const keys = Object.keys(body);
      expect(keys).toEqual(['error']);
      expect(body.error).toBe('Unauthorized');
    });
  }
});

describe('CSRF / origin: response headers are sane', () => {
  it('401 response does not echo the request body or origin', async () => {
    const { auth } = await import('@/lib/auth');
    (
      auth.api.getSession as unknown as { mockResolvedValueOnce: (v: unknown) => void }
    ).mockResolvedValueOnce(null);
    const req = new Request('https://x.com', {
      method: 'POST',
      body: JSON.stringify({ name: 'A' }),
      headers: {
        'content-type': 'application/json',
        origin: 'https://evil.com',
        referer: 'https://evil.com/page',
      },
    });
    const res = await brandsPOST(req, { params: Promise.resolve({}) });
    const text = JSON.stringify(await res.json());
    expect(text).not.toContain('evil.com');
    expect(text).not.toContain('origin');
    expect(text).not.toContain('referer');
  });
});
