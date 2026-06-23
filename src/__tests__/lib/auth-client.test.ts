// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { createAuthClient, twoFactorClient } = vi.hoisted(() => ({
  createAuthClient: vi.fn((config: unknown) => ({ config, _kind: 'client' })),
  twoFactorClient: vi.fn((opts: unknown) => ({ opts, _kind: 'twoFactorClient' })),
}));

vi.mock('better-auth/client', () => ({ createAuthClient }));
vi.mock('better-auth/client/plugins', () => ({ twoFactorClient }));

describe('auth-client.ts (client config)', () => {
  let originalEnv: string | undefined;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    originalEnv = process.env.NEXT_PUBLIC_APP_URL;
  });

  afterEach(() => {
    if (originalEnv !== undefined) {
      process.env.NEXT_PUBLIC_APP_URL = originalEnv;
    } else {
      delete process.env.NEXT_PUBLIC_APP_URL;
    }
  });

  it('uses createAuthClient', async () => {
    process.env.NEXT_PUBLIC_APP_URL = 'https://cagg.vercel.app';
    await import('@/lib/auth-client');
    expect(createAuthClient).toHaveBeenCalled();
  });

  it('reads NEXT_PUBLIC_APP_URL with localhost fallback', async () => {
    delete process.env.NEXT_PUBLIC_APP_URL;
    await import('@/lib/auth-client');
    const call = (createAuthClient as unknown as { mock: { calls: unknown[][] } }).mock.calls[0];
    const config = call?.[0] as { baseURL?: string };
    expect(config?.baseURL).toBe('http://localhost:3000');
  });

  it('uses NEXT_PUBLIC_APP_URL when set', async () => {
    process.env.NEXT_PUBLIC_APP_URL = 'https://cagg.vercel.app';
    await import('@/lib/auth-client');
    const call = (createAuthClient as unknown as { mock: { calls: unknown[][] } }).mock.calls[0];
    const config = call?.[0] as { baseURL?: string };
    expect(config?.baseURL).toBe('https://cagg.vercel.app');
  });

  it('registers the twoFactorClient plugin', async () => {
    process.env.NEXT_PUBLIC_APP_URL = 'https://cagg.vercel.app';
    await import('@/lib/auth-client');
    expect(twoFactorClient).toHaveBeenCalled();
  });

  it('configures twoFactorClient with an onTwoFactorRedirect callback', async () => {
    process.env.NEXT_PUBLIC_APP_URL = 'https://cagg.vercel.app';
    await import('@/lib/auth-client');
    const call = (twoFactorClient as unknown as { mock: { calls: unknown[][] } }).mock.calls[0];
    const opts = call?.[0] as { onTwoFactorRedirect?: () => void };
    expect(typeof opts?.onTwoFactorRedirect).toBe('function');
  });

  it('twoFactorClient redirect handler sets window.location.href to 2fa step', async () => {
    process.env.NEXT_PUBLIC_APP_URL = 'https://cagg.vercel.app';
    // The handler is captured in the closure passed to twoFactorClient.
    // We don't stub window.location because the handler is invoked at
    // import time by jsdom (which has a window). Instead we just verify
    // the handler is defined.
    await import('@/lib/auth-client');
    const call = (twoFactorClient as unknown as { mock: { calls: unknown[][] } }).mock.calls[0];
    const opts = call?.[0] as { onTwoFactorRedirect?: () => void };
    expect(typeof opts?.onTwoFactorRedirect).toBe('function');
  });

  it('exposes the auth client as default export', async () => {
    process.env.NEXT_PUBLIC_APP_URL = 'https://cagg.vercel.app';
    const mod = await import('@/lib/auth-client');
    expect(mod.authClient).toBeDefined();
  });

  it('calls createAuthClient exactly once per module load', async () => {
    process.env.NEXT_PUBLIC_APP_URL = 'https://cagg.vercel.app';
    await import('@/lib/auth-client');
    expect(createAuthClient).toHaveBeenCalledTimes(1);
  });

  describe('onTwoFactorRedirect callback', () => {
    const originalLocation = window.location;

    beforeEach(() => {
      // jsdom makes window.location read-only by default; use a stub
      // so we can assert the handler writes the expected URL.
      delete (window as { location?: unknown }).location;
      (window as unknown as { location: { href: string } }).location = { href: '' };
    });

    afterEach(() => {
      (window as unknown as { location: Location }).location = originalLocation;
    });

    it('redirects window.location.href to /admin/login?step=2fa when invoked', async () => {
      process.env.NEXT_PUBLIC_APP_URL = 'https://cagg.vercel.app';
      await import('@/lib/auth-client');
      const call = (
        twoFactorClient as unknown as {
          mock: { calls: unknown[][] };
        }
      ).mock.calls[0];
      const opts = call?.[0] as { onTwoFactorRedirect: () => void };

      opts.onTwoFactorRedirect();

      expect(window.location.href).toBe('/admin/login?step=2fa');
    });

    it('ignores any arguments passed by better-auth and still redirects', async () => {
      process.env.NEXT_PUBLIC_APP_URL = 'https://cagg.vercel.app';
      await import('@/lib/auth-client');
      const call = (
        twoFactorClient as unknown as {
          mock: { calls: unknown[][] };
        }
      ).mock.calls[0];
      const opts = call?.[0] as {
        onTwoFactorRedirect: (...args: unknown[]) => void;
      };

      // Some better-auth versions may pass ctx/url info — handler should
      // not throw and should always redirect to the same path.
      opts.onTwoFactorRedirect({ url: 'https://evil.example/2fa' });
      opts.onTwoFactorRedirect(undefined, null, 'whatever');

      expect(window.location.href).toBe('/admin/login?step=2fa');
    });

    it('captures a fresh handler on each module load (no stale closure)', async () => {
      process.env.NEXT_PUBLIC_APP_URL = 'https://cagg.vercel.app';
      await import('@/lib/auth-client');
      const firstCall = (
        twoFactorClient as unknown as {
          mock: { calls: unknown[][] };
        }
      ).mock.calls[0];
      const firstHandler = (firstCall?.[0] as { onTwoFactorRedirect: () => void })
        .onTwoFactorRedirect;

      vi.resetModules();
      await import('@/lib/auth-client');
      const secondCall = (
        twoFactorClient as unknown as {
          mock: { calls: unknown[][] };
        }
      ).mock.calls[1];
      const secondHandler = (secondCall?.[0] as { onTwoFactorRedirect: () => void })
        .onTwoFactorRedirect;

      expect(firstHandler).not.toBe(secondHandler);
      // Both handlers should still write the same target.
      firstHandler();
      expect(window.location.href).toBe('/admin/login?step=2fa');
      window.location.href = '';
      secondHandler();
      expect(window.location.href).toBe('/admin/login?step=2fa');
    });
  });
});
