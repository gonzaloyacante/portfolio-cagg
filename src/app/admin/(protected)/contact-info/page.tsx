import { notFound } from 'next/navigation';
import { connection } from 'next/server';
import { Suspense } from 'react';

import { ContactInfoForm } from '@/components/admin/ContactInfoForm';
import { prisma } from '@/lib/prisma';

async function ContactInfoContent() {
  await connection();
  const contactInfo = await prisma.contactInfo.findFirst();

  if (!contactInfo) notFound();

  const initial = {
    name: contactInfo.name,
    phoneDisplay: contactInfo.phoneDisplay,
    whatsappNumber: contactInfo.whatsappNumber,
    email: contactInfo.email,
    linkedinUrl: contactInfo.linkedinUrl,
    linkedinHandle: contactInfo.linkedinHandle,
    location: contactInfo.location,
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-label tracking-label text-muted-foreground mb-1 font-mono uppercase">
          Contenido · Datos de contacto
        </p>
        <h1 className="text-foreground text-xl font-semibold">Datos de contacto</h1>
      </div>
      <ContactInfoForm initial={initial} />
    </div>
  );
}

export default function ContactInfoPage() {
  return (
    <Suspense fallback={null}>
      <ContactInfoContent />
    </Suspense>
  );
}
