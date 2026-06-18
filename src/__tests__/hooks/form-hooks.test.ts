// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { renderHook } from '@testing-library/react';

import { useForgotPassword } from '@/hooks/use-forgot-password';
import { useLogin } from '@/hooks/use-login';
import { useResetPassword } from '@/hooks/use-reset-password';
import { useTotp } from '@/hooks/use-totp';

const { authClient, router, routerRefresh } = vi.hoisted(() => ({
  authClient: {
    signIn: { email: vi.fn() },
    requestPasswordReset: vi.fn(),
    resetPassword: vi.fn(),
    twoFactor: { verifyTotp: vi.fn(), enable: vi.fn(), disable: vi.fn() },
  },
  router: { replace: vi.fn(), push: vi.fn(), refresh: vi.fn() },
  routerRefresh: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ ...router, refresh: routerRefresh }),
}));

vi.mock('@/lib/auth-client', () => ({ authClient }));

describe('useLogin()', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns form, onSubmit, loading=false initially', () => {
    const { result } = renderHook(() => useLogin());
    expect(result.current.form).toBeDefined();
    expect(result.current.onSubmit).toBeTypeOf('function');
    expect(result.current.loading).toBe(false);
  });

  it('loading starts as false', () => {
    const { result } = renderHook(() => useLogin());
    expect(result.current.loading).toBe(false);
  });

  it('exposes a form object with formState', () => {
    const { result } = renderHook(() => useLogin());
    expect(result.current.form.formState).toBeDefined();
  });

  it('exposes handleSubmit-bound onSubmit', () => {
    const { result } = renderHook(() => useLogin());
    expect(typeof result.current.onSubmit).toBe('function');
  });
});

describe('useForgotPassword()', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns form, onSubmit, submitted=false, loading=false initially', () => {
    const { result } = renderHook(() => useForgotPassword());
    expect(result.current.form).toBeDefined();
    expect(result.current.onSubmit).toBeTypeOf('function');
    expect(result.current.submitted).toBe(false);
    expect(result.current.loading).toBe(false);
  });

  it('exposes a form object', () => {
    const { result } = renderHook(() => useForgotPassword());
    expect(result.current.form.formState).toBeDefined();
  });
});

describe('useResetPassword()', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns form, onSubmit, loading=false, done=false initially', () => {
    const { result } = renderHook(() => useResetPassword('tok-123'));
    expect(result.current.form).toBeDefined();
    expect(result.current.onSubmit).toBeTypeOf('function');
    expect(result.current.loading).toBe(false);
    expect(result.current.done).toBe(false);
  });

  it('accepts any token string', () => {
    const { result } = renderHook(() => useResetPassword('arbitrary-token'));
    expect(result.current.form).toBeDefined();
  });

  it('exposes a form object with formState', () => {
    const { result } = renderHook(() => useResetPassword('tok'));
    expect(result.current.form.formState).toBeDefined();
  });
});

describe('useTotp()', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns form, onSubmit, loading=false initially', () => {
    const { result } = renderHook(() => useTotp());
    expect(result.current.form).toBeDefined();
    expect(result.current.onSubmit).toBeTypeOf('function');
    expect(result.current.loading).toBe(false);
  });

  it('exposes a form object with formState', () => {
    const { result } = renderHook(() => useTotp());
    expect(result.current.form.formState).toBeDefined();
  });
});
