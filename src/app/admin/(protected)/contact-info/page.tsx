import { notFound } from 'next/navigation';
import { connection } from 'next/server';
import { Suspense } from 'react';

import { MessageSquareQuote } from 'lucide-react';

import { ContactInfoForm } from '@/components/admin/ContactInfoForm';
import { PageHeader } from '@/components/admin/PageHeader';
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
    <div className="space-y-7">
      <PageHeader
        eyebrowIcon={<MessageSquareQuote size={11} />}
        eyebrow="Contenido · Datos de contacto"
        title="Datos de contacto"
        description="Tu nombre, email, teléfono, WhatsApp y LinkedIn. Se muestran en el header, el footer y la sección de Contacto. Al editar un campo acá, se actualiza automáticamente en todos lados."
        previewUrl="/#contact"
        previewLabel="Ver Contacto en vivo"
      />
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
