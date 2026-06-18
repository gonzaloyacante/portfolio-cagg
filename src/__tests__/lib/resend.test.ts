import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { ResendMock, constructorSpy } = vi.hoisted(() => {
  const constructorSpy = vi.fn();
  class ResendMock {
    emails = { send: vi.fn() };
    constructor(key: string) {
      constructorSpy(key);
    }
  }
  return { ResendMock, constructorSpy };
});

vi.mock('resend', () => ({
  Resend: ResendMock,
}));

describe('lib/resend.ts', () => {
  beforeEach(() => {
    constructorSpy.mockClear();
    vi.resetModules();
  });

  afterEach(() => {
    delete process.env.RESEND_API_KEY;
  });

  it('returns null when RESEND_API_KEY is missing', async () => {
    delete process.env.RESEND_API_KEY;
    const { getResend } = await import('@/lib/resend');
    expect(getResend()).toBeNull();
  });

  it('does NOT instantiate Resend when key is missing', async () => {
    delete process.env.RESEND_API_KEY;
    const { getResend } = await import('@/lib/resend');
    getResend();
    expect(constructorSpy).not.toHaveBeenCalled();
  });

  it('instantiates Resend when key is present', async () => {
    process.env.RESEND_API_KEY = 're_test_123';
    const { getResend } = await import('@/lib/resend');
    getResend();
    expect(constructorSpy).toHaveBeenCalled();
  });

  it('returns a Resend instance when key is present', async () => {
    process.env.RESEND_API_KEY = 're_test_123';
    const { getResend } = await import('@/lib/resend');
    const result = getResend();
    expect(result).toBeInstanceOf(ResendMock);
  });

  it('passes the API key to the Resend constructor', async () => {
    process.env.RESEND_API_KEY = 're_test_secret_xyz';
    const { getResend } = await import('@/lib/resend');
    getResend();
    expect(constructorSpy).toHaveBeenCalledWith('re_test_secret_xyz');
  });

  it('caches the instance across calls', async () => {
    process.env.RESEND_API_KEY = 're_test_123';
    const { getResend } = await import('@/lib/resend');
    getResend();
    getResend();
    getResend();
    expect(constructorSpy).toHaveBeenCalledTimes(1);
  });

  it('returns the same instance on every call', async () => {
    process.env.RESEND_API_KEY = 're_test_123';
    const { getResend } = await import('@/lib/resend');
    const a = getResend();
    const b = getResend();
    const c = getResend();
    expect(a).toBe(b);
    expect(b).toBe(c);
  });

  it('handles empty string key as missing', async () => {
    process.env.RESEND_API_KEY = '';
    const { getResend } = await import('@/lib/resend');
    expect(getResend()).toBeNull();
  });

  it('exposes the Resend API on the returned instance', async () => {
    process.env.RESEND_API_KEY = 're_test_123';
    const { getResend } = await import('@/lib/resend');
    const instance = getResend() as { emails: { send: unknown } } | null;
    expect(instance?.emails.send).toBeTypeOf('function');
  });
});
