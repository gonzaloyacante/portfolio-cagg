import { beforeEach, describe, expect, it, vi } from 'vitest';

import { auth } from '@/lib/auth';
import { withAdminAuth } from '@/lib/auth-guard';

vi.mock('next/headers', () => ({
  headers: vi.fn(),
}));

vi.mock('@/lib/auth', () => ({
  auth: { api: { getSession: vi.fn() } },
}));

const mockedGetSession = vi.mocked(auth.api.getSession);

const okHandler = vi.fn(async () => new Response('ok', { status: 200 }));
const unauthorizedHandler = vi.fn(
  async () => new Response('should-not-be-called', { status: 200 })
);

beforeEach(() => {
  okHandler.mockClear();
  unauthorizedHandler.mockClear();
  mockedGetSession.mockReset();
});

describe('withAdminAuth()', () => {
  it('calls the handler when a session exists', async () => {
    mockedGetSession.mockResolvedValueOnce({ user: { id: 'u1' } } as never);
    const wrapped = withAdminAuth(okHandler);
    const req = new Request('https://x.com');
    const ctx = { params: Promise.resolve({ id: '1' }) };
    const res = await wrapped(req, ctx);
    expect(res.status).toBe(200);
    expect(okHandler).toHaveBeenCalledOnce();
    expect(okHandler).toHaveBeenCalledWith(req, ctx);
  });

  it('returns 401 when no session', async () => {
    mockedGetSession.mockResolvedValueOnce(null);
    const wrapped = withAdminAuth(unauthorizedHandler);
    const res = await wrapped(new Request('https://x.com'), { params: Promise.resolve({}) });
    expect(res.status).toBe(401);
    expect(unauthorizedHandler).not.toHaveBeenCalled();
  });

  it('returns JSON body with error message on 401', async () => {
    mockedGetSession.mockResolvedValueOnce(null);
    const wrapped = withAdminAuth(unauthorizedHandler);
    const res = await wrapped(new Request('https://x.com'), { params: Promise.resolve({}) });
    const body = await res.json();
    expect(body).toEqual({ error: 'Unauthorized' });
  });

  it('preserves the original method, headers, and body of the request', async () => {
    mockedGetSession.mockResolvedValueOnce({ user: { id: 'u1' } } as never);
    let captured: Request | null = null;
    const handler = vi.fn(async (req: Request) => {
      captured = req;
      return new Response('ok');
    });
    const wrapped = withAdminAuth(handler);
    const req = new Request('https://x.com', { method: 'PUT', body: JSON.stringify({ a: 1 }) });
    await wrapped(req, { params: Promise.resolve({}) });
    const cap = captured as unknown as { method: string; json: () => Promise<unknown> };
    expect(cap?.method).toBe('PUT');
    expect(await cap?.json()).toEqual({ a: 1 });
  });

  it('resolves params before calling the handler', async () => {
    mockedGetSession.mockResolvedValueOnce({ user: { id: 'u1' } } as never);
    let capturedParams: Record<string, string> | null = null;
    const handler = vi.fn(async (_req, ctx) => {
      capturedParams = await ctx.params;
      return new Response('ok');
    });
    const wrapped = withAdminAuth(handler);
    await wrapped(new Request('https://x.com'), { params: Promise.resolve({ id: 'abc' }) });
    expect(capturedParams).toEqual({ id: 'abc' });
  });

  it('handler can return any Response-shaped object', async () => {
    mockedGetSession.mockResolvedValueOnce({ user: { id: 'u1' } } as never);
    const handler = vi.fn(
      async () =>
        ({
          status: 201,
          json: async () => ({ created: true }),
        }) as unknown as Response
    );
    const wrapped = withAdminAuth(handler);
    const res = await wrapped(new Request('https://x.com'), { params: Promise.resolve({}) });
    expect(res.status).toBe(201);
  });

  it('handler can throw and the error propagates', async () => {
    mockedGetSession.mockResolvedValueOnce({ user: { id: 'u1' } } as never);
    const handler = vi.fn(async () => {
      throw new Error('boom');
    });
    const wrapped = withAdminAuth(handler);
    await expect(
      wrapped(new Request('https://x.com'), { params: Promise.resolve({}) })
    ).rejects.toThrow('boom');
  });

  it('forwards POST requests', async () => {
    mockedGetSession.mockResolvedValueOnce({ user: { id: 'u1' } } as never);
    const handler = vi.fn(async () => new Response('ok'));
    const wrapped = withAdminAuth(handler);
    await wrapped(new Request('https://x.com', { method: 'POST', body: '{}' }), {
      params: Promise.resolve({}),
    });
    expect(handler).toHaveBeenCalledOnce();
  });

  it('forwards DELETE requests', async () => {
    mockedGetSession.mockResolvedValueOnce({ user: { id: 'u1' } } as never);
    const handler = vi.fn(async () => new Response(null, { status: 204 }));
    const wrapped = withAdminAuth(handler);
    const res = await wrapped(new Request('https://x.com', { method: 'DELETE' }), {
      params: Promise.resolve({}),
    });
    expect(res.status).toBe(204);
  });

  it('forwards PATCH requests', async () => {
    mockedGetSession.mockResolvedValueOnce({ user: { id: 'u1' } } as never);
    const handler = vi.fn(async () => new Response('ok'));
    const wrapped = withAdminAuth(handler);
    await wrapped(new Request('https://x.com', { method: 'PATCH' }), {
      params: Promise.resolve({}),
    });
    expect(handler).toHaveBeenCalledOnce();
  });

  it('handler that returns a 5xx is still returned to the client', async () => {
    mockedGetSession.mockResolvedValueOnce({ user: { id: 'u1' } } as never);
    const handler = vi.fn(async () => new Response('server error', { status: 500 }));
    const wrapped = withAdminAuth(handler);
    const res = await wrapped(new Request('https://x.com'), { params: Promise.resolve({}) });
    expect(res.status).toBe(500);
  });
});
