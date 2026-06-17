'use client';

import { ArrowRight, CheckCircle2, KeyRound } from 'lucide-react';

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
      <div className="admin-hairline bg-card/40 flex items-start gap-3 rounded-[var(--admin-radius-lg)] p-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-emerald-400/30 bg-emerald-400/10 text-emerald-400">
          <CheckCircle2 size={15} />
        </div>
        <div>
          <p className="text-foreground text-sm font-semibold tracking-tight">
            Contraseña actualizada
          </p>
          <p className="text-muted-foreground mt-1 text-xs leading-relaxed">
            Redirigiendo al inicio de sesión…
          </p>
        </div>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="space-y-5">
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center gap-2">
                <KeyRound size={11} className="text-muted-foreground" />
                <FormLabel className="font-mono text-[10px] tracking-[0.18em] uppercase">
                  Nueva contraseña
                </FormLabel>
              </div>
              <FormControl>
                <Input
                  type="password"
                  autoComplete="new-password"
                  autoFocus
                  placeholder="••••••••"
                  className="admin-focus-ring border-border bg-background/40 h-11 rounded-[var(--admin-radius)]"
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
              <FormLabel className="font-mono text-[10px] tracking-[0.18em] uppercase">
                Confirmar contraseña
              </FormLabel>
              <FormControl>
                <Input
                  type="password"
                  autoComplete="new-password"
                  placeholder="••••••••"
                  className="admin-focus-ring border-border bg-background/40 h-11 rounded-[var(--admin-radius)]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {form.formState.errors.root && (
          <p className="text-destructive text-xs">{form.formState.errors.root.message}</p>
        )}

        <Button type="submit" disabled={loading} className="admin-glow w-full gap-1.5" size="lg">
          {loading ? 'Actualizando…' : 'Actualizar contraseña'}
          <ArrowRight size={13} />
        </Button>
      </form>
    </Form>
  );
}
