'use client';

import { Plus, Trash2 } from 'lucide-react';

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
import { type HeroFormValues, useHeroForm } from '@/hooks/use-hero-form';

type HeroFormProps = {
  initial: HeroFormValues;
};

export function HeroForm({ initial }: HeroFormProps) {
  const { form, fields, addStat, remove, onSubmit, status } = useHeroForm(initial);

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="space-y-10">
        {/* Identificación */}
        <section className="space-y-6">
          <h2 className="text-foreground border-border border-b pb-2 text-sm font-semibold">
            Identificación
          </h2>

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

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </section>

        {/* Contenido principal */}
        <section className="space-y-6">
          <h2 className="text-foreground border-border border-b pb-2 text-sm font-semibold">
            Contenido principal
          </h2>

          <BilingualField label="Titular">
            <FormField
              control={form.control}
              name="headlineEs"
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
              name="headlineEn"
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

          <BilingualField label="Resumen">
            <FormField
              control={form.control}
              name="summaryEs"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Español</FormLabel>
                  <FormControl>
                    <Textarea rows={4} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="summaryEn"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>English</FormLabel>
                  <FormControl>
                    <Textarea rows={4} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </BilingualField>
        </section>

        {/* CTAs */}
        <section className="space-y-6">
          <h2 className="text-foreground border-border border-b pb-2 text-sm font-semibold">
            Botones de acción
          </h2>

          <BilingualField label="WhatsApp">
            <FormField
              control={form.control}
              name="ctaWhatsappEs"
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
              name="ctaWhatsappEn"
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

          <BilingualField label="Email">
            <FormField
              control={form.control}
              name="ctaEmailEs"
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
              name="ctaEmailEn"
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

          <BilingualField label="LinkedIn">
            <FormField
              control={form.control}
              name="ctaLinkedinEs"
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
              name="ctaLinkedinEn"
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
        </section>

        {/* Stats */}
        <section className="space-y-4">
          <h2 className="text-foreground border-border border-b pb-2 text-sm font-semibold">
            Estadísticas
          </h2>

          {fields.map((field, index) => (
            <div key={field.id} className="border-border grid grid-cols-12 gap-3 border p-4">
              <div className="col-span-12 sm:col-span-3">
                <FormField
                  control={form.control}
                  name={`stats.${index}.value`}
                  render={({ field: f }) => (
                    <FormItem>
                      <FormLabel>Valor</FormLabel>
                      <FormControl>
                        <Input {...f} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="col-span-12 sm:col-span-4">
                <FormField
                  control={form.control}
                  name={`stats.${index}.labelEs`}
                  render={({ field: f }) => (
                    <FormItem>
                      <FormLabel>Etiqueta ES</FormLabel>
                      <FormControl>
                        <Input {...f} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="col-span-11 sm:col-span-4">
                <FormField
                  control={form.control}
                  name={`stats.${index}.labelEn`}
                  render={({ field: f }) => (
                    <FormItem>
                      <FormLabel>Etiqueta EN</FormLabel>
                      <FormControl>
                        <Input {...f} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="col-span-1 flex items-end pb-0.5">
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="text-muted-foreground hover:text-destructive transition-colors"
                  aria-label="Eliminar estadística"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}

          <Button type="button" variant="outline" size="sm" onClick={addStat} className="gap-2">
            <Plus size={14} /> Agregar estadística
          </Button>
        </section>

        {/* Submit */}
        <div className="flex items-center gap-4">
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
