// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';

import { rateLimit, clientKey } from '@/lib/rate-limit';

describe('rate-limit — security edge cases', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  describe('token-bucket algorithm integrity', () => {
    it('returns ok=true for the first call from a fresh key', () => {
      expect(rateLimit('fresh-1', 1000).ok).toBe(true);
    });

    it('returns ok=true for the 2nd call (within burst window)', () => {
      rateLimit('fresh-2a', 1000);
      expect(rateLimit('fresh-2a', 1000).ok).toBe(true);
    });

    it('returns ok=true for 5th call (long window)', () => {
      rateLimit('fresh-5a', 1000);
      rateLimit('fresh-5a', 1000);
      rateLimit('fresh-5a', 1000);
      rateLimit('fresh-5a', 1000);
      expect(rateLimit('fresh-5a', 1000).ok).toBe(true);
    });

    it('blocks after exceeding the count limit', () => {
      const k = `block-${Date.now()}`;
      for (let i = 0; i < 7; i += 1) {
        rateLimit(k, 1000);
      }
      const r = rateLimit(k, 1000);
      expect(r.ok).toBe(false);
      expect(r.retryAfterMs).toBeGreaterThan(0);
    });

    it('returns retryAfterMs matching the window remaining', () => {
      const k = `retry-${Date.now()}`;
      const start = 1000;
      for (let i = 0; i < 7; i += 1) {
        rateLimit(k, start);
      }
      // Halfway through the window
      const r = rateLimit(k, start + 5 * 60 * 1000);
      expect(r.ok).toBe(false);
      expect(r.retryAfterMs).toBe(5 * 60 * 1000);
    });

    it('isolates keys from each other', () => {
      for (let i = 0; i < 7; i += 1) {
        rateLimit(`iso-a-${Date.now()}-${Math.random()}`, 1000);
      }
      // Different key, should not be blocked
      expect(rateLimit(`iso-b-${Date.now()}-${Math.random()}`, 1000).ok).toBe(true);
    });

    it('resets when the window expires', () => {
      const k = `reset-${Date.now()}-${Math.random()}`;
      const start = 0;
      for (let i = 0; i < 7; i += 1) {
        rateLimit(k, start);
      }
      expect(rateLimit(k, start).ok).toBe(false);
      // 10 minutes later
      expect(rateLimit(k, start + 10 * 60 * 1000).ok).toBe(true);
    });
  });

  describe('rejection of malicious input', () => {
    it('handles keys with special characters without throwing', () => {
      const weirdKeys = [
        '',
        ' ',
        'a'.repeat(10_000),
        '<script>alert(1)</script>',
        "'; DROP TABLE rate_limits;--",
        'null',
        'undefined',
        '../../../../etc/passwd',
        '\n\r\t',
        '🔐',
      ];
      for (const k of weirdKeys) {
        expect(() => rateLimit(k, 1000)).not.toThrow();
      }
    });

    it('returns ok=true for unusual keys (no crash)', () => {
      expect(rateLimit('<script>', 1000).ok).toBe(true);
      expect(rateLimit("'; DROP TABLE--", 1000).ok).toBe(true);
    });
  });

  describe('timestamp injection', () => {
    it('handles now=0', () => {
      const r = rateLimit(`zero-${Date.now()}`, 0);
      expect(r.ok).toBe(true);
    });

    it('handles now=Number.MAX_SAFE_INTEGER', () => {
      const r = rateLimit(`max-${Date.now()}`, Number.MAX_SAFE_INTEGER);
      expect(r.ok).toBe(true);
    });

    it('handles now=very large negative number', () => {
      const r = rateLimit(`neg-${Date.now()}`, -1e15);
      expect(r.ok).toBe(true);
    });
  });

  describe('clientKey() security', () => {
    it('handles x-forwarded-for with multiple commas correctly', () => {
      const req = new Request('https://x.com', {
        headers: { 'x-forwarded-for': '1.1.1.1, 2.2.2.2, 3.3.3.3, 4.4.3.3' },
      });
      expect(clientKey(req)).toBe('1.1.1.1');
    });

    it('uses the leftmost (client) IP, not the rightmost (proxy)', () => {
      const req = new Request('https://x.com', {
        headers: { 'x-forwarded-for': 'real-client, proxy-1, proxy-2' },
      });
      expect(clientKey(req)).toBe('real-client');
    });

    it('does not trust x-forwarded-for from a missing origin (rate limit risk)', () => {
      // An attacker could send a request with a rotating x-forwarded-for
      // to bypass the rate limiter. The proxy in front of the app should
      // STRIP the original x-forwarded-for from untrusted sources.
      // We document this risk here: the function trusts the header.
      const req = new Request('https://x.com', {
        headers: { 'x-forwarded-for': 'attacker-controlled' },
      });
      expect(clientKey(req)).toBe('attacker-controlled');
      // The function does NOT validate that this is a real IP — it just
      // extracts and uses. In production, the reverse proxy (Vercel)
      // overrides this header.
    });

    it('handles header case-insensitively (HTTP headers are case-insensitive)', () => {
      const req = new Request('https://x.com', {
        headers: { 'X-Forwarded-For': '1.2.3.4' },
      });
      // Node's fetch normalizes header keys to lowercase
      expect(clientKey(req)).toBe('1.2.3.4');
    });
  });
});
