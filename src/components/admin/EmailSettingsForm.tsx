'use client';

import { Bell, Mail } from 'lucide-react';

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
import { Switch } from '@/components/ui/switch';
import { type EmailSettingsValues, useEmailSettingsForm } from '@/hooks/use-email-settings-form';

type EmailSettingsFormProps = {
  initial: EmailSettingsValues;
};

export function EmailSettingsForm({ initial }: EmailSettingsFormProps) {
  const { form, onSubmit, status } = useEmailSettingsForm(initial);

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="space-y-5">
        <SectionHelp
          title="¿Qué es esta sección?"
          description="Configurá a qué email te llega un aviso cada vez que alguien completa el formulario de contacto del sitio público."
          appearsIn="Afecta los emails automáticos que te llegan cuando alguien te escribe desde el sitio."
        />

        <SectionGroup
          icon={<Bell size={14} />}
          title="Notificaciones por email"
          description="Recibí un email cada vez que alguien complete el formulario de contacto."
        >
          <FormField
            control={form.control}
            name="notificationsEnabled"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between gap-4 space-y-0">
                <div className="space-y-0.5">
                  <FormLabel className="text-sm font-semibold tracking-tight">
                    Activar notificaciones
                  </FormLabel>
                  <p className="text-muted-foreground text-xs">
                    Cuando esté activo, te enviamos un email por cada mensaje nuevo.
                  </p>
                </div>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="notificationEmail"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center gap-2">
                  <Mail size={12} className="text-muted-foreground" />
                  <FormLabel className="text-xs font-semibold tracking-tight">
                    Email de notificación
                  </FormLabel>
                </div>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="carlos@ejemplo.com"
                    disabled={!form.watch('notificationsEnabled')}
                    className="admin-focus-ring border-border bg-background/40 h-10 rounded-[var(--admin-radius)] disabled:opacity-50"
                    {...field}
                  />
                </FormControl>
                <FieldHelp
                  description="A qué email te llega el aviso. Puede ser distinto al email público del sitio."
                  appearsIn="Campo Para de los emails automáticos que se envían."
                  tips={[
                    'Si lo dejás vacío, no se envían notificaciones (incluso si está activo).',
                  ]}
                />
                <FormMessage />
              </FormItem>
            )}
          />
        </SectionGroup>

        <div className="admin-glass border-border sticky bottom-0 z-10 flex items-center justify-between gap-3 rounded-[var(--admin-radius-lg)] border px-4 py-3 backdrop-blur-md">
          <div className="text-xs">
            {status === 'success' && (
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="admin-status-dot" />
                Guardado.
              </span>
            )}
            {status === 'error' && <span className="text-destructive">Error al guardar.</span>}
            {status === 'idle' && (
              <span className="text-muted-foreground">Los cambios se aplican al guardar.</span>
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
