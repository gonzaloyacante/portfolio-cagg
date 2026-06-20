import { beforeEach, describe, expect, it, vi } from 'vitest';

import { DELETE, PUT } from '@/app/api/admin/brands/[id]/route';
import { GET, POST } from '@/app/api/admin/brands/route';
import { DELETE as FaqsDELETE, PUT as FaqsPUT } from '@/app/api/admin/faqs/[id]/route';
import { GET as FaqsGET, POST as FaqsPOST } from '@/app/api/admin/faqs/route';
import { DELETE as ProcessDELETE, PUT as ProcessPUT } from '@/app/api/admin/process/[id]/route';
import { GET as ProcessGET, POST as ProcessPOST } from '@/app/api/admin/process/route';
import { DELETE as ProjectsDELETE, PUT as ProjectsPUT } from '@/app/api/admin/projects/[id]/route';
import { GET as ProjectsGET, POST as ProjectsPOST } from '@/app/api/admin/projects/route';
import { DELETE as ResultsDELETE, PUT as ResultsPUT } from '@/app/api/admin/results/[id]/route';
import { GET as ResultsGET, POST as ResultsPOST } from '@/app/api/admin/results/route';
import { DELETE as ServicesDELETE, PUT as ServicesPUT } from '@/app/api/admin/services/[id]/route';
import { GET as ServicesGET, POST as ServicesPOST } from '@/app/api/admin/services/route';
import {
  DELETE as TestimonialsDELETE,
  PUT as TestimonialsPUT,
} from '@/app/api/admin/testimonials/[id]/route';
import {
  GET as TestimonialsGET,
  POST as TestimonialsPOST,
} from '@/app/api/admin/testimonials/route';
import { DELETE as TimelineDELETE, PUT as TimelinePUT } from '@/app/api/admin/timeline/[id]/route';
import { GET as TimelineGET, POST as TimelinePOST } from '@/app/api/admin/timeline/route';

const { prisma, revalidateLanding, auth, headers } = vi.hoisted(() => ({
  prisma: {
    brand: { findMany: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn() },
    processStep: { findMany: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn() },
    service: { findMany: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn() },
    project: { findMany: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn() },
    resultItem: { findMany: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn() },
    testimonial: { findMany: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn() },
    timelineItem: { findMany: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn() },
    faqItem: { findMany: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn() },
  },
  revalidateLanding: vi.fn(),
  auth: { api: { getSession: vi.fn() } },
  headers: vi.fn(),
}));

vi.mock('@/lib/prisma', () => ({ prisma }));
vi.mock('@/lib/revalidate', () => ({ revalidateLanding }));
vi.mock('@/lib/auth', () => ({ auth }));
vi.mock('next/headers', () => ({ headers }));

type CrudModule = {
  list: {
    GET: (req: Request, ctx: { params: Promise<Record<string, string>> }) => Promise<Response>;
  };
  item: {
    PUT: (req: Request, ctx: { params: Promise<{ id: string }> }) => Promise<Response>;
    DELETE: (req: Request, ctx: { params: Promise<{ id: string }> }) => Promise<Response>;
  };
  /**
   * POST accepts an optional Request. If omitted, the module builds
   * a Request from `validPayload` (used by the happy-path tests).
   * Tests that need to assert behavior on a different request shape
   * (e.g. missing body) can pass their own Request in. Keeping the
   * static POST handler at the call site (no dynamic import) keeps
   * Vite's `dynamic-import-vars` plugin happy.
   */
  POST: (req?: Request) => Promise<Response>;
  validPayload: Record<string, unknown>;
  model: keyof typeof prisma;
};

