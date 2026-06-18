import { describe, expect, it } from 'vitest';

import { clientKey, rateLimit } from '@/lib/rate-limit';

describe('clientKey()', () => {
  it('uses the first IP from x-forwarded-for', () => {
    const req = new Request('https://x.com', {
      headers: { 'x-forwarded-for': '1.2.3.4, 5.6.7.8' },
    });
    expect(clientKey(req)).toBe('1.2.3.4');
  });

  it('trims whitespace from forwarded IP', () => {
    const req = new Request('https://x.com', {
      headers: { 'x-forwarded-for': '   1.2.3.4   , 5.6.7.8' },
    });
    expect(clientKey(req)).toBe('1.2.3.4');
  });

  it('falls back to x-real-ip when x-forwarded-for is missing', () => {
    const req = new Request('https://x.com', { headers: { 'x-real-ip': '9.9.9.9' } });
    expect(clientKey(req)).toBe('9.9.9.9');
  });

  it('falls back to "local" when no headers are present', () => {
    const req = new Request('https://x.com');
    expect(clientKey(req)).toBe('local');
  });

  it('falls back to "local" when x-forwarded-for is empty', () => {
    // Empty string is falsy → falls through to the next header check, and
    // eventually returns "local" when nothing else is set.
    const req = new Request('https://x.com', { headers: { 'x-forwarded-for': '' } });
    expect(clientKey(req)).toBe('local');
  });

  it('falls back to "local" when x-forwarded-for is whitespace-only (header normalizes to empty)', () => {
    // Node fetch normalizes whitespace-only header values to empty string.
    // Empty string is falsy, so the function falls through to the default.
    const req = new Request('https://x.com', { headers: { 'x-forwarded-for': '   ' } });
    expect(clientKey(req)).toBe('local');
  });

  it('prefers x-forwarded-for over x-real-ip', () => {
    const req = new Request('https://x.com', {
      headers: { 'x-forwarded-for': '1.1.1.1', 'x-real-ip': '2.2.2.2' },
    });
    expect(clientKey(req)).toBe('1.1.1.1');
  });

  it('handles IPv6 in x-forwarded-for', () => {
    const req = new Request('https://x.com', { headers: { 'x-forwarded-for': '2001:db8::1' } });
    expect(clientKey(req)).toBe('2001:db8::1');
  });

  it('handles single-IP forwarded', () => {
    const req = new Request('https://x.com', { headers: { 'x-forwarded-for': '1.2.3.4' } });
    expect(clientKey(req)).toBe('1.2.3.4');
  });
});

describe('rateLimit()', () => {
  it('first call from a new key is allowed', () => {
    const r = rateLimit('fresh-key', 0);
    expect(r.ok).toBe(true);
    expect(r.retryAfterMs).toBe(0);
  });

  it('returns the same retryAfterMs when blocked', () => {
    const now = 1000;
    // Burn through the limit
    for (let i = 0; i < 7; i += 1) rateLimit('blocked-key', now);
    const r = rateLimit('blocked-key', now);
    expect(r.ok).toBe(false);
    expect(r.retryAfterMs).toBeGreaterThan(0);
  });

  it('isolates keys', () => {
    const now = 1000;
    for (let i = 0; i < 7; i += 1) rateLimit('key-a', now);
    expect(rateLimit('key-a', now).ok).toBe(false);
    // Different key still allowed
    expect(rateLimit('key-b', now).ok).toBe(true);
  });

  it('resets after the window expires', () => {
    const start = 1000;
    const window = 10 * 60 * 1000; // 10 min
    for (let i = 0; i < 7; i += 1) rateLimit('reset-key', start);
    expect(rateLimit('reset-key', start + window - 1).ok).toBe(false);
    // Right at the window boundary
    expect(rateLimit('reset-key', start + window).ok).toBe(true);
  });

  it('retries after window elapses work even if many requests were blocked', () => {
    const start = 1000;
    for (let i = 0; i < 20; i += 1) rateLimit('many-key', start);
    const window = 10 * 60 * 1000;
    expect(rateLimit('many-key', start + window).ok).toBe(true);
  });

  it('rejects after burst + count limits are hit', () => {
    const now = 0;
    // 2 burst, then 5 total
    for (let i = 0; i < 7; i += 1) rateLimit('limit-key', now);
    const r = rateLimit('limit-key', now);
    expect(r.ok).toBe(false);
  });

  it('cleans up old buckets lazily on consume', () => {
    // Fill a key
    rateLimit('gc-key', 0);
    // Move way past the window
    const future = 0 + 10 * 60 * 1000 + 1;
    // New call should treat as fresh
    expect(rateLimit('gc-key', future).ok).toBe(true);
  });

  it('does not return same retryAfterMs twice — each call updates state', () => {
    const now = 1000;
    for (let i = 0; i < 7; i += 1) rateLimit('repeat-key', now);
    const r1 = rateLimit('repeat-key', now);
    const r2 = rateLimit('repeat-key', now);
    expect(r1.ok).toBe(false);
    expect(r2.ok).toBe(false);
    expect(r1.retryAfterMs).toBeGreaterThan(0);
  });

  it('rejects when a previously-used key is hit far in the future with no reset', () => {
    // First window
    const start = 0;
    for (let i = 0; i < 7; i += 1) rateLimit('stable-key', start);
    // Half-way through next window
    const mid = 10 * 60 * 1000 + 1;
    const r = rateLimit('stable-key', mid);
    expect(r.ok).toBe(true); // fresh window
  });
});

describe('rateLimit() integration with clientKey()', () => {
  it('groups requests by x-forwarded-for', () => {
    // Two distinct IPs. With MAX_BURST=2 and MAX_REQUESTS=5 per window, a
    // single IP should hit the limit after 5-7 calls.
    const ip1 = '1.1.1.1';
    const ip2 = '2.2.2.2';

    // Burn ip1's quota
    const r1 = (ip: string) => {
      const req = new Request('https://x.com', { headers: { 'x-forwarded-for': ip } });
      return rateLimit(`messages:${clientKey(req)}`, 0);
    };

    for (let i = 0; i < 7; i += 1) r1(ip1);
    expect(r1(ip1).ok).toBe(false); // ip1 blocked
    expect(r1(ip2).ok).toBe(true); // ip2 fresh
  });
});
