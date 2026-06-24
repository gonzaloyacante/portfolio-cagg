import { NextResponse } from 'next/server';

/**
 * Returns the VAPID public key so the client can `pushManager.subscribe(...)`.
 * The private key NEVER leaves the server.
 *
 * This route is intentionally unauthenticated — the public key is not a
 * secret. Auth happens when the client POSTs the resulting subscription
 * to /api/push/subscribe, which requires an admin session.
 */
export function GET() {
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  if (!publicKey) {
    return NextResponse.json({ error: 'Push not configured on this server' }, { status: 503 });
  }
  return NextResponse.json({ publicKey });
}
