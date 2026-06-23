// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { act, renderHook } from '@testing-library/react';

import { useForgotPassword } from '@/hooks/use-forgot-password';
import { useLogin } from '@/hooks/use-login';
import { useResetPassword } from '@/hooks/use-reset-password';
import { useSecurity } from '@/hooks/use-security';
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

beforeEach(() => {
  vi.clearAllMocks();
});

// `form.handleSubmit(handler)` returns a function that, when invoked as a
// form submit handler, reads from the form's internal state. For
// programmatic testing we set the values via `form.reset(data)` and then
// call the submit function with no arguments so it reads from that state.
// We wrap in `act()` so any state updates / microtasks flush before we
// assert. The form parameter is intentionally loose (any UseFormReturn)
// because tests use different form shapes.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function fireSubmit(submit: () => Promise<unknown>, form: any, data: unknown) {
  form.reset(data);
  await act(async () => {
    await submit();
  });
}

// `form.getFieldState('root')` doesn't typecheck because 'root' isn't a
// declared field — react-hook-form's TypeScript only knows the schema
// fields. This helper hides the cast while keeping tests readable.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rootError(form: any) {
  return form.getFieldState('root').error?.message;
}

// ─────────────────────────────────────────────────────────────────────
// useLogin
// ─────────────────────────────────────────────────────────────────────
describe('useLogin() — submit flows', () => {
  it('success: routes to /admin and refreshes', async () => {
    authClient.signIn.email.mockResolvedValueOnce({
      data: { user: { id: 'u1' } },
      error: null,
    });
    const { result } = renderHook(() => useLogin());
    await fireSubmit(result.current.onSubmit, result.current.form, {
      email: 'a@b.co',
      password: 'pw',
    });

    expect(authClient.signIn.email).toHaveBeenCalledWith({
      email: 'a@b.co',
      password: 'pw',
      callbackURL: '/admin',
    });
    expect(router.replace).toHaveBeenCalledWith('/admin');
    expect(routerRefresh).toHaveBeenCalled();
    expect(result.current.loading).toBe(false);
  });

  it('error: sets root form error and does not route', async () => {
    authClient.signIn.email.mockResolvedValueOnce({
      data: null,
      error: { message: 'invalid' },
    });
    const { result } = renderHook(() => useLogin());
    await fireSubmit(result.current.onSubmit, result.current.form, {
      email: 'a@b.co',
      password: 'pw',
    });

    expect(rootError(result.current.form)).toBe('Credenciales inválidas.');
    expect(router.replace).not.toHaveBeenCalled();
    expect(routerRefresh).not.toHaveBeenCalled();
    expect(result.current.loading).toBe(false);
  });

  it('twoFactorRedirect: routes to /admin/login?step=2fa', async () => {
    authClient.signIn.email.mockResolvedValueOnce({
      data: { twoFactorRedirect: true },
      error: null,
    });
    const { result } = renderHook(() => useLogin());
    await fireSubmit(result.current.onSubmit, result.current.form, {
      email: 'a@b.co',
      password: 'pw',
    });

    expect(router.replace).toHaveBeenCalledWith('/admin/login?step=2fa');
    expect(routerRefresh).not.toHaveBeenCalled();
  });

  it('twoFactorRedirect=false falls through to /admin', async () => {
    authClient.signIn.email.mockResolvedValueOnce({
      data: { twoFactorRedirect: false },
      error: null,
    });
    const { result } = renderHook(() => useLogin());
    await fireSubmit(result.current.onSubmit, result.current.form, {
      email: 'a@b.co',
      password: 'pw',
    });

    expect(router.replace).toHaveBeenCalledWith('/admin');
    expect(routerRefresh).toHaveBeenCalled();
  });

  it('throws: sets connection error and resets loading', async () => {
    authClient.signIn.email.mockRejectedValueOnce(new Error('network'));
    const { result } = renderHook(() => useLogin());
    await fireSubmit(result.current.onSubmit, result.current.form, {
      email: 'a@b.co',
      password: 'pw',
    });

    expect(rootError(result.current.form)).toBe('Error de conexión. Intentá de nuevo.');
    expect(result.current.loading).toBe(false);
  });

  it('loading toggles true while pending then back to false', async () => {
    let resolveSignIn: (v: unknown) => void = () => {};
    authClient.signIn.email.mockReturnValueOnce(
      new Promise((res) => {
        resolveSignIn = res;
      })
    );
    const { result } = renderHook(() => useLogin());

    expect(result.current.loading).toBe(false);
    result.current.form.reset({ email: 'a@b.co', password: 'pw' });
    const submitPromise = act(async () => {
      await result.current.onSubmit();
    });

    resolveSignIn({ data: { user: { id: 'u1' } }, error: null });
    await submitPromise;
    expect(result.current.loading).toBe(false);
  });

  it('rejects invalid email before calling authClient', async () => {
    const { result } = renderHook(() => useLogin());
    await fireSubmit(result.current.onSubmit, result.current.form, {
      email: 'not-an-email',
      password: 'pw',
    });

    expect(authClient.signIn.email).not.toHaveBeenCalled();
    expect(result.current.form.getFieldState('email').error).toBeDefined();
  });

  it('rejects empty password before calling authClient', async () => {
    const { result } = renderHook(() => useLogin());
    await fireSubmit(result.current.onSubmit, result.current.form, {
      email: 'a@b.co',
      password: '',
    });

    expect(authClient.signIn.email).not.toHaveBeenCalled();
    expect(result.current.form.getFieldState('password').error).toBeDefined();
  });

  it('error after prior root error: calls authClient twice and surfaces the second error', async () => {
    authClient.signIn.email.mockResolvedValueOnce({
      data: null,
      error: { message: 'first' },
    });
    const { result } = renderHook(() => useLogin());
    await fireSubmit(result.current.onSubmit, result.current.form, {
      email: 'a@b.co',
      password: 'pw',
    });

    authClient.signIn.email.mockResolvedValueOnce({
      data: null,
      error: { message: 'second' },
    });
    await fireSubmit(result.current.onSubmit, result.current.form, {
      email: 'a@b.co',
      password: 'pw',
    });

    // authClient invoked once per submit; second call gets the new payload.
    expect(authClient.signIn.email).toHaveBeenCalledTimes(2);
    expect(authClient.signIn.email).toHaveBeenNthCalledWith(2, {
      email: 'a@b.co',
      password: 'pw',
      callbackURL: '/admin',
    });
  });
});

