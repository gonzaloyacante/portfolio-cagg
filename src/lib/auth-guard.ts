import { headers } from 'next/headers';
import { NextResponse } from 'next/server';

import { auth } from '@/lib/auth';

type AdminHandler = (
  req: Request,
  ctx: { params: Promise<Record<string, string>> }
) => Promise<Response>;

export function withAdminAuth(handler: AdminHandler): AdminHandler {
  return async (req, ctx) => {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    return handler(req, ctx);
  };
}
