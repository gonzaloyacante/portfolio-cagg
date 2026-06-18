/**
 * Simple in-memory token-bucket rate limiter, scoped per IP. Good enough
 * for the public contact form on a single Node process. If we ever go
 * multi-instance, swap for a Redis-backed limiter (Upstash, etc.) — the
 * shape of `consume` won't change.
 *
 * Limits:
 *  - 5 requests / 10 minutes / IP (the contact form)
 *  - Burst of 2 (so legitimate retries don't get blocked)
 *
 * Cleanup happens lazily on each `consume` call so we don't keep
 * a background timer alive.
 */

type Bucket = {
  count: number;
  burst: number;
  resetAt: number;
};

const buckets = new Map<string, Bucket>();

const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS = 5;
const MAX_BURST = 2;

function gc(now: number) {
  for (const [key, b] of buckets) {
    if (b.resetAt <= now) buckets.delete(key);
  }
}

export function rateLimit(key: string, now = Date.now()): { ok: boolean; retryAfterMs: number } {
  gc(now);
  const existing = buckets.get(key);

  if (!existing) {
    buckets.set(key, { count: 1, burst: 1, resetAt: now + WINDOW_MS });
    return { ok: true, retryAfterMs: 0 };
  }

  if (existing.resetAt <= now) {
    buckets.set(key, { count: 1, burst: 1, resetAt: now + WINDOW_MS });
    return { ok: true, retryAfterMs: 0 };
  }

  // Burst window: allow 2 quick retries (e.g. double-clicks) before
  // counting against the long window.
  if (existing.burst >= MAX_BURST) {
    if (existing.count >= MAX_REQUESTS) {
      return { ok: false, retryAfterMs: existing.resetAt - now };
    }
    existing.count += 1;
    return { ok: true, retryAfterMs: 0 };
  }

  existing.burst += 1;
  existing.count += 1;
  return { ok: true, retryAfterMs: 0 };
}

/**
 * Extracts a stable per-client key from a Request. Prefers the IP from
 * common reverse-proxy headers, falls back to a constant when running
 * in environments where the headers aren't populated (e.g. local dev
 * from `localhost`).
 */
export function clientKey(req: Request): string {
  const fwd = req.headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0]?.trim() || 'unknown';
  const real = req.headers.get('x-real-ip');
  if (real) return real;
  return 'local';
}
