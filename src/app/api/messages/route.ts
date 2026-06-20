import { NextResponse } from 'next/server';

import { escapeHtml } from '@/lib/escape-html';
import { prisma } from '@/lib/prisma';
import { clientKey, rateLimit } from '@/lib/rate-limit';
import { getResend } from '@/lib/resend';
import { contactMessageSchema } from '@/validations/message';

export async function POST(req: Request) {
  // Per-IP rate limit. 5 requests / 10 min with a 2-request burst.
  // Returns 429 (with Retry-After) on the limit being hit.
  const limit = rateLimit(`messages:${clientKey(req)}`);
  if (!limit.ok) {
    return NextResponse.json(
      { error: 'Too many requests' },
      {
        status: 429,
        headers: {
          'Retry-After': Math.ceil(limit.retryAfterMs / 1000).toString(),
        },
      }
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = contactMessageSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid data', issues: parsed.error.issues },
      { status: 422 }
    );
  }

  const { name, email, phone, message, website } = parsed.data;

  // Honeypot: bots fill the hidden `website` field, real users don't.
  // Return success so the bot's script doesn't retry or report failure.
  if (website !== undefined && website !== '') {
    return NextResponse.json({ success: true });
  }

  await prisma.contactMessage.create({
    data: { name, email, phone, message },
  });

  const notifSettings = await prisma.setting.findMany({
    where: { key: { in: ['notification_email', 'notifications_enabled'] } },
  });
  const byKey = Object.fromEntries(notifSettings.map((s) => [s.key, s.value]));
  const notificationsEnabled = byKey.notifications_enabled !== 'false';
  const toEmail = byKey.notification_email || process.env.ADMIN_EMAIL;
  const fromEmail = process.env.RESEND_FROM_EMAIL;

  const resend = getResend();
  if (notificationsEnabled && toEmail && fromEmail && resend) {
    // Escape user-controlled fields before injecting them into the
    // HTML body. Otherwise a payload like `<img src=x onerror=...>`
    // executes in the admin's webmail client when they open the
    // notification. Newlines in `message` are converted to <br/>
    // AFTER escaping so the <br/> tags are kept as markup rather
    // than being escaped themselves.
    await resend.emails
      .send({
        from: fromEmail,
        to: toEmail,
        subject: `Nuevo mensaje de ${escapeHtml(name)}`,
        html:
          `<p><strong>Nombre:</strong> ${escapeHtml(name)}</p>` +
          `<p><strong>Email:</strong> ${escapeHtml(email)}</p>` +
          (phone ? `<p><strong>Teléfono:</strong> ${escapeHtml(phone)}</p>` : '') +
          `<hr/><p>${escapeHtml(message).replace(/\n/g, '<br/>')}</p>`,
      })
      .catch(() => null);
  }

  return NextResponse.json({ success: true });
}