const COLLECTIONS: Record<string, CrudModule & { POST: () => Promise<Response> }> = {
  brands: {
    list: { GET },
    item: { PUT, DELETE },
    POST: async (req?: Request) => {
      const r =
        req ??
        new Request('https://x.com', {
          method: 'POST',
          body: JSON.stringify({ name: 'A' }),
        });
      return POST(r, { params: Promise.resolve({}) });
    },
    validPayload: { name: 'A' },
    model: 'brand',
  },
  process: {
    list: { GET: ProcessGET },
    item: { PUT: ProcessPUT, DELETE: ProcessDELETE },
    POST: async (req?: Request) => {
      const r =
        req ??
        new Request('https://x.com', {
          method: 'POST',
          body: JSON.stringify({
            code: '1',
            titleEs: 'a',
            titleEn: 'a',
            bodyEs: 'a',
            bodyEn: 'a',
            deliverableEs: 'a',
            deliverableEn: 'a',
          }),
        });
      return ProcessPOST(r, { params: Promise.resolve({}) });
    },
    validPayload: {
      code: '1',
      titleEs: 'a',
      titleEn: 'a',
      bodyEs: 'a',
      bodyEn: 'a',
      deliverableEs: 'a',
      deliverableEn: 'a',
    },
    model: 'processStep',
  },
  services: {
    list: { GET: ServicesGET },
    item: { PUT: ServicesPUT, DELETE: ServicesDELETE },
    POST: async (req?: Request) => {
      const r =
        req ??
        new Request('https://x.com', {
          method: 'POST',
          body: JSON.stringify({ labelEs: 'a', labelEn: 'a' }),
        });
      return ServicesPOST(r, { params: Promise.resolve({}) });
    },
    validPayload: { labelEs: 'a', labelEn: 'a' },
    model: 'service',
  },
  projects: {
    list: { GET: ProjectsGET },
    item: { PUT: ProjectsPUT, DELETE: ProjectsDELETE },
    POST: async (req?: Request) => {
      const r =
        req ??
        new Request('https://x.com', {
          method: 'POST',
          body: JSON.stringify({
            tag: 'a',
            periodEs: 'a',
            periodEn: 'a',
            titleEs: 'a',
            titleEn: 'a',
            challengeEs: 'a',
            challengeEn: 'a',
            interventionEs: 'a',
            interventionEn: 'a',
            outcomeEs: 'a',
            outcomeEn: 'a',
          }),
        });
      return ProjectsPOST(r, { params: Promise.resolve({}) });
    },
    validPayload: {
      tag: 'a',
      periodEs: 'a',
      periodEn: 'a',
      titleEs: 'a',
      titleEn: 'a',
      challengeEs: 'a',
      challengeEn: 'a',
      interventionEs: 'a',
      interventionEn: 'a',
      outcomeEs: 'a',
      outcomeEn: 'a',
    },
    model: 'project',
  },
  results: {
    list: { GET: ResultsGET },
    item: { PUT: ResultsPUT, DELETE: ResultsDELETE },
    POST: async (req?: Request) => {
      const r =
        req ??
        new Request('https://x.com', {
          method: 'POST',
          body: JSON.stringify({ kEs: 'a', kEn: 'a', vEs: 'a', vEn: 'a' }),
        });
      return ResultsPOST(r, { params: Promise.resolve({}) });
    },
    validPayload: { kEs: 'a', kEn: 'a', vEs: 'a', vEn: 'a' },
    model: 'resultItem',
  },
  testimonials: {
    list: { GET: TestimonialsGET },
    item: { PUT: TestimonialsPUT, DELETE: TestimonialsDELETE },
    POST: async (req?: Request) => {
      const r =
        req ??
        new Request('https://x.com', {
          method: 'POST',
          body: JSON.stringify({
            quoteEs: 'a',
            quoteEn: 'a',
            roleEs: 'a',
            roleEn: 'a',
            sectorEs: 'a',
            sectorEn: 'a',
          }),
        });
      return TestimonialsPOST(r, { params: Promise.resolve({}) });
    },
    validPayload: {
      quoteEs: 'a',
      quoteEn: 'a',
      roleEs: 'a',
      roleEn: 'a',
      sectorEs: 'a',
      sectorEn: 'a',
    },
    model: 'testimonial',
  },
  timeline: {
    list: { GET: TimelineGET },
    item: { PUT: TimelinePUT, DELETE: TimelineDELETE },
    POST: async (req?: Request) => {
      const r =
        req ??
        new Request('https://x.com', {
          method: 'POST',
          body: JSON.stringify({
            period: 'a',
            titleEs: 'a',
            titleEn: 'a',
            bodyEs: 'a',
            bodyEn: 'a',
          }),
        });
      return TimelinePOST(r, { params: Promise.resolve({}) });
    },
    validPayload: { period: 'a', titleEs: 'a', titleEn: 'a', bodyEs: 'a', bodyEn: 'a' },
    model: 'timelineItem',
  },
  faqs: {
    list: { GET: FaqsGET },
    item: { PUT: FaqsPUT, DELETE: FaqsDELETE },
    POST: async (req?: Request) => {
      const r =
        req ??
        new Request('https://x.com', {
          method: 'POST',
          body: JSON.stringify({ qEs: 'a', qEn: 'a', aEs: 'a', aEn: 'a' }),
        });
      return FaqsPOST(r, { params: Promise.resolve({}) });
    },
    validPayload: { qEs: 'a', qEn: 'a', aEs: 'a', aEn: 'a' },
    model: 'faqItem',
  },
};

