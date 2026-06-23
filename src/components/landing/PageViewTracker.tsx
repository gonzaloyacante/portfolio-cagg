'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';

/**
 * Fires a single POST to /api/analytics/track on mount and on every
 * pathname change. Uses `navigator.sendBeacon` when available (it
 * survives page unloads), otherwise falls back to fetch. No-ops if
 * the request fails — analytics is best-effort and must never break
 * the page.
 */
export function PageViewTracker({ locale }: { locale: string }) {
  const pathname = usePathname();
  const lastTrackedRef = useRef<string>('');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (lastTrackedRef.current === pathname) return;
    lastTrackedRef.current = pathname;

    const payload = JSON.stringify({
      path: pathname,
      locale,
      referrer: document.referrer || undefined,
    });

    const send = () => {
      try {
        if (navigator.sendBeacon) {
          const blob = new Blob([payload], { type: 'application/json' });
          navigator.sendBeacon('/api/analytics/track', blob);
        } else {
          fetch('/api/analytics/track', {
            method: 'POST',
            body: payload,
            headers: { 'Content-Type': 'application/json' },
            keepalive: true,
          }).catch(() => {});
        }
      } catch {
        // swallow
      }
    };

    // Slight delay so the request is bundled with the rest of the
    // initial paint's network work — no impact on TTI/LCP.
    const id = setTimeout(send, 1200);
    return () => clearTimeout(id);
  }, [pathname, locale]);

  return null;
}
