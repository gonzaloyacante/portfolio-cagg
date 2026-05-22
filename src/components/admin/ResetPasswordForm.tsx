'use client';

import { CheckCircle } from 'lucide-react';
import { ArrowRight } from 'lucide-react';

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
import { useResetPassword } from '@/hooks/use-reset-password';

interface Props {
  token: string;
}

export default function ResetPasswordForm({ token }: Props) {
  const { form, onSubmit, loading, done } = useResetPassword(token);

  if (done) {
    return (
      <div className="flex items-start gap-3">
        <CheckCircle className="text-foreground mt-0.5 shrink-0" />
        <p className="text-muted-foreground text-sm">
          Contraseña actualizada. Redirigiendo al inicio de sesión…
        </p>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="space-y-6">
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-label tracking-label text-muted-foreground font-mono uppercase">
                Nueva contraseña
              </FormLabel>
              <FormControl>
                <Input
                  type="password"
                  autoComplete="new-password"
                  autoFocus
                  placeholder="••••••••"
                  className="h-11 rounded-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="confirm"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-label tracking-label text-muted-foreground font-mono uppercase">
                Confirmar contraseña
              </FormLabel>
              <FormControl>
                <Input
                  type="password"
                  autoComplete="new-password"
                  placeholder="••••••••"
                  className="h-11 rounded-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {form.formState.errors.root && (
          <p className="text-destructive text-sm">{form.formState.errors.root.message}</p>
        )}

        <Button type="submit" disabled={loading} size="lg" className="w-full gap-2">
          {loading ? 'Actualizando…' : 'Actualizar contraseña'}
          <ArrowRight />
        </Button>
      </form>
    </Form>
  );
}