const SLUGS = Object.keys(COLLECTIONS);

describe('Admin collection CRUD', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    headers.mockResolvedValue(new Map());
    auth.api.getSession.mockResolvedValue({ user: { id: 'u1' } });
    for (const slug of SLUGS) {
      const model = COLLECTIONS[slug].model;
      (
        prisma[model] as unknown as { findMany: ReturnType<typeof vi.fn> }
      ).findMany.mockResolvedValue([]);
      (prisma[model] as unknown as { create: ReturnType<typeof vi.fn> }).create.mockResolvedValue({
        id: 'x',
      });
      (prisma[model] as unknown as { update: ReturnType<typeof vi.fn> }).update.mockResolvedValue({
        id: 'x',
      });
      (prisma[model] as unknown as { delete: ReturnType<typeof vi.fn> }).delete.mockResolvedValue({
        id: 'x',
      });
    }
  });

  describe.each(SLUGS)('collection: %s', (slug) => {
    const coll = COLLECTIONS[slug];
    if (!coll) return;
    const model = prisma[coll.model] as unknown as {
      findMany: ReturnType<typeof vi.fn>;
      create: ReturnType<typeof vi.fn>;
      update: ReturnType<typeof vi.fn>;
      delete: ReturnType<typeof vi.fn>;
    };

    describe('list GET', () => {
      it('returns 401 without session', async () => {
        auth.api.getSession.mockResolvedValueOnce(null);
        const res = await coll.list.GET(new Request('https://x.com'), {
          params: Promise.resolve({}),
        });
        expect(res.status).toBe(401);
      });

      it('returns 200 with items ordered by order asc', async () => {
        const res = await coll.list.GET(new Request('https://x.com'), {
          params: Promise.resolve({}),
        });
        expect(res.status).toBe(200);
        expect(model.findMany).toHaveBeenCalledWith({ orderBy: { order: 'asc' } });
      });
    });

    describe('POST', () => {
      it('returns 401 without session', async () => {
        auth.api.getSession.mockResolvedValueOnce(null);
        const res = await coll.POST();
        expect(res.status).toBe(401);
      });

      it('returns 201 with valid payload', async () => {
        const res = await coll.POST();
        expect(res.status).toBe(201);
        expect(model.create).toHaveBeenCalled();
      });

      it('calls revalidateLanding after success', async () => {
        await coll.POST();
        expect(revalidateLanding).toHaveBeenCalled();
      });

      it('returns 422 on missing body', async () => {
        const req = new Request('https://x.com', { method: 'POST' });
        const res = await coll.POST(req);
        expect(res.status).toBe(422);
      });
    });

    describe('PUT [id]', () => {
      it('returns 401 without session', async () => {
        auth.api.getSession.mockResolvedValueOnce(null);
        const req = new Request('https://x.com', {
          method: 'PUT',
          body: JSON.stringify(coll.validPayload),
        });
        const res = await coll.item.PUT(req, { params: Promise.resolve({ id: 'x' }) });
        expect(res.status).toBe(401);
      });

      it('updates the item', async () => {
        const req = new Request('https://x.com', {
          method: 'PUT',
          body: JSON.stringify(coll.validPayload),
        });
        const res = await coll.item.PUT(req, { params: Promise.resolve({ id: 'x' }) });
        expect(res.status).toBe(200);
        expect(model.update).toHaveBeenCalled();
      });

      it('calls revalidateLanding after success', async () => {
        const req = new Request('https://x.com', {
          method: 'PUT',
          body: JSON.stringify(coll.validPayload),
        });
        await coll.item.PUT(req, { params: Promise.resolve({ id: 'x' }) });
        expect(revalidateLanding).toHaveBeenCalled();
      });

      it('returns 404 when not found', async () => {
        model.update.mockRejectedValueOnce(new Error('not found'));
        const req = new Request('https://x.com', {
          method: 'PUT',
          body: JSON.stringify(coll.validPayload),
        });
        const res = await coll.item.PUT(req, { params: Promise.resolve({ id: 'missing' }) });
        expect(res.status).toBe(404);
      });

      it('returns 422 on invalid body (wrong type for a field)', async () => {
        // For each collection, pick a real string field and send a number.
        // The .partial() wrapper keeps it optional, but the type check still
        // runs. Note: process doesn't have a single bilingual "name" but has
        // many bilingual fields; we use one of those.
        const badPayload: Record<string, unknown> = (() => {
          switch (slug) {
            case 'brands':
              return { name: 123 };
            case 'process':
              return { code: 123 };
            case 'services':
              return { labelEs: 123 };
            case 'projects':
              return { tag: 123 };
            case 'results':
              return { kEs: 123 };
            case 'testimonials':
              return { quoteEs: 123 };
            case 'timeline':
              return { period: 123 };
            case 'faqs':
              return { qEs: 123 };
            default:
              return { name: 123 };
          }
        })();
        const req = new Request('https://x.com', {
          method: 'PUT',
          body: JSON.stringify(badPayload),
        });
        const res = await coll.item.PUT(req, { params: Promise.resolve({ id: 'x' }) });
        expect(res.status).toBe(422);
      });
    });

    describe('DELETE [id]', () => {
      it('returns 401 without session', async () => {
        auth.api.getSession.mockResolvedValueOnce(null);
        const req = new Request('https://x.com', { method: 'DELETE' });
        const res = await coll.item.DELETE(req, { params: Promise.resolve({ id: 'x' }) });
        expect(res.status).toBe(401);
      });

      it('returns 204 on success', async () => {
        const req = new Request('https://x.com', { method: 'DELETE' });
        const res = await coll.item.DELETE(req, { params: Promise.resolve({ id: 'x' }) });
        expect(res.status).toBe(204);
      });

      it('calls revalidateLanding after success', async () => {
        const req = new Request('https://x.com', { method: 'DELETE' });
        await coll.item.DELETE(req, { params: Promise.resolve({ id: 'x' }) });
        expect(revalidateLanding).toHaveBeenCalled();
      });

      it('returns 404 when not found', async () => {
        model.delete.mockRejectedValueOnce(new Error('not found'));
        const req = new Request('https://x.com', { method: 'DELETE' });
        const res = await coll.item.DELETE(req, { params: Promise.resolve({ id: 'missing' }) });
        expect(res.status).toBe(404);
      });
    });
  });
});
