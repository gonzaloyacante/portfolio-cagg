import { headers } from 'next/headers';
import { NextResponse } from 'next/server';

import { z } from 'zod';

import { auth } from '@/lib/auth';
import { withAdminAuth } from '@/lib/auth-guard';
import { prisma } from '@/lib/prisma';

const subscribeSchema = z
  .object({
    endpoint: z.string().url().max(2048),
    keys: z.object({
      p256dh: z.string().min(1).max(512),
      auth: z.string().min(1).max(64),
    }),
    // Browsers may attach an `expirationTime: number | null` field on the
    // PushSubscription. We don't store it, but we must not reject the
    // payload over it (Zod is strict by default).
    expirationTime: z.number().int().nullable().optional(),
  })
  .loose();

/**
 * Saves (or refreshes) the current admin's push subscription.
 *
 * The client sends the `PushSubscription` it got from
 * `registration.pushManager.subscribe(...)`. We store it keyed on the
 * endpoint (unique) — re-subscribing the same device (e.g. after the
 * browser rotated its keys) overwrites the row in place.
 *
 * Auth: withAdminAuth (admin session cookie required).
 */
export const POST = withAdminAuth(async (req) => {
  const session = await auth.api.getSession({ headers: await headers() });
  // withAdminAuth guarantees a session, but TS needs the narrowing.
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const userId = session.user.id;

  const body = await req.json().catch(() => null);
  const parsed = subscribeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid subscription', issues: parsed.error.issues },
      { status: 422 }
    );
  }

  const { endpoint, keys } = parsed.data;

  await prisma.pushSubscription.upsert({
    where: { endpoint },
    create: {
      userId,
      endpoint,
      p256dh: keys.p256dh,
      auth: keys.auth,
    },
    update: {
      userId,
      p256dh: keys.p256dh,
      auth: keys.auth,
    },
  });

  return NextResponse.json({ success: true });
});

/**
 * Removes the current admin's push subscription by endpoint.
 * Called on signOut and when the admin disables notifications in the UI.
 *
 * Auth: withAdminAuth (admin session cookie required).
 */
export const DELETE = withAdminAuth(async (req) => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const userId = session.user.id;

  const body = await req.json().catch(() => null);
  const parsed = z.object({ endpoint: z.string().url() }).safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid endpoint' }, { status: 422 });
  }

  // Only delete the row if it belongs to the current admin — never let
  // one admin remove another admin's device subscription.
  await prisma.pushSubscription
    .deleteMany({ where: { endpoint: parsed.data.endpoint, userId } })
    .catch((err: unknown) => console.error('[push] delete subscription failed', err));

  return NextResponse.json({ success: true });
});
