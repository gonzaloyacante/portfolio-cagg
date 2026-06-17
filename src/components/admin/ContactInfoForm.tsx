'use client';

import { Mail, MapPin, Phone, User } from 'lucide-react';

import { FieldHelp, SectionHelp } from '@/components/admin/FieldHelp';
import { SectionGroup } from '@/components/admin/SectionGroup';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { type ContactInfoFormValues, useContactInfoForm } from '@/hooks/use-contact-info-form';

type ContactInfoFormProps = {
  initial: ContactInfoFormValues;
};

const FIELDS: {
  name: keyof ContactInfoFormValues;
  label: string;
  type?: string;
  icon: React.ReactNode;
  placeholder?: string;
  description: string;
  appearsIn?: string;
  tips?: string[];
}[] = [
  {
    name: 'name',
    label: 'Nombre completo',
    type: 'text',
    icon: <User size={12} />,
    placeholder: 'Carlos Armando Guerra',
    description: 'Tu nombre tal como querés que aparezca en el sitio.',
    appearsIn: 'Header, footer y sección de Contacto.',
  },
  {
    name: 'phoneDisplay',
    label: 'Teléfono (cómo se muestra)',
    type: 'tel',
    icon: <Phone size={12} />,
    placeholder: '+54 9 11 5555 5555',
    description: 'Cómo se ve el teléfono en el sitio (con espacios, guiones, código de país).',
    appearsIn: 'Footer y header (versión mobile).',
    tips: ['Ejemplo: "+54 9 11 5555 5555" o "+1 (555) 123-4567".'],
  },
  {
    name: 'whatsappNumber',
    label: 'Número de WhatsApp (técnico)',
    type: 'tel',
    icon: <Phone size={12} />,
    placeholder: '5491155555555',
    description:
      'El número real al que abre WhatsApp. Sin espacios ni símbolos, con código de país.',
    appearsIn: 'Botón flotante de WhatsApp, botón del Hero y sección de Contacto.',
    tips: [
      'Para Argentina: 5491155555555 (549 = país + celular).',
      'Para España: 34612345678.',
      'Distinto de "phoneDisplay": este es el número técnico, el otro es el visual.',
    ],
  },
  {
    name: 'email',
    label: 'Email',
    type: 'email',
    icon: <Mail size={12} />,
    placeholder: 'carlos@ejemplo.com',
    description: 'Tu email de contacto público.',
    appearsIn: 'Header, footer, sección de Contacto y botón de email del Hero.',
  },
  {
    name: 'linkedinUrl',
    label: 'LinkedIn URL',
    type: 'url',
    icon: <Mail size={12} />,
    placeholder: 'https://linkedin.com/in/carlos-guerra',
    description: 'La URL completa de tu perfil de LinkedIn.',
    appearsIn: 'Header, footer, sección de Contacto y botón de LinkedIn del Hero.',
    tips: ['Copiá la URL desde la barra de direcciones de LinkedIn.'],
  },
  {
    name: 'linkedinHandle',
    label: 'LinkedIn Handle',
    type: 'text',
    icon: <User size={12} />,
    placeholder: '@carlos-guerra',
    description:
      'Tu usuario de LinkedIn (lo que va después de la @). Es el texto que se muestra en el link.',
    appearsIn: 'Display text del link de LinkedIn (no la URL).',
  },
  {
    name: 'location',
    label: 'Ubicación',
    type: 'text',
    icon: <MapPin size={12} />,
    placeholder: 'Buenos Aires, Argentina',
    description: 'Tu ciudad / país. Aparece como "basado en" en la sección de Contacto.',
    appearsIn: 'Sección de Contacto, debajo del email.',
  },
];

export function ContactInfoForm({ initial }: ContactInfoFormProps) {
  const { form, onSubmit, status } = useContactInfoForm(initial);

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="space-y-5">
        <SectionHelp
          title="¿Qué es esta sección?"
          description="Toda tu información de contacto en un solo lugar. Cuando edites un campo, se actualiza automáticamente en el header, el footer, la sección de Contacto, y el botón flotante de WhatsApp."
          appearsIn="Header, footer, sección de Contacto, Hero y botón flotante de WhatsApp."
        />

        <SectionGroup
          icon={<User size={14} />}
          title="Datos de contacto"
          description="Editá tu información de contacto. Se refleja en todos los lugares del sitio público."
        >
          {FIELDS.map(({ name, label, type, icon, placeholder, description, appearsIn, tips }) => (
            <FormField
              key={name}
              control={form.control}
              name={name}
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">{icon}</span>
                    <FormLabel className="text-xs font-semibold tracking-tight">{label}</FormLabel>
                  </div>
                  <FormControl>
                    <Input
                      type={type ?? 'text'}
                      placeholder={placeholder}
                      className="admin-focus-ring border-border bg-background/40 h-10 rounded-[var(--admin-radius)]"
                      {...field}
                    />
                  </FormControl>
                  <FieldHelp description={description} appearsIn={appearsIn} tips={tips} />
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}
        </SectionGroup>

        <div className="admin-glass border-border sticky bottom-0 z-10 flex items-center justify-between gap-3 rounded-[var(--admin-radius-lg)] border px-4 py-3 backdrop-blur-md">
          <div className="text-xs">
            {status === 'success' && (
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="admin-status-dot" />
                Guardado correctamente. Los datos ya se ven en el sitio.
              </span>
            )}
            {status === 'error' && <span className="text-destructive">Error al guardar.</span>}
            {status === 'idle' && (
              <span className="text-muted-foreground">
                Al guardar, los cambios se reflejan en todo el sitio.
              </span>
            )}
          </div>
          <Button type="submit" disabled={status === 'saving'} className="admin-glow gap-1.5">
            {status === 'saving' ? 'Guardando…' : 'Guardar cambios'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
