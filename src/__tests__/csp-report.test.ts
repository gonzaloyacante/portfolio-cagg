import { describe, expect, it, vi } from 'vitest';

import { GET, POST } from '@/app/api/csp-report/route';

describe('/api/csp-report', () => {
  describe('GET', () => {
    it('returns 405 with Allow: POST', async () => {
      const res = GET();
      expect(res.status).toBe(405);
      expect(res.headers.get('Allow')).toBe('POST');
    });
  });

  describe('POST — legacy csp-report format', () => {
    it('normalizes and accepts a legacy report', async () => {
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const req = new Request('https://example.com/api/csp-report', {
        method: 'POST',
        headers: { 'content-type': 'application/csp-report' },
        body: JSON.stringify({
          'csp-report': {
            'document-uri': 'https://cagg.vercel.app/es',
            'violated-directive': 'script-src',
            'blocked-uri': 'https://evil.example.com/x.js',
            'line-number': 42,
          },
        }),
      });

      const res = await POST(req as unknown as Parameters<typeof POST>[0]);
      expect(res.status).toBe(204);

      expect(errorSpy).toHaveBeenCalledOnce();
      const logged = errorSpy.mock.calls[0]?.[1] as string;
      const parsed = JSON.parse(logged);
      expect(parsed.documentUri).toBe('https://cagg.vercel.app/es');
      expect(parsed.violatedDirective).toBe('script-src');
      expect(parsed.blockedUri).toBe('https://evil.example.com/x.js');
      expect(parsed.lineNumber).toBe(42);

      errorSpy.mockRestore();
    });
  });

  describe('POST — Reporting API format (array)', () => {
    it('normalizes and accepts a reports+json array', async () => {
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const req = new Request('https://example.com/api/csp-report', {
        method: 'POST',
        headers: { 'content-type': 'application/reports+json' },
        body: JSON.stringify([
          {
            type: 'csp-violation',
            body: {
              documentURL: 'https://cagg.vercel.app/admin',
              effectiveDirective: 'connect-src',
              blockedURL: 'https://blocked.example.com/api',
            },
          },
        ]),
      });

      const res = await POST(req as unknown as Parameters<typeof POST>[0]);
      expect(res.status).toBe(204);

      expect(errorSpy).toHaveBeenCalledOnce();
      const logged = errorSpy.mock.calls[0]?.[1] as string;
      const parsed = JSON.parse(logged);
      expect(parsed.documentUri).toBe('https://cagg.vercel.app/admin');
      expect(parsed.effectiveDirective).toBe('connect-src');
      expect(parsed.blockedUri).toBe('https://blocked.example.com/api');

      errorSpy.mockRestore();
    });

    it('skips non-csp-violation reports in the array', async () => {
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const req = new Request('https://example.com/api/csp-report', {
        method: 'POST',
        body: JSON.stringify([{ type: 'deprecation', body: { id: 'foo' } }]),
      });

      const res = await POST(req as unknown as Parameters<typeof POST>[0]);
      expect(res.status).toBe(204);
      expect(errorSpy).not.toHaveBeenCalled();

      errorSpy.mockRestore();
    });
  });

  describe('POST — error handling', () => {
    it('returns 400 on invalid JSON', async () => {
      const req = new Request('https://example.com/api/csp-report', {
        method: 'POST',
        body: 'not json{',
      });
      const res = await POST(req as unknown as Parameters<typeof POST>[0]);
      expect(res.status).toBe(400);
    });

    it('returns 204 with no log on empty/unknown body', async () => {
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const req = new Request('https://example.com/api/csp-report', {
        method: 'POST',
        body: JSON.stringify({ unrelated: 'data' }),
      });
      const res = await POST(req as unknown as Parameters<typeof POST>[0]);
      expect(res.status).toBe(204);
      expect(errorSpy).not.toHaveBeenCalled();
      errorSpy.mockRestore();
    });
  });
});
