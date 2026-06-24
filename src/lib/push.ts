import webpush, { type PushSubscription as WpSubscription } from 'web-push';

import { prisma } from './prisma';

const publicKey = process.env.VAPID_PUBLIC_KEY;
const privateKey = process.env.VAPID_PRIVATE_KEY;
const subject = process.env.VAPID_SUBJECT;

let _configured = false;

/**
 * Configures `web-push` with the VAPID identity the first time it's called.
 * Subsequent calls are no-ops so we don't pay the cost on every push.
 *
 * If any VAPID var is missing, push is silently disabled and the dispatch
 * helpers below become no-ops. The contact-message POST must never fail
 * because push is unconfigured — email via Resend is still the fallback.
 */
function ensureConfigured(): boolean {
  if (!publicKey || !privateKey || !subject) return false;
  if (_configured) return true;
  webpush.setVapidDetails(subject, publicKey, privateKey);
  _configured = true;
  return true;
}

export type PushPayload = {
  title: string;
  body: string;
  /** Path on this site to open when the notification is tapped. */
  url?: string;
  /** Optional icon URL override. Falls back to the manifest icon. */
  icon?: string;
};

/**
 * Sends a push to every saved subscription. Failures (410 Gone, 404, network)
 * clean up dead subscriptions so we don't keep retrying them.
 *
 * Errors are logged, never thrown — the caller (e.g. /api/messages POST)
 * already persisted the message and is responding to the user.
 */
export async function dispatchPushToAllAdmins(payload: PushPayload): Promise<void> {
  if (!ensureConfigured()) return;

  const subs = await prisma.pushSubscription.findMany({
    select: { id: true, endpoint: true, p256dh: true, auth: true },
  });

  if (subs.length === 0) return;

  const json = JSON.stringify(payload);

  await Promise.all(
    subs.map(async (sub) => {
      const wpSub: WpSubscription = {
        endpoint: sub.endpoint,
        keys: { p256dh: sub.p256dh, auth: sub.auth },
      };
      try {
        await webpush.sendNotification(wpSub, json);
      } catch (err: unknown) {
        const statusCode =
          typeof err === 'object' && err !== null && 'statusCode' in err
            ? Number((err as { statusCode: unknown }).statusCode)
            : 0;
        // 404 / 410 = subscription is dead (user revoked permission, app
        // uninstalled, or browser rotated keys). Drop it from the DB.
        if (statusCode === 404 || statusCode === 410) {
          await prisma.pushSubscription
            .delete({ where: { id: sub.id } })
            .catch((delErr: unknown) =>
              console.error('[push] failed to delete dead subscription', delErr)
            );
          return;
        }
        console.error('[push] sendNotification failed', err);
      }
    })
  );
}
