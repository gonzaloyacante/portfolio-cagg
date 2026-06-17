'use client';

import { Sliders } from 'lucide-react';

import { FieldHelp, SectionHelp } from '@/components/admin/FieldHelp';
import { SectionGroup } from '@/components/admin/SectionGroup';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { type SystemSettingsValues, useSystemSettingsForm } from '@/hooks/use-system-settings-form';

type SystemSettingsFormProps = {
  initial: SystemSettingsValues;
};

export function SystemSettingsForm({ initial }: SystemSettingsFormProps) {
  const { form, onSubmit, status } = useSystemSettingsForm(initial);

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="space-y-5">
        <SectionHelp
          title="¿Qué es esta sección?"
          description="Opciones generales que controlan el comportamiento del sitio público. Un solo switch por ahora."
          appearsIn="Afecta la sección de Contacto del sitio público."
        />

        <SectionGroup
          icon={<Sliders size={14} />}
          title="Disponibilidad del sitio"
          description="Configurá cómo se muestra el sitio público respecto a tu disponibilidad."
        >
          <FormField
            control={form.control}
            name="acceptingProjects"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between gap-4 space-y-0">
                <div className="space-y-0.5">
                  <FormLabel className="text-sm font-semibold tracking-tight">
                    Disponible para nuevos proyectos
                  </FormLabel>
                  <p className="text-muted-foreground text-xs">
                    Activá esto cuando estés disponible para tomar nuevos clientes.
                  </p>
                </div>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />
          <FieldHelp
            description="Si está activo, tu sitio muestra que estás disponible para tomar nuevos clientes."
            appearsIn="Sección de Contacto (muestra u oculta el mensaje de 'disponible para nuevos proyectos')."
            tips={[
              'Desactivá esto cuando estés muy ocupado o no quieras recibir consultas nuevas.',
            ]}
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
