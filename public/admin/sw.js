/**
 * Service Worker for the admin PWA.
 *
 * Scope: `/admin` (because the file is served from /admin/sw.js).
 * This SW does NOT intercept any request outside /admin/*.
 *
 * Responsibilities:
 *  - Show native notifications when a `push` event arrives.
 *  - Open /admin/messages (or the payload's `url`) when the user taps.
 *  - Re-subscribe and re-POST to /api/push/subscribe when the browser
 *    rotates the subscription keys (`pushsubscriptionchange`).
 *
 * IMPORTANT: This file is served as-is from /public/admin/sw.js.
 * It does NOT go through the Next.js bundler — keep it dependency-free.
 */

self.addEventListener('install', (event) => {
  // Take over from any previous version of this SW immediately so the
  // new push handler is live after a deploy without a page refresh.
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  // Claim any open /admin/* clients so the SW controls them on next load.
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
  let payload = { title: 'Nuevo mensaje', body: '', url: '/admin/messages' };
  if (event.data) {
    try {
      const parsed = event.data.json();
      payload = {
        title: typeof parsed.title === 'string' ? parsed.title : payload.title,
        body: typeof parsed.body === 'string' ? parsed.body : payload.body,
        url: typeof parsed.url === 'string' ? parsed.url : payload.url,
      };
    } catch {
      // Malformed payload — fall back to defaults. We still show a
      // notification so the admin notices something happened.
    }
  }

  const options = {
    body: payload.body,
    icon: '/admin/icon-192.png',
    badge: '/admin/icon-192.png',
    tag: 'cag-message',
    renotify: true,
    requireInteraction: false,
    data: { url: payload.url },
  };

  event.waitUntil(self.registration.showNotification(payload.title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = (event.notification.data && event.notification.data.url) || '/admin/messages';
  const fullUrl = new URL(targetUrl, self.location.origin).href;

  event.waitUntil(
    (async () => {
      // Focus an existing /admin tab if one is open, otherwise open a new one.
      const allClients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
      for (const client of allClients) {
        // Only reuse clients that are on this origin AND in the admin scope.
        if ('url' in client && new URL(client.url).pathname.startsWith('/admin')) {
          await client.focus();
          if ('navigate' in client) {
            try {
              await client.navigate(fullUrl);
            } catch {
              /* navigate may be unsupported; focus is enough */
            }
          }
          return;
        }
      }
      await self.clients.openWindow(fullUrl);
    })()
  );
});

self.addEventListener('pushsubscriptionchange', (event) => {
  // The browser rotated keys for the existing subscription (or it expired).
  // Re-subscribe and POST the new subscription to the server so we keep
  // delivering push. If this fails, the next page load will re-subscribe.
  event.waitUntil(
    (async () => {
      try {
        const vapidRes = await fetch('/api/push/vapid-key');
        if (!vapidRes.ok) return;
        const { publicKey } = await vapidRes.json();
        const newSub = await self.registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicKey),
        });
        await fetch('/api/push/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newSub),
          credentials: 'same-origin',
        });
      } catch {
        // Swallow — the next admin page load will re-subscribe from the UI.
      }
    })()
  );
});

// Helpers — kept inline so the SW file has no module dependencies.
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = self.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
