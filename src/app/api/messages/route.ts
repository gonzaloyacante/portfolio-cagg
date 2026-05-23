import { NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';
import { resend } from '@/lib/resend';
import { contactMessageSchema } from '@/validations/message';

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = contactMessageSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid data', issues: parsed.error.issues },
      { status: 422 }
    );
  }

  const { name, email, phone, message, website } = parsed.data;

  if (website !== undefined && website !== '') {
    return NextResponse.json({ success: true });
  }

  await prisma.contactMessage.create({
    data: { name, email, phone, message },
  });

  const adminEmail = process.env.ADMIN_EMAIL;
  const fromEmail = process.env.RESEND_FROM_EMAIL;
  if (adminEmail && fromEmail) {
    await resend.emails
      .send({
        from: fromEmail,
        to: adminEmail,
        subject: `Nuevo mensaje de ${name}`,
        html: `<p><strong>Nombre:</strong> ${name}</p><p><strong>Email:</strong> ${email}</p>${phone ? `<p><strong>Teléfono:</strong> ${phone}</p>` : ''}<hr/><p>${message.replace(/\n/g, '<br/>')}</p>`,
      })
      .catch(() => null);
  }

  return NextResponse.json({ success: true });
}