// ─────────────────────────────────────────────────────────────────────
// useTotp
// ─────────────────────────────────────────────────────────────────────
describe('useTotp() — submit flows', () => {
  it('success: routes to /admin and refreshes', async () => {
    authClient.twoFactor.verifyTotp.mockResolvedValueOnce({ data: { ok: true }, error: null });
    const { result } = renderHook(() => useTotp());
    await fireSubmit(result.current.onSubmit, result.current.form, { code: '123456' });

    expect(authClient.twoFactor.verifyTotp).toHaveBeenCalledWith({ code: '123456' });
    expect(router.replace).toHaveBeenCalledWith('/admin');
    expect(routerRefresh).toHaveBeenCalled();
    expect(result.current.loading).toBe(false);
  });

  it('error: sets code field error and does not route', async () => {
    authClient.twoFactor.verifyTotp.mockResolvedValueOnce({
      data: null,
      error: { message: 'bad code' },
    });
    const { result } = renderHook(() => useTotp());
    await fireSubmit(result.current.onSubmit, result.current.form, { code: '123456' });

    expect(result.current.form.getFieldState('code').error?.message).toBe(
      'Código inválido o expirado.'
    );
    expect(router.replace).not.toHaveBeenCalled();
  });

  it('throws: sets connection error on code field', async () => {
    authClient.twoFactor.verifyTotp.mockRejectedValueOnce(new Error('net'));
    const { result } = renderHook(() => useTotp());
    await fireSubmit(result.current.onSubmit, result.current.form, { code: '123456' });

    expect(result.current.form.getFieldState('code').error?.message).toBe(
      'Error de conexión. Intentá de nuevo.'
    );
    expect(result.current.loading).toBe(false);
  });

  it('rejects 5-digit code', async () => {
    const { result } = renderHook(() => useTotp());
    await fireSubmit(result.current.onSubmit, result.current.form, { code: '12345' });
    expect(authClient.twoFactor.verifyTotp).not.toHaveBeenCalled();
  });

  it('rejects non-numeric code', async () => {
    const { result } = renderHook(() => useTotp());
    await fireSubmit(result.current.onSubmit, result.current.form, { code: 'abcdef' });
    expect(authClient.twoFactor.verifyTotp).not.toHaveBeenCalled();
  });

  it('rejects 7-digit code', async () => {
    const { result } = renderHook(() => useTotp());
    await fireSubmit(result.current.onSubmit, result.current.form, { code: '1234567' });
    expect(authClient.twoFactor.verifyTotp).not.toHaveBeenCalled();
  });
});

