'use client';

import { Tag, Type, AlignLeft } from 'lucide-react';

import { BilingualField } from '@/components/admin/BilingualField';
import { FieldHelp, SectionHelp } from '@/components/admin/FieldHelp';
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
      <form onSubmit={onSubmit} className="space-y-5">
        <SectionHelp
          title={`Sección: /${slug}`}
          description="Personalizá el eyebrow (etiqueta arriba), título y descripción de esta sección de la landing."
          appearsIn="Encabezado de la sección correspondiente en la landing pública."
          tips={[
            'El eyebrow es la etiqueta corta arriba del título (ej: "Servicios").',
            'El título es el encabezado principal.',
            'La descripción es un párrafo introductorio debajo del título.',
          ]}
        />

        <BilingualField
          label="Overline (etiqueta arriba del título)"
          icon={<Tag size={12} />}
          description="La etiqueta chiquita arriba del título de la sección. Es lo primero que se ve."
        >
          <FormField
            control={form.control}
            name="overlineEs"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-mono text-[10px] tracking-[0.18em] uppercase">
                  Español
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Servicios"
                    className="admin-focus-ring border-border bg-background/40 h-10 rounded-[var(--admin-radius)]"
                    {...field}
                  />
                </FormControl>
                <FieldHelp
                  description="Etiqueta corta en español."
                  appearsIn="Arriba del título de la sección."
                />
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="overlineEn"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-mono text-[10px] tracking-[0.18em] uppercase">
                  English
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Services"
                    className="admin-focus-ring border-border bg-background/40 h-10 rounded-[var(--admin-radius)]"
                    {...field}
                  />
                </FormControl>
                <FieldHelp description="Etiqueta corta en inglés." />
                <FormMessage />
              </FormItem>
            )}
          />
        </BilingualField>

        <BilingualField
          label="Título principal"
          icon={<Type size={12} />}
          description="El encabezado principal de la sección."
        >
          <FormField
            control={form.control}
            name="titleEs"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-mono text-[10px] tracking-[0.18em] uppercase">
                  Español
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Lo que hago"
                    className="admin-focus-ring border-border bg-background/40 h-10 rounded-[var(--admin-radius)]"
                    {...field}
                  />
                </FormControl>
                <FieldHelp description="Título en español." appearsIn="Encabezado de la sección." />
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="titleEn"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-mono text-[10px] tracking-[0.18em] uppercase">
                  English
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="What I do"
                    className="admin-focus-ring border-border bg-background/40 h-10 rounded-[var(--admin-radius)]"
                    {...field}
                  />
                </FormControl>
                <FieldHelp description="Título en inglés." />
                <FormMessage />
              </FormItem>
            )}
          />
        </BilingualField>

        <BilingualField
          label="Descripción (subtítulo)"
          icon={<AlignLeft size={12} />}
          description="Texto introductorio debajo del título. Es lo que lee la gente para entender de qué va la sección."
        >
          <FormField
            control={form.control}
            name="descEs"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-mono text-[10px] tracking-[0.18em] uppercase">
                  Español
                </FormLabel>
                <FormControl>
                  <Textarea
                    rows={3}
                    placeholder="Descripción de la sección…"
                    className="admin-focus-ring border-border bg-background/40 min-h-[100px] resize-y rounded-[var(--admin-radius)]"
                    {...field}
                  />
                </FormControl>
                <FieldHelp
                  description="Descripción en español."
                  appearsIn="Debajo del título de la sección."
                />
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="descEn"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-mono text-[10px] tracking-[0.18em] uppercase">
                  English
                </FormLabel>
                <FormControl>
                  <Textarea
                    rows={3}
                    placeholder="Section description…"
                    className="admin-focus-ring border-border bg-background/40 min-h-[100px] resize-y rounded-[var(--admin-radius)]"
                    {...field}
                  />
                </FormControl>
                <FieldHelp description="Descripción en inglés." />
                <FormMessage />
              </FormItem>
            )}
          />
        </BilingualField>

        <div className="admin-glass border-border sticky bottom-0 z-10 flex items-center justify-between gap-3 rounded-[var(--admin-radius-lg)] border px-4 py-3 backdrop-blur-md">
          <div className="text-xs">
            {status === 'success' && (
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="admin-status-dot" />
                Guardado. La sección ya muestra los cambios en la landing.
              </span>
            )}
            {status === 'error' && <span className="text-destructive">Error al guardar.</span>}
            {status === 'idle' && (
              <span className="text-muted-foreground">
                Al guardar, la sección se actualiza en la landing pública.
              </span>
            )}
          </div>
          <Button
            type="submit"
            size="sm"
            disabled={status === 'saving'}
            className="admin-glow gap-1.5"
          >
            {status === 'saving' ? 'Guardando…' : 'Guardar cambios'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
