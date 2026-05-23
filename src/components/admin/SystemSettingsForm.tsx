'use client';

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
      <form onSubmit={onSubmit} className="space-y-6">
        <FormField
          control={form.control}
          name="acceptingProjects"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center gap-4 space-y-0">
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
              <div>
                <FormLabel className="font-normal">Disponible para nuevos proyectos</FormLabel>
                <p className="text-muted-foreground mt-0.5 text-xs">
                  Activá esto cuando estés disponible para tomar nuevos clientes.
                </p>
              </div>
            </FormItem>
          )}
        />

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
