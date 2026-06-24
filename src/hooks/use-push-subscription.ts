'use client';

import { useCallback, useEffect, useState } from 'react';

export type PushSupport =
  | { kind: 'unsupported'; reason: string }
  | { kind: 'loading' }
  | { kind: 'prompt'; permission: NotificationPermission }
  | { kind: 'denied' }
  | { kind: 'subscribed'; subscription: PushSubscription };

const SW_URL = '/admin/sw.js';

function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  // Uint8Array.from() infers Uint8Array<ArrayBuffer> (not ArrayBufferLike),
  // which is assignable to the strict BufferSource that pushManager.subscribe
  // expects in TypeScript 5.7+.
  return Uint8Array.from(rawData, (c) => c.charCodeAt(0));
}

/**
 * Detects Web Push support and the current subscription state.
 *
 * Returns a tagged union so callers can render explicit UI per state:
 *   - unsupported → feature not available, hide toggle
 *   - loading     → SW + permission still being checked on mount
 *   - prompt      → browser will ask for permission on subscribe()
 *   - denied      → user previously blocked; only they can re-enable
 *   - subscribed  → active subscription, show "Desactivar"
 */
export function usePushSubscription(): {
  state: PushSupport;
  subscribe: () => Promise<void>;
  unsubscribe: () => Promise<void>;
} {
  const [state, setState] = useState<PushSupport>({ kind: 'loading' });

  useEffect(() => {
    let cancelled = false;

    async function detect() {
      if (typeof window === 'undefined') return;
      if (
        !('serviceWorker' in navigator) ||
        !('PushManager' in window) ||
        !('Notification' in window)
      ) {
        if (!cancelled) setState({ kind: 'unsupported', reason: 'Push API not available' });
        return;
      }
      // If the user already denied permission at the OS level, don't even
      // pretend we can ask — render the "blocked" state directly.
      if (Notification.permission === 'denied') {
        if (!cancelled) setState({ kind: 'denied' });
        return;
      }
      try {
        const reg = await navigator.serviceWorker.register(SW_URL, { scope: '/admin/' });
        // Wait for the SW to become active so getSubscription reflects the
        // latest state (some browsers return null on a freshly-installed SW).
        await navigator.serviceWorker.ready;
        const sub = await reg.pushManager.getSubscription();
        if (cancelled) return;
        if (sub) {
          setState({ kind: 'subscribed', subscription: sub });
        } else {
          setState({ kind: 'prompt', permission: Notification.permission });
        }
      } catch {
        if (!cancelled)
          setState({ kind: 'unsupported', reason: 'Service worker registration failed' });
      }
    }

    detect();
    return () => {
      cancelled = true;
    };
  }, []);

  const subscribe = useCallback(async () => {
    if (state.kind !== 'prompt') return;
    try {
      const perm = await Notification.requestPermission();
      if (perm !== 'granted') {
        setState({ kind: 'denied' });
        return;
      }
      const vapidRes = await fetch('/api/push/vapid-key');
      if (!vapidRes.ok) throw new Error('Server has no VAPID key');
      const { publicKey } = (await vapidRes.json()) as { publicKey: string };

      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });

      const res = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sub),
        credentials: 'same-origin',
      });
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      setState({ kind: 'subscribed', subscription: sub });
    } catch {
      // Surface as denied so the user gets feedback; they can retry.
      setState({ kind: 'denied' });
    }
  }, [state.kind]);

  const unsubscribe = useCallback(async () => {
    if (state.kind !== 'subscribed') return;
    const sub = state.subscription;
    try {
      await sub.unsubscribe();
      await fetch('/api/push/subscribe', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpoint: sub.endpoint }),
        credentials: 'same-origin',
      });
    } finally {
      setState({ kind: 'prompt', permission: Notification.permission });
    }
  }, [state]);

  return { state, subscribe, unsubscribe };
}
