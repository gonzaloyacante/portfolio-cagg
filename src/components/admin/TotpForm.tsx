'use client';

import { ArrowRight, KeyRound } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useTotp } from '@/hooks/use-totp';

export default function TotpForm() {
  const { form, onSubmit, loading } = useTotp();

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="space-y-5">
        <div className="flex items-start gap-3">
          <div className="border-border bg-muted/40 text-muted-foreground flex h-9 w-9 shrink-0 items-center justify-center rounded-md border">
            <KeyRound size={15} />
          </div>
          <div>
            <p className="text-foreground text-sm font-semibold tracking-tight">
              Código de verificación
            </p>
            <p className="text-muted-foreground text-xs">
              Ingresá los 6 dígitos de tu app de autenticación.
            </p>
          </div>
        </div>
        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  autoFocus
                  autoComplete="one-time-code"
                  placeholder="000000"
                  className="border-border bg-background/40 h-14 rounded-[var(--admin-radius)] text-center font-mono text-2xl tracking-[0.5em]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={loading} size="lg" className="admin-glow w-full gap-1.5">
          {loading ? 'Verificando…' : 'Verificar código'}
          <ArrowRight size={13} />
        </Button>
      </form>
    </Form>
  );
}
