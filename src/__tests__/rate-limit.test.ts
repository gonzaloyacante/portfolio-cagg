import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { clientKey, rateLimit } from '@/lib/rate-limit';

describe('rateLimit', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('allows the first request', () => {
    const r = rateLimit('ip-a', 0);
    expect(r.ok).toBe(true);
    expect(r.retryAfterMs).toBe(0);
  });

  it('allows a burst of 2 within the window', () => {
    rateLimit('ip-b', 0);
    const r = rateLimit('ip-b', 1000);
    expect(r.ok).toBe(true);
  });

  it('blocks after the burst is consumed and the long-window cap is hit', () => {
    // 1st request opens the bucket (count=1, burst=1)
    rateLimit('ip-c', 0);
    // 2nd consumes the burst (count=2, burst=2)
    rateLimit('ip-c', 1000);
    // 3rd hits the long-window counter (count=3, burst stays at 2)
    rateLimit('ip-c', 2000);
    // 4th
    rateLimit('ip-c', 3000);
    // 5th — reaches MAX_REQUESTS
    rateLimit('ip-c', 4000);
    // 6th — should be blocked
    const r = rateLimit('ip-c', 5000);
    expect(r.ok).toBe(false);
    expect(r.retryAfterMs).toBeGreaterThan(0);
  });

  it('resets after the window elapses', () => {
    rateLimit('ip-d', 0);
    rateLimit('ip-d', 1000);
    rateLimit('ip-d', 2000);
    rateLimit('ip-d', 3000);
    rateLimit('ip-d', 4000);
    const blocked = rateLimit('ip-d', 5000);
    expect(blocked.ok).toBe(false);
    // jump past the window
    const fresh = rateLimit('ip-d', 10 * 60 * 1000 + 1);
    expect(fresh.ok).toBe(true);
  });

  it('keys are independent', () => {
    rateLimit('ip-e', 0);
    rateLimit('ip-e', 1000);
    rateLimit('ip-e', 2000);
    rateLimit('ip-e', 3000);
    rateLimit('ip-e', 4000);
    const e = rateLimit('ip-e', 5000);
    expect(e.ok).toBe(false);
    // Different IP is unaffected
    const f = rateLimit('ip-f', 5000);
    expect(f.ok).toBe(true);
  });
});

describe('clientKey', () => {
  function makeReq(headers: Record<string, string>): Request {
    return new Request('https://example.com', { headers });
  }

  it('prefers x-forwarded-for (first IP in the list)', () => {
    expect(clientKey(makeReq({ 'x-forwarded-for': '1.2.3.4, 10.0.0.1' }))).toBe('1.2.3.4');
  });

  it('falls back to x-real-ip', () => {
    expect(clientKey(makeReq({ 'x-real-ip': '5.6.7.8' }))).toBe('5.6.7.8');
  });

  it('returns "local" when no IP headers are present', () => {
    expect(clientKey(makeReq({}))).toBe('local');
  });
});
