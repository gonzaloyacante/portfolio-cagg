import { Resend } from 'resend';

import { escapeHtml } from '@/lib/escape-html';

let _resend: Resend | null = null;

export function getResend(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null;
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY);
  return _resend;
}

/**
 * Sends the password-reset email. Better-Auth calls this from its
 * `/forget-password` endpoint when configured via
 * `emailAndPassword.sendResetPassword`.
 *
 * Returns silently on failure — Better-Auth always returns success to
 * the client (anti-enumeration). The error is logged so an operator
 * can spot Resend misconfigs.
 */
export async function sendPasswordResetEmail({
  to,
  from,
  resetUrl,
}: {
  to: string;
  from: string;
  resetUrl: string;
}): Promise<void> {
  const resend = getResend();
  if (!resend) {
    console.error('[resend] RESEND_API_KEY not configured; cannot send password reset email');
    return;
  }
  const safeTo = escapeHtml(to);
  const safeUrl = escapeHtml(resetUrl);
  try {
    await resend.emails.send({
      from,
      to,
      subject: 'Restablecé tu contraseña — portfolio-cag',
      html: `
        <p>Recibimos una solicitud para restablecer la contraseña de la cuenta del panel
        administrativo asociada a ${safeTo}.</p>
        <p>Hacé clic en el siguiente enlace para definir una nueva contraseña. El enlace
        vence en 1 hora.</p>
        <p><a href="${safeUrl}" style="display:inline-block;padding:10px 16px;background:#111;color:#fff;text-decoration:none;border-radius:6px">Restablecer contraseña</a></p>
        <p style="color:#666;font-size:12px">Si no solicitaste este cambio, podés ignorar este correo.
        Si no funciona el botón, copiá y pegá este enlace: ${safeUrl}</p>
      `,
    });
  } catch (err) {
    console.error('[resend] password reset email failed', err);
  }
}
