'use client';

import { BilingualField } from '@/components/admin/BilingualField';
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
import { Textarea } from '@/components/ui/textarea';
import { type SectionMetaFormValues, useSectionMetaForm } from '@/hooks/use-section-meta-form';

type SectionMetaFormProps = {
  slug: string;
  initial: SectionMetaFormValues;
};

export function SectionMetaForm({ slug, initial }: SectionMetaFormProps) {
  const { form, onSubmit, status } = useSectionMetaForm(slug, initial);

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="space-y-6">
        <BilingualField label="Overline">
          <FormField
            control={form.control}
            name="overlineEs"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Español</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="overlineEn"
            render={({ field }) => (
              <FormItem>
                <FormLabel>English</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </BilingualField>

        <BilingualField label="Título">
          <FormField
            control={form.control}
            name="titleEs"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Español</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="titleEn"
            render={({ field }) => (
              <FormItem>
                <FormLabel>English</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </BilingualField>

        <BilingualField label="Descripción">
          <FormField
            control={form.control}
            name="descEs"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Español</FormLabel>
                <FormControl>
                  <Textarea rows={3} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="descEn"
            render={({ field }) => (
              <FormItem>
                <FormLabel>English</FormLabel>
                <FormControl>
                  <Textarea rows={3} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </BilingualField>

        <div className="flex items-center gap-4">
          <Button type="submit" size="sm" disabled={status === 'saving'}>
            {status === 'saving' ? 'Guardando…' : 'Guardar'}
          </Button>
          {status === 'success' && <span className="text-sm text-green-600">Guardado.</span>}
          {status === 'error' && (
            <span className="text-destructive text-sm">Error al guardar.</span>
          )}
        </div>
      </form>
    </Form>
  );
}
