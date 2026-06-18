import { describe, expect, it, vi } from 'vitest';

// Import the module AFTER the mocks are set up. This triggers betterAuth() once.
import { auth } from '@/lib/auth';

const { prismaAdapter, twoFactor, prismaMock, betterAuth } = vi.hoisted(() => {
  const betterAuth = vi.fn((config: unknown) => ({ config, _kind: 'auth' }));
  return {
    prismaAdapter: vi.fn(),
    twoFactor: vi.fn(() => 'twoFactorPlugin'),
    prismaMock: { _isPrisma: true },
    betterAuth,
  };
});

vi.mock('better-auth', () => ({ betterAuth }));
vi.mock('better-auth/adapters/prisma', () => ({ prismaAdapter }));
vi.mock('better-auth/plugins', () => ({ twoFactor }));
vi.mock('@/lib/prisma', () => ({ prisma: prismaMock }));

describe('auth.ts (better-auth config)', () => {
  it('exports an auth instance', () => {
    expect(auth).toBeDefined();
  });

  it('uses betterAuth factory', () => {
    expect(betterAuth).toHaveBeenCalled();
  });

  it('sets appName to "portfolio-cag"', () => {
    const call = (betterAuth as unknown as { mock: { calls: unknown[][] } }).mock.calls[0];
    const config = call?.[0] as { appName?: string };
    expect(config?.appName).toBe('portfolio-cag');
  });

  it('uses the prisma adapter with postgres provider', () => {
    expect(prismaAdapter).toHaveBeenCalledWith(prismaMock, { provider: 'postgresql' });
  });

  it('enables email and password', () => {
    const call = (betterAuth as unknown as { mock: { calls: unknown[][] } }).mock.calls[0];
    const config = call?.[0] as { emailAndPassword?: { enabled?: boolean } };
    expect(config?.emailAndPassword?.enabled).toBe(true);
  });

  it('does NOT require email verification (admin-only site)', () => {
    const call = (betterAuth as unknown as { mock: { calls: unknown[][] } }).mock.calls[0];
    const config = call?.[0] as { emailAndPassword?: { requireEmailVerification?: boolean } };
    expect(config?.emailAndPassword?.requireEmailVerification).toBe(false);
  });

  it('enables the twoFactor plugin', () => {
    expect(twoFactor).toHaveBeenCalled();
    const call = (betterAuth as unknown as { mock: { calls: unknown[][] } }).mock.calls[0];
    const config = call?.[0] as { plugins?: unknown[] };
    expect(config?.plugins).toContain('twoFactorPlugin');
  });

  it('configures session cookie cache for 7 days', () => {
    const call = (betterAuth as unknown as { mock: { calls: unknown[][] } }).mock.calls[0];
    const config = call?.[0] as {
      session?: { cookieCache?: { enabled?: boolean; maxAge?: number } };
    };
    expect(config?.session?.cookieCache?.enabled).toBe(true);
    expect(config?.session?.cookieCache?.maxAge).toBe(60 * 60 * 24 * 7);
  });

  it('7 days in seconds is exactly 604800', () => {
    const call = (betterAuth as unknown as { mock: { calls: unknown[][] } }).mock.calls[0];
    const config = call?.[0] as { session?: { cookieCache?: { maxAge?: number } } };
    expect(config?.session?.cookieCache?.maxAge).toBe(604_800);
  });
});
