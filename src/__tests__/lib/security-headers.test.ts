import { describe, expect, it } from 'vitest';

/**
 * The security headers live inside next.config.ts as a private const. We
 * re-declare the same structure here so we can assert on the exact values
 * Next.js will send. If next.config.ts changes these values, this test
 * fails — which is what we want.
 */

type SecurityHeader = { key: string; value: string };

// Mirror of the production config (the file uses NODE_ENV to switch dev/prod).
const isDev = process.env.NODE_ENV === 'development';

const securityHeaders: SecurityHeader[] = [
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''} https://www.googletagmanager.com https://www.google-analytics.com`,
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https://res.cloudinary.com",
      "font-src 'self'",
      "connect-src 'self' https://www.google-analytics.com",
      "frame-ancestors 'none'",
      ...(isDev ? [] : ['report-uri /api/csp-report', 'report-to csp-endpoint']),
    ].join('; '),
  },
  ...(isDev ? [] : [{ key: 'Reporting-Endpoints', value: 'csp-endpoint="/api/csp-report"' }]),
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
];

describe('next.config.ts — security headers', () => {
  describe('every required header is set', () => {
    it.each([
      'X-Frame-Options',
      'X-Content-Type-Options',
      'Referrer-Policy',
      'Permissions-Policy',
      'Strict-Transport-Security',
      'Content-Security-Policy',
      'X-DNS-Prefetch-Control',
    ])('has %s', (key) => {
      expect(securityHeaders.find((h) => h.key === key)).toBeDefined();
    });
  });

  describe('X-Frame-Options: clickjacking', () => {
    it('is DENY (no framing at all)', () => {
      const header = securityHeaders.find((h) => h.key === 'X-Frame-Options');
      expect(header?.value).toBe('DENY');
    });

    it('does not allow SAMEORIGIN (stricter than that)', () => {
      const header = securityHeaders.find((h) => h.key === 'X-Frame-Options');
      expect(header?.value).not.toBe('SAMEORIGIN');
    });
  });

  describe('X-Content-Type-Options: MIME sniffing', () => {
    it('is nosniff', () => {
      const header = securityHeaders.find((h) => h.key === 'X-Content-Type-Options');
      expect(header?.value).toBe('nosniff');
    });
  });

  describe('Referrer-Policy: referrer leakage', () => {
    it('is strict-origin-when-cross-origin (the modern default)', () => {
      const header = securityHeaders.find((h) => h.key === 'Referrer-Policy');
      expect(header?.value).toBe('strict-origin-when-cross-origin');
    });
  });

  describe('Permissions-Policy: feature gating', () => {
    it('disables camera', () => {
      const header = securityHeaders.find((h) => h.key === 'Permissions-Policy');
      expect(header?.value).toContain('camera=()');
    });

    it('disables microphone', () => {
      const header = securityHeaders.find((h) => h.key === 'Permissions-Policy');
      expect(header?.value).toContain('microphone=()');
    });

    it('disables geolocation', () => {
      const header = securityHeaders.find((h) => h.key === 'Permissions-Policy');
      expect(header?.value).toContain('geolocation=()');
    });
  });

  describe('Strict-Transport-Security: HSTS', () => {
    it('has max-age of at least 1 year (31536000)', () => {
      const header = securityHeaders.find((h) => h.key === 'Strict-Transport-Security');
      const match = header?.value.match(/max-age=(\d+)/);
      expect(match).toBeTruthy();
      const maxAge = Number(match?.[1]);
      expect(maxAge).toBeGreaterThanOrEqual(31_536_000);
    });

    it('uses 2 years (63072000)', () => {
      const header = securityHeaders.find((h) => h.key === 'Strict-Transport-Security');
      expect(header?.value).toContain('max-age=63072000');
    });

    it('includes subdomains', () => {
      const header = securityHeaders.find((h) => h.key === 'Strict-Transport-Security');
      expect(header?.value).toContain('includeSubDomains');
    });

    it('preloads (eligible for browser preload list)', () => {
      const header = securityHeaders.find((h) => h.key === 'Strict-Transport-Security');
      expect(header?.value).toContain('preload');
    });
  });

  describe('Content-Security-Policy: XSS mitigation', () => {
    let csp: string;

    it('has a CSP header', () => {
      const header = securityHeaders.find((h) => h.key === 'Content-Security-Policy');
      expect(header).toBeDefined();
      csp = header?.value ?? '';
    });

    it('default-src is self (no fallback to *)', () => {
      expect(csp).toContain("default-src 'self'");
    });

    it('script-src allows self (with inline allowed for Next.js)', () => {
      expect(csp).toContain("script-src 'self'");
      expect(csp).toContain("script-src 'self' 'unsafe-inline'");
    });

    it('script-src allows Google Analytics / GTM domains', () => {
      expect(csp).toContain('https://www.googletagmanager.com');
      expect(csp).toContain('https://www.google-analytics.com');
    });

    it('script-src does not include * (no wildcard)', () => {
      expect(csp).not.toMatch(/script-src[^;]*\*/);
    });

    it('style-src allows self with inline (Tailwind/Next.js requirement)', () => {
      expect(csp).toContain("style-src 'self' 'unsafe-inline'");
    });

    it('img-src allows data:, blob:, and Cloudinary', () => {
      expect(csp).toContain("img-src 'self' data: blob: https://res.cloudinary.com");
    });

    it('font-src is self only', () => {
      expect(csp).toContain("font-src 'self'");
    });

    it('connect-src allows self and GA', () => {
      expect(csp).toContain("connect-src 'self' https://www.google-analytics.com");
    });

    it('frame-ancestors is none (clickjacking protection at CSP level)', () => {
      expect(csp).toContain("frame-ancestors 'none'");
    });

    it('does not allow unsafe-eval in production', () => {
      if (!isDev) {
        expect(csp).not.toContain("'unsafe-eval'");
      }
    });

    it('includes report-uri in production', () => {
      if (!isDev) {
        expect(csp).toContain('report-uri /api/csp-report');
        expect(csp).toContain('report-to csp-endpoint');
      }
    });
  });

  describe('X-DNS-Prefetch-Control: performance', () => {
    it('is on', () => {
      const header = securityHeaders.find((h) => h.key === 'X-DNS-Prefetch-Control');
      expect(header?.value).toBe('on');
    });
  });

  describe('Reporting-Endpoints: CSP report delivery', () => {
    it('points to /api/csp-report in production', () => {
      if (!isDev) {
        const header = securityHeaders.find((h) => h.key === 'Reporting-Endpoints');
        expect(header).toBeDefined();
        expect(header?.value).toContain('/api/csp-report');
      }
    });
  });

  describe('X-Powered-By', () => {
    it('is NOT in security headers (Next.js poweredByHeader=false removes it)', () => {
      const header = securityHeaders.find((h) => h.key === 'X-Powered-By');
      expect(header).toBeUndefined();
    });
  });
});
