'use client';

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

const FIELDS: { name: keyof ContactInfoFormValues; label: string; type?: string }[] = [
  { name: 'name', label: 'Nombre completo' },
  { name: 'phoneDisplay', label: 'Teléfono (texto visible)' },
  { name: 'whatsappNumber', label: 'Número WhatsApp (con código de país)' },
  { name: 'email', label: 'Email', type: 'email' },
  { name: 'linkedinUrl', label: 'LinkedIn URL', type: 'url' },
  { name: 'linkedinHandle', label: 'LinkedIn Handle' },
  { name: 'location', label: 'Ubicación' },
];

export function ContactInfoForm({ initial }: ContactInfoFormProps) {
  const { form, onSubmit, status } = useContactInfoForm(initial);

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="space-y-5">
        {FIELDS.map(({ name, label, type }) => (
          <FormField
            key={name}
            control={form.control}
            name={name}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{label}</FormLabel>
                <FormControl>
                  <Input type={type ?? 'text'} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ))}

        <div className="flex items-center gap-4 pt-2">
          <Button type="submit" disabled={status === 'saving'}>
            {status === 'saving' ? 'Guardando…' : 'Guardar'}
          </Button>
          {status === 'success' && (
            <span className="text-sm text-green-600">Guardado correctamente.</span>
          )}
          {status === 'error' && (
            <span className="text-destructive text-sm">Error al guardar.</span>
          )}
        </div>
      </form>
    </Form>
  );
}
