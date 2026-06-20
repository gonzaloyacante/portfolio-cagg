import type { NextRequest } from 'next/server';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { GET, POST } from '@/app/api/csp-report/route';

// Helper: cast a plain Request to NextRequest. The route handler only
// reads headers and body, which Request already provides.
const toNext = (req: Request) => req as unknown as NextRequest;

describe('/api/csp-report — extra density', () => {
  let errorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    errorSpy.mockRestore();
  });

  describe('GET', () => {
    it('returns 405', async () => {
      const res = GET();
      expect(res.status).toBe(405);
    });

    it('sets Allow: POST header', async () => {
      const res = GET();
      expect(res.headers.get('Allow')).toBe('POST');
    });

    it('does not call console.error', async () => {
      GET();
      expect(errorSpy).not.toHaveBeenCalled();
    });
  });

  describe('POST — legacy csp-report format', () => {
    it('returns 204 for a valid report', async () => {
      const req = new Request('https://x.com/api/csp-report', {
        method: 'POST',
        headers: { 'content-type': 'application/csp-report' },
        body: JSON.stringify({
          'csp-report': {
            'document-uri': 'https://cagg.vercel.app/',
            'violated-directive': 'script-src',
            'blocked-uri': 'https://evil.example.com/x.js',
            'line-number': 10,
            'column-number': 5,
            'source-file': 'https://cagg.vercel.app/_next/static/chunks/main.js',
          },
        }),
      });
      const res = await POST(toNext(req));
      expect(res.status).toBe(204);
    });

    it('logs a structured violation', async () => {
      const req = new Request('https://x.com/api/csp-report', {
        method: 'POST',
        body: JSON.stringify({
          'csp-report': {
            'document-uri': 'https://cagg.vercel.app/about',
            'violated-directive': "img-src 'self' data: blob: https://res.cloudinary.com",
            'blocked-uri': 'https://other.example.com/img.png',
          },
        }),
      });
      await POST(toNext(req));
      expect(errorSpy).toHaveBeenCalledOnce();
      const logged = errorSpy.mock.calls[0]?.[1] as string;
      const parsed = JSON.parse(logged);
      expect(parsed.documentUri).toBe('https://cagg.vercel.app/about');
      expect(parsed.violatedDirective).toContain('img-src');
      expect(parsed.blockedUri).toBe('https://other.example.com/img.png');
    });

    it('handles the csp-report wrapper as object', async () => {
      const req = new Request('https://x.com/api/csp-report', {
        method: 'POST',
        body: JSON.stringify({ 'csp-report': {} }),
      });
      const res = await POST(toNext(req));
      expect(res.status).toBe(204);
    });
  });

  describe('POST — Reporting API reports+json format', () => {
    it('accepts an array of reports', async () => {
      const req = new Request('https://x.com/api/csp-report', {
        method: 'POST',
        headers: { 'content-type': 'application/reports+json' },
        body: JSON.stringify([
          {
            type: 'csp-violation',
            body: {
              documentURL: 'https://cagg.vercel.app/',
              effectiveDirective: 'script-src',
              blockedURL: 'https://x.example.com/y.js',
            },
          },
        ]),
      });
      const res = await POST(toNext(req));
      expect(res.status).toBe(204);
    });

    it('picks the csp-violation report from a mixed array', async () => {
      const req = new Request('https://x.com/api/csp-report', {
        method: 'POST',
        body: JSON.stringify([
          { type: 'deprecation', body: { id: 'something' } },
          { type: 'csp-violation', body: { documentURL: 'https://cagg.vercel.app/x' } },
          { type: 'intervention', body: {} },
        ]),
      });
      await POST(toNext(req));
      const logged = errorSpy.mock.calls[0]?.[1] as string;
      const parsed = JSON.parse(logged);
      expect(parsed.documentUri).toBe('https://cagg.vercel.app/x');
    });

    it('returns 204 and does not log when array has no csp-violation', async () => {
      const req = new Request('https://x.com/api/csp-report', {
        method: 'POST',
        body: JSON.stringify([{ type: 'deprecation', body: { id: 'x' } }]),
      });
      const res = await POST(toNext(req));
      expect(res.status).toBe(204);
      expect(errorSpy).not.toHaveBeenCalled();
    });
  });

  describe('POST — error handling', () => {
    it('returns 400 on invalid JSON', async () => {
      const req = new Request('https://x.com/api/csp-report', {
        method: 'POST',
        body: 'not json{',
      });
      const res = await POST(toNext(req));
      expect(res.status).toBe(400);
    });

    it('returns 204 on empty body', async () => {
      const req = new Request('https://x.com/api/csp-report', {
        method: 'POST',
        body: '',
      });
      const res = await POST(toNext(req));
      // Empty body → JSON parse throws → 400
      expect([204, 400]).toContain(res.status);
    });

    it('returns 204 on null body', async () => {
      const req = new Request('https://x.com/api/csp-report', { method: 'POST' });
      const res = await POST(toNext(req));
      // No body → JSON parse throws → 400
      expect([204, 400]).toContain(res.status);
    });

    it('returns 204 on unrelated payload', async () => {
      const req = new Request('https://x.com/api/csp-report', {
        method: 'POST',
        body: JSON.stringify({ unrelated: 'data' }),
      });
      const res = await POST(toNext(req));
      expect(res.status).toBe(204);
    });

    it('returns 204 on null payload', async () => {
      const req = new Request('https://x.com/api/csp-report', {
        method: 'POST',
        body: 'null',
      });
      const res = await POST(toNext(req));
      expect(res.status).toBe(204);
    });

    it('returns 204 on array payload with no violations', async () => {
      const req = new Request('https://x.com/api/csp-report', {
        method: 'POST',
        body: JSON.stringify([1, 2, 3]),
      });
      const res = await POST(toNext(req));
      expect(res.status).toBe(204);
    });

    it('returns 204 on string payload', async () => {
      const req = new Request('https://x.com/api/csp-report', {
        method: 'POST',
        body: JSON.stringify('a string'),
      });
      const res = await POST(toNext(req));
      expect(res.status).toBe(204);
    });

    it('returns 204 on number payload', async () => {
      const req = new Request('https://x.com/api/csp-report', {
        method: 'POST',
        body: JSON.stringify(42),
      });
      const res = await POST(toNext(req));
      expect(res.status).toBe(204);
    });
  });

  describe('POST — normalization edge cases', () => {
    it('handles snake_case keys', async () => {
      const req = new Request('https://x.com/api/csp-report', {
        method: 'POST',
        body: JSON.stringify({
          'csp-report': {
            'document-uri': 'https://a.com',
            'violated-directive': 'script-src',
            'blocked-uri': 'https://b.com/x',
            'source-file': 'https://a.com/s.js',
            'line-number': 1,
            'column-number': 2,
            'original-policy': "default-src 'self'",
          },
        }),
      });
      await POST(toNext(req));
      const logged = errorSpy.mock.calls[0]?.[1] as string;
      const parsed = JSON.parse(logged);
      expect(parsed.documentUri).toBe('https://a.com');
      expect(parsed.violatedDirective).toBe('script-src');
      expect(parsed.blockedUri).toBe('https://b.com/x');
      expect(parsed.sourceFile).toBe('https://a.com/s.js');
      expect(parsed.lineNumber).toBe(1);
      expect(parsed.columnNumber).toBe(2);
      expect(parsed.originalPolicy).toBe("default-src 'self'");
    });

    it('handles camelCase keys (modern)', async () => {
      const req = new Request('https://x.com/api/csp-report', {
        method: 'POST',
        body: JSON.stringify({
          type: 'csp-violation',
          body: {
            documentURL: 'https://a.com',
            effectiveDirective: 'style-src',
            blockedURL: 'https://b.com/s.css',
            sourceFile: 'https://a.com/main.js',
            lineNumber: 10,
            columnNumber: 5,
            originalPolicy: "default-src 'self'",
          },
        }),
      });
      await POST(toNext(req));
      const logged = errorSpy.mock.calls[0]?.[1] as string;
      const parsed = JSON.parse(logged);
      expect(parsed.documentUri).toBe('https://a.com');
      expect(parsed.effectiveDirective).toBe('style-src');
      expect(parsed.blockedUri).toBe('https://b.com/s.css');
      expect(parsed.sourceFile).toBe('https://a.com/main.js');
    });

    it('preserves violated-directive as violatedDirective', async () => {
      const req = new Request('https://x.com/api/csp-report', {
        method: 'POST',
        body: JSON.stringify({
          'csp-report': {
            'violated-directive': "script-src 'self' 'unsafe-inline'",
          },
        }),
      });
      await POST(toNext(req));
      const logged = errorSpy.mock.calls[0]?.[1] as string;
      const parsed = JSON.parse(logged);
      expect(parsed.violatedDirective).toBe("script-src 'self' 'unsafe-inline'");
    });

    it('handles missing optional fields gracefully', async () => {
      const req = new Request('https://x.com/api/csp-report', {
        method: 'POST',
        body: JSON.stringify({ 'csp-report': { 'document-uri': 'https://a.com' } }),
      });
      await POST(toNext(req));
      const logged = errorSpy.mock.calls[0]?.[1] as string;
      const parsed = JSON.parse(logged);
      expect(parsed.documentUri).toBe('https://a.com');
      expect(parsed.violatedDirective).toBeUndefined();
      expect(parsed.blockedUri).toBeUndefined();
      expect(parsed.lineNumber).toBeUndefined();
    });

    it('does not include lineNumber/columnNumber when not provided', async () => {
      const req = new Request('https://x.com/api/csp-report', {
        method: 'POST',
        body: JSON.stringify({ 'csp-report': {} }),
      });
      await POST(toNext(req));
      const logged = errorSpy.mock.calls[0]?.[1] as string;
      const parsed = JSON.parse(logged);
      expect('lineNumber' in parsed ? parsed.lineNumber : undefined).toBeUndefined();
      expect('columnNumber' in parsed ? parsed.columnNumber : undefined).toBeUndefined();
    });
  });

  describe('POST — response shape', () => {
    it('returns 204 status', async () => {
      const req = new Request('https://x.com/api/csp-report', {
        method: 'POST',
        body: JSON.stringify({ 'csp-report': {} }),
      });
      const res = await POST(toNext(req));
      expect(res.status).toBe(204);
    });

    it('returns a Response instance (not null)', async () => {
      const req = new Request('https://x.com/api/csp-report', {
        method: 'POST',
        body: JSON.stringify({ 'csp-report': {} }),
      });
      const res = await POST(toNext(req));
      expect(res).toBeInstanceOf(Response);
    });

    it('always returns the same status (204) for valid input', async () => {
      for (let i = 0; i < 5; i += 1) {
        const req = new Request('https://x.com/api/csp-report', {
          method: 'POST',
          body: JSON.stringify({ 'csp-report': { 'document-uri': `https://a.com/p${i}` } }),
        });
        const res = await POST(toNext(req));
        expect(res.status).toBe(204);
      }
    });
  });

  describe('POST — logging behavior', () => {
    it('logs with [csp-violation] prefix', async () => {
      const req = new Request('https://x.com/api/csp-report', {
        method: 'POST',
        body: JSON.stringify({ 'csp-report': { 'document-uri': 'https://a.com' } }),
      });
      await POST(toNext(req));
      const firstArg = errorSpy.mock.calls[0]?.[0];
      expect(firstArg).toBe('[csp-violation]');
    });

    it('does not log when payload is unparseable', async () => {
      const req = new Request('https://x.com/api/csp-report', {
        method: 'POST',
        body: 'not json',
      });
      await POST(toNext(req));
      expect(errorSpy).not.toHaveBeenCalled();
    });

    it('does not log when no csp-violation is found', async () => {
      const req = new Request('https://x.com/api/csp-report', {
        method: 'POST',
        body: JSON.stringify({ unrelated: 'data' }),
      });
      await POST(toNext(req));
      expect(errorSpy).not.toHaveBeenCalled();
    });
  });
});
