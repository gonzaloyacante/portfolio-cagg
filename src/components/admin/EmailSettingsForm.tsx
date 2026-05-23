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
import { Switch } from '@/components/ui/switch';
import { type EmailSettingsValues, useEmailSettingsForm } from '@/hooks/use-email-settings-form';

type EmailSettingsFormProps = {
  initial: EmailSettingsValues;
};

export function EmailSettingsForm({ initial }: EmailSettingsFormProps) {
  const { form, onSubmit, status } = useEmailSettingsForm(initial);

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="space-y-6">
        <FormField
          control={form.control}
          name="notificationsEnabled"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center gap-4 space-y-0">
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
              <FormLabel className="font-normal">
                Recibir notificaciones por email cuando llega un mensaje
              </FormLabel>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notificationEmail"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email de notificación</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="carlos@ejemplo.com"
                  {...field}
                  disabled={!form.watch('notificationsEnabled')}
                />
              </FormControl>
              <FormMessage />
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