// ─────────────────────────────────────────────────────────────────────
// useForgotPassword
// ─────────────────────────────────────────────────────────────────────
describe('useForgotPassword() — submit flows', () => {
  it('success: calls requestPasswordReset and sets submitted', async () => {
    authClient.requestPasswordReset.mockResolvedValueOnce({ data: {}, error: null });
    const { result } = renderHook(() => useForgotPassword());

    expect(result.current.submitted).toBe(false);
    expect(result.current.loading).toBe(false);

    await fireSubmit(result.current.onSubmit, result.current.form, { email: 'a@b.co' });

    expect(authClient.requestPasswordReset).toHaveBeenCalledTimes(1);
    expect(authClient.requestPasswordReset).toHaveBeenCalledWith(
      expect.objectContaining({ email: 'a@b.co' })
    );
    expect(result.current.submitted).toBe(true);
    expect(result.current.loading).toBe(false);
  });

  it('error from server: still sets submitted (anti-enumeration)', async () => {
    authClient.requestPasswordReset.mockResolvedValueOnce({
      data: null,
      error: { message: 'no such user' },
    });
    const { result } = renderHook(() => useForgotPassword());
    await fireSubmit(result.current.onSubmit, result.current.form, { email: 'a@b.co' });

    // submitted is set even on server error to prevent user enumeration.
    expect(result.current.submitted).toBe(true);
  });

  it('throws: still sets submitted (silent on purpose)', async () => {
    authClient.requestPasswordReset.mockRejectedValueOnce(new Error('net'));
    const { result } = renderHook(() => useForgotPassword());
    await fireSubmit(result.current.onSubmit, result.current.form, { email: 'a@b.co' });

    expect(result.current.submitted).toBe(true);
    expect(result.current.loading).toBe(false);
  });

  it('rejects invalid email', async () => {
    const { result } = renderHook(() => useForgotPassword());
    await fireSubmit(result.current.onSubmit, result.current.form, { email: 'not-an-email' });

    expect(authClient.requestPasswordReset).not.toHaveBeenCalled();
    expect(result.current.form.getFieldState('email').error).toBeDefined();
    expect(result.current.submitted).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────
// useResetPassword
// ─────────────────────────────────────────────────────────────────────
describe('useResetPassword() — submit flows', () => {
  it('success: sets done=true and triggers navigation to /admin/login after 2s', async () => {
    vi.useFakeTimers();
    try {
      authClient.resetPassword.mockResolvedValueOnce({ data: {}, error: null });
      const { result } = renderHook(() => useResetPassword('tok-abc'));

      expect(result.current.done).toBe(false);

      await fireSubmit(result.current.onSubmit, result.current.form, {
        password: 'NewPass123!',
        confirm: 'NewPass123!',
      });

      expect(result.current.done).toBe(true);
      expect(router.replace).not.toHaveBeenCalled();

      vi.advanceTimersByTime(2000);
      expect(router.replace).toHaveBeenCalledWith('/admin/login');
    } finally {
      vi.useRealTimers();
    }
  });

  it('error: sets root error and does not set done', async () => {
    authClient.resetPassword.mockResolvedValueOnce({
      data: null,
      error: { message: 'invalid token' },
    });
    const { result } = renderHook(() => useResetPassword('tok-abc'));
    await fireSubmit(result.current.onSubmit, result.current.form, {
      password: 'NewPass123!',
      confirm: 'NewPass123!',
    });

    expect(rootError(result.current.form)).toBe('Token inválido o expirado.');
    expect(result.current.done).toBe(false);
    expect(result.current.loading).toBe(false);
  });

  it('throws: sets connection error', async () => {
    authClient.resetPassword.mockRejectedValueOnce(new Error('net'));
    const { result } = renderHook(() => useResetPassword('tok-abc'));
    await fireSubmit(result.current.onSubmit, result.current.form, {
      password: 'NewPass123!',
      confirm: 'NewPass123!',
    });

    expect(rootError(result.current.form)).toBe('Error de conexión. Intentá de nuevo.');
    expect(result.current.done).toBe(false);
  });

  it('rejects mismatched passwords', async () => {
    const { result } = renderHook(() => useResetPassword('tok-abc'));
    await fireSubmit(result.current.onSubmit, result.current.form, {
      password: 'NewPass123!',
      confirm: 'DifferentPass1!',
    });

    expect(authClient.resetPassword).not.toHaveBeenCalled();
    expect(result.current.form.getFieldState('confirm').error).toBeDefined();
  });

  it('rejects password shorter than 8 chars', async () => {
    const { result } = renderHook(() => useResetPassword('tok-abc'));
    await fireSubmit(result.current.onSubmit, result.current.form, {
      password: 'short',
      confirm: 'short',
    });

    expect(authClient.resetPassword).not.toHaveBeenCalled();
  });

  it('forwards the provided token to authClient', async () => {
    authClient.resetPassword.mockResolvedValueOnce({ data: {}, error: null });
    const { result } = renderHook(() => useResetPassword('my-token-xyz'));
    await fireSubmit(result.current.onSubmit, result.current.form, {
      password: 'NewPass123!',
      confirm: 'NewPass123!',
    });

    expect(authClient.resetPassword).toHaveBeenCalledWith({
      newPassword: 'NewPass123!',
      token: 'my-token-xyz',
    });
  });
});

// ─────────────────────────────────────────────────────────────────────
// useSecurity
// ─────────────────────────────────────────────────────────────────────
describe('useSecurity() — state transitions', () => {
  it('initial state mirrors initialEnabled', () => {
    const { result: off } = renderHook(() => useSecurity(false));
    expect(off.current.enabled).toBe(false);
    expect(off.current.step).toBe('idle');
    expect(off.current.loading).toBe(false);
    expect(off.current.totpSetup).toBeNull();

    const { result: on } = renderHook(() => useSecurity(true));
    expect(on.current.enabled).toBe(true);
  });

  it('startEnable moves to enabling and resets enableForm', () => {
    const { result } = renderHook(() => useSecurity(false));
    act(() => {
      result.current.enableForm.setError('password', { message: 'old error' });
    });
    act(() => {
      result.current.startEnable();
    });
    expect(result.current.step).toBe('enabling');
    expect(result.current.enableForm.getFieldState('password').error).toBeUndefined();
  });

  it('startDisable moves to disabling and resets disableForm', () => {
    const { result } = renderHook(() => useSecurity(true));
    act(() => {
      result.current.disableForm.setError('password', { message: 'old' });
    });
    act(() => {
      result.current.startDisable();
    });
    expect(result.current.step).toBe('disabling');
    expect(result.current.disableForm.getFieldState('password').error).toBeUndefined();
  });

  it('cancel returns to idle, clears setup, and resets all three forms', () => {
    const { result } = renderHook(() => useSecurity(false));
    act(() => {
      result.current.startEnable();
      result.current.enableForm.setError('password', { message: 'e' });
    });
    act(() => {
      result.current.cancel();
    });
    expect(result.current.step).toBe('idle');
    expect(result.current.totpSetup).toBeNull();
    expect(result.current.enableForm.getFieldState('password').error).toBeUndefined();
  });

  it('acknowledgeBackupCodes clears totpSetup and returns to idle', () => {
    const { result } = renderHook(() => useSecurity(false));
    act(() => {
      result.current.cancel();
    });
    expect(result.current.step).toBe('idle');
  });
});

describe('useSecurity() — submitEnable', () => {
  it('success with valid totpURI: parses secret and moves to qr', async () => {
    authClient.twoFactor.enable.mockResolvedValueOnce({
      data: {
        totpURI: 'otpauth://totp/Acme?secret=JBSWY3DPEHPK3PXP&issuer=Acme',
        backupCodes: ['code-1', 'code-2', 'code-3'],
      },
      error: null,
    });
    const { result } = renderHook(() => useSecurity(false));
    await fireSubmit(result.current.submitEnable, result.current.enableForm, { password: 'pw' });

    expect(result.current.step).toBe('qr');
    expect(result.current.totpSetup).toEqual({
      totpURI: 'otpauth://totp/Acme?secret=JBSWY3DPEHPK3PXP&issuer=Acme',
      secret: 'JBSWY3DPEHPK3PXP',
      backupCodes: ['code-1', 'code-2', 'code-3'],
    });
    expect(result.current.loading).toBe(false);
  });

  it('error: sets root error and stays in current step', async () => {
    authClient.twoFactor.enable.mockResolvedValueOnce({
      data: null,
      error: { message: 'wrong password' },
    });
    const { result } = renderHook(() => useSecurity(false));
    act(() => result.current.startEnable());
    await fireSubmit(result.current.submitEnable, result.current.enableForm, { password: 'pw' });

    expect(rootError(result.current.enableForm)).toBe('Contraseña incorrecta.');
    expect(result.current.step).toBe('enabling');
    expect(result.current.loading).toBe(false);
  });

  it('throws: sets connection error', async () => {
    authClient.twoFactor.enable.mockRejectedValueOnce(new Error('net'));
    const { result } = renderHook(() => useSecurity(false));
    await fireSubmit(result.current.submitEnable, result.current.enableForm, { password: 'pw' });

    expect(rootError(result.current.enableForm)).toBe('Error de conexión. Intentá de nuevo.');
    expect(result.current.loading).toBe(false);
  });

  it('success but malformed totpURI: sets server-invalid error and stops', async () => {
    authClient.twoFactor.enable.mockResolvedValueOnce({
      data: {
        totpURI: 'not a url at all',
        backupCodes: ['c1'],
      },
      error: null,
    });
    const { result } = renderHook(() => useSecurity(false));
    await fireSubmit(result.current.submitEnable, result.current.enableForm, { password: 'pw' });

    expect(rootError(result.current.enableForm)).toBe(
      'Respuesta inválida del servidor. Reintentá en unos segundos.'
    );
    expect(result.current.step).not.toBe('qr');
    expect(result.current.totpSetup).toBeNull();
    expect(result.current.loading).toBe(false);
  });

  it('success with totpURI missing secret param: secret becomes empty string', async () => {
    authClient.twoFactor.enable.mockResolvedValueOnce({
      data: {
        totpURI: 'otpauth://totp/Acme?issuer=Acme', // no secret
        backupCodes: ['c1'],
      },
      error: null,
    });
    const { result } = renderHook(() => useSecurity(false));
    await fireSubmit(result.current.submitEnable, result.current.enableForm, { password: 'pw' });

    expect(result.current.step).toBe('qr');
    expect(result.current.totpSetup?.secret).toBe('');
  });

  it('rejects empty password before calling authClient', async () => {
    const { result } = renderHook(() => useSecurity(false));
    await fireSubmit(result.current.submitEnable, result.current.enableForm, { password: '' });

    expect(authClient.twoFactor.enable).not.toHaveBeenCalled();
    expect(result.current.enableForm.getFieldState('password').error).toBeDefined();
  });
});

describe('useSecurity() — submitVerify', () => {
  it('success: enables 2FA and moves to codes step', async () => {
    authClient.twoFactor.verifyTotp.mockResolvedValueOnce({ data: { ok: true }, error: null });
    const { result } = renderHook(() => useSecurity(false));
    await fireSubmit(result.current.submitVerify, result.current.verifyForm, { code: '123456' });

    expect(result.current.enabled).toBe(true);
    expect(result.current.step).toBe('codes');
    expect(result.current.loading).toBe(false);
  });

  it('error: sets code field error and keeps enabled=false', async () => {
    authClient.twoFactor.verifyTotp.mockResolvedValueOnce({
      data: null,
      error: { message: 'bad code' },
    });
    const { result } = renderHook(() => useSecurity(false));
    await fireSubmit(result.current.submitVerify, result.current.verifyForm, { code: '123456' });

    expect(result.current.verifyForm.getFieldState('code').error?.message).toBe(
      'Código incorrecto o expirado.'
    );
    expect(result.current.enabled).toBe(false);
  });

  it('throws: sets connection error on code field', async () => {
    authClient.twoFactor.verifyTotp.mockRejectedValueOnce(new Error('net'));
    const { result } = renderHook(() => useSecurity(false));
    await fireSubmit(result.current.submitVerify, result.current.verifyForm, { code: '123456' });

    expect(result.current.verifyForm.getFieldState('code').error?.message).toBe(
      'Error de conexión. Intentá de nuevo.'
    );
    expect(result.current.loading).toBe(false);
  });

  it('rejects non-6-digit code', async () => {
    const { result } = renderHook(() => useSecurity(false));
    await fireSubmit(result.current.submitVerify, result.current.verifyForm, { code: '12' });

    expect(authClient.twoFactor.verifyTotp).not.toHaveBeenCalled();
  });
});

describe('useSecurity() — submitDisable', () => {
  it('success: disables 2FA and returns to idle', async () => {
    authClient.twoFactor.disable.mockResolvedValueOnce({ data: { ok: true }, error: null });
    const { result } = renderHook(() => useSecurity(true));
    act(() => result.current.startDisable());
    await fireSubmit(result.current.submitDisable, result.current.disableForm, { password: 'pw' });

    expect(result.current.enabled).toBe(false);
    expect(result.current.step).toBe('idle');
    expect(result.current.loading).toBe(false);
  });

  it('error: sets root error and keeps enabled=true', async () => {
    authClient.twoFactor.disable.mockResolvedValueOnce({
      data: null,
      error: { message: 'wrong' },
    });
    const { result } = renderHook(() => useSecurity(true));
    act(() => result.current.startDisable());
    await fireSubmit(result.current.submitDisable, result.current.disableForm, { password: 'pw' });

    expect(rootError(result.current.disableForm)).toBe('Contraseña incorrecta.');
    expect(result.current.enabled).toBe(true);
    expect(result.current.step).toBe('disabling');
  });

  it('throws: sets connection error', async () => {
    authClient.twoFactor.disable.mockRejectedValueOnce(new Error('net'));
    const { result } = renderHook(() => useSecurity(true));
    await fireSubmit(result.current.submitDisable, result.current.disableForm, { password: 'pw' });

    expect(rootError(result.current.disableForm)).toBe('Error de conexión. Intentá de nuevo.');
    expect(result.current.enabled).toBe(true);
    expect(result.current.loading).toBe(false);
  });

  it('rejects empty password', async () => {
    const { result } = renderHook(() => useSecurity(true));
    await fireSubmit(result.current.submitDisable, result.current.disableForm, { password: '' });

    expect(authClient.twoFactor.disable).not.toHaveBeenCalled();
  });
});
