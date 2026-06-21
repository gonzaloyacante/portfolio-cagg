import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { ResendMock, constructorSpy, sendSpy } = vi.hoisted(() => {
  const constructorSpy = vi.fn();
  const sendSpy = vi.fn();
  class ResendMock {
    emails = { send: sendSpy };
    constructor(key: string) {
      constructorSpy(key);
    }
  }
  return { ResendMock, constructorSpy, sendSpy };
});

vi.mock('resend', () => ({ Resend: ResendMock }));

describe('lib/resend.ts — sendPasswordResetEmail', () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    constructorSpy.mockClear();
    sendSpy.mockReset();
    vi.resetModules();
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    delete process.env.RESEND_API_KEY;
    consoleErrorSpy.mockRestore();
  });

  it('logs an error and returns silently when RESEND_API_KEY is missing', async () => {
    delete process.env.RESEND_API_KEY;
    const { sendPasswordResetEmail } = await import('@/lib/resend');
    await sendPasswordResetEmail({
      to: 'admin@example.com',
      from: 'noreply@example.com',
      resetUrl: 'https://example.com/reset?token=abc',
    });

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining('RESEND_API_KEY not configured')
    );
    expect(sendSpy).not.toHaveBeenCalled();
  });

  it('does not instantiate Resend when key is missing', async () => {
    delete process.env.RESEND_API_KEY;
    const { sendPasswordResetEmail } = await import('@/lib/resend');
    await sendPasswordResetEmail({
      to: 'a@b.co',
      from: 'c@d.co',
      resetUrl: 'https://e.co/r',
    });
    expect(constructorSpy).not.toHaveBeenCalled();
  });

  it('sends the email when API key is present', async () => {
    process.env.RESEND_API_KEY = 're_test_key';
    sendSpy.mockResolvedValueOnce({ data: { id: 'msg_1' }, error: null });
    const { sendPasswordResetEmail } = await import('@/lib/resend');
    await sendPasswordResetEmail({
      to: 'admin@example.com',
      from: 'noreply@example.com',
      resetUrl: 'https://example.com/reset?token=xyz',
    });

    expect(sendSpy).toHaveBeenCalledTimes(1);
    const args = sendSpy.mock.calls[0][0];
    expect(args.from).toBe('noreply@example.com');
    expect(args.to).toBe('admin@example.com');
    expect(args.subject).toBe('Restablecé tu contraseña — portfolio-cag');
  });

  it('includes the reset URL in the HTML body', async () => {
    process.env.RESEND_API_KEY = 're_test_key';
    sendSpy.mockResolvedValueOnce({ data: { id: 'msg' }, error: null });
    const { sendPasswordResetEmail } = await import('@/lib/resend');
    await sendPasswordResetEmail({
      to: 'a@b.co',
      from: 'c@d.co',
      resetUrl: 'https://example.com/reset?token=secret123',
    });

    const html = sendSpy.mock.calls[0][0].html;
    expect(html).toContain('https://example.com/reset?token=secret123');
    expect(html).toContain('Restablecer contraseña');
  });

  it('HTML-escapes the recipient email (XSS prevention)', async () => {
    process.env.RESEND_API_KEY = 're_test_key';
    sendSpy.mockResolvedValueOnce({ data: { id: 'msg' }, error: null });
    const { sendPasswordResetEmail } = await import('@/lib/resend');
    // Malicious email trying to inject HTML.
    await sendPasswordResetEmail({
      to: '"><script>alert(1)</script>@evil.co',
      from: 'c@d.co',
      resetUrl: 'https://e.co/r',
    });

    const html = sendSpy.mock.calls[0][0].html;
    expect(html).not.toContain('<script>alert(1)</script>');
    expect(html).toContain('&lt;script&gt;');
  });

  it('HTML-escapes the reset URL (XSS prevention)', async () => {
    process.env.RESEND_API_KEY = 're_test_key';
    sendSpy.mockResolvedValueOnce({ data: { id: 'msg' }, error: null });
    const { sendPasswordResetEmail } = await import('@/lib/resend');
    // Malicious URL trying to inject HTML via the link href.
    const evilUrl = 'https://e.co/r?x="><img src=x onerror=alert(1)>';
    await sendPasswordResetEmail({
      to: 'a@b.co',
      from: 'c@d.co',
      resetUrl: evilUrl,
    });

    const html = sendSpy.mock.calls[0][0].html;
    // Raw onerror= should not appear; escaped form should.
    expect(html).not.toContain('onerror=alert(1)>');
    expect(html).toContain('&lt;img');
  });

  it('mentions the 1-hour expiration window', async () => {
    process.env.RESEND_API_KEY = 're_test_key';
    sendSpy.mockResolvedValueOnce({ data: { id: 'msg' }, error: null });
    const { sendPasswordResetEmail } = await import('@/lib/resend');
    await sendPasswordResetEmail({
      to: 'a@b.co',
      from: 'c@d.co',
      resetUrl: 'https://e.co/r',
    });

    expect(sendSpy.mock.calls[0][0].html).toMatch(/vence.*1 hora/i);
  });

  it('includes a plain-text fallback with the URL', async () => {
    process.env.RESEND_API_KEY = 're_test_key';
    sendSpy.mockResolvedValueOnce({ data: { id: 'msg' }, error: null });
    const { sendPasswordResetEmail } = await import('@/lib/resend');
    await sendPasswordResetEmail({
      to: 'a@b.co',
      from: 'c@d.co',
      resetUrl: 'https://e.co/reset?t=fallback',
    });

    expect(sendSpy.mock.calls[0][0].html).toContain('https://e.co/reset?t=fallback');
  });

  it('catches and logs errors from resend.emails.send (no rethrow)', async () => {
    process.env.RESEND_API_KEY = 're_test_key';
    sendSpy.mockRejectedValueOnce(new Error('Resend 500'));
    const { sendPasswordResetEmail } = await import('@/lib/resend');

    // The promise should resolve (not reject) so the caller (Better Auth)
    // doesn't surface a 500 to the user — anti-enumeration.
    await expect(
      sendPasswordResetEmail({
        to: 'a@b.co',
        from: 'c@d.co',
        resetUrl: 'https://e.co/r',
      })
    ).resolves.toBeUndefined();

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining('password reset email failed'),
      expect.any(Error)
    );
  });

  it('catches and logs non-Error throws', async () => {
    process.env.RESEND_API_KEY = 're_test_key';
    sendSpy.mockRejectedValueOnce('plain string error');
    const { sendPasswordResetEmail } = await import('@/lib/resend');

    await sendPasswordResetEmail({
      to: 'a@b.co',
      from: 'c@d.co',
      resetUrl: 'https://e.co/r',
    });

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining('password reset email failed'),
      'plain string error'
    );
  });

  it('does not log when send succeeds', async () => {
    process.env.RESEND_API_KEY = 're_test_key';
    sendSpy.mockResolvedValueOnce({ data: { id: 'msg' }, error: null });
    const { sendPasswordResetEmail } = await import('@/lib/resend');

    await sendPasswordResetEmail({
      to: 'a@b.co',
      from: 'c@d.co',
      resetUrl: 'https://e.co/r',
    });

    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it('still uses Resend instance even if email fields contain HTML-special chars in the body', async () => {
    process.env.RESEND_API_KEY = 're_test_key';
    sendSpy.mockResolvedValueOnce({ data: { id: 'msg' }, error: null });
    const { sendPasswordResetEmail } = await import('@/lib/resend');
    await sendPasswordResetEmail({
      to: 'a@b.co',
      from: 'c@d.co',
      resetUrl: 'https://e.co/r?ref=<test>',
    });

    // The raw <test> in the URL must not be rendered as HTML.
    const html = sendSpy.mock.calls[0][0].html;
    expect(html).toContain('&lt;test&gt;');
  });

  it('uses a non-empty subject line', async () => {
    process.env.RESEND_API_KEY = 're_test_key';
    sendSpy.mockResolvedValueOnce({ data: { id: 'msg' }, error: null });
    const { sendPasswordResetEmail } = await import('@/lib/resend');
    await sendPasswordResetEmail({
      to: 'a@b.co',
      from: 'c@d.co',
      resetUrl: 'https://e.co/r',
    });

    expect(sendSpy.mock.calls[0][0].subject.length).toBeGreaterThan(5);
  });
});
