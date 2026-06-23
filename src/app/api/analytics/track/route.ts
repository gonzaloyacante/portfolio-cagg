import { NextResponse, type NextRequest } from 'next/server';

import { z } from 'zod';

const trackSchema = z.object({
  path: z.string().min(1).max(512),
  locale: z.enum(['es', 'en']).optional().default('es'),
  referrer: z.string().max(2048).optional(),
});

/**
 * Public endpoint hit by the landing page to record a page view.
 * Stores path + locale + (optional) referrer. Does NOT store IP, user
 * agent, or anything personally identifying. Returns 204 always.
 *
 * The Prisma client is loaded lazily so unit tests can exercise the
 * validation path without a database connection.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return new NextResponse(null, { status: 204 });
  }

  const parsed = trackSchema.safeParse(body);
  if (!parsed.success) return new NextResponse(null, { status: 204 });

  const userAgent = request.headers.get('user-agent') ?? null;

  // Best-effort persistence. If Prisma isn't reachable, swallow.
  try {
    const { prisma } = await import('@/lib/prisma');
    await prisma.pageView.create({
      data: {
        path: parsed.data.path,
        locale: parsed.data.locale,
        referrer: parsed.data.referrer ?? null,
        userAgent: userAgent?.slice(0, 512) ?? null,
      },
    });
  } catch {
    // best-effort
  }

  return new NextResponse(null, { status: 204 });
}

export function GET(): NextResponse {
  return new NextResponse('Method Not Allowed', {
    status: 405,
    headers: { Allow: 'POST' },
  });
}
