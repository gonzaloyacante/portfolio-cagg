'use client';

import Link from 'next/link';

import { ArrowRight, CheckCircle2, Mail } from 'lucide-react';

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
import { useForgotPassword } from '@/hooks/use-forgot-password';

export default function ForgotPasswordForm() {
  const { form, onSubmit, submitted, loading } = useForgotPassword();

  if (submitted) {
    return (
      <div className="space-y-4">
        <div className="admin-hairline bg-card/40 flex items-start gap-3 rounded-[var(--admin-radius-lg)] p-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-emerald-400/30 bg-emerald-400/10 text-emerald-400">
            <CheckCircle2 size={15} />
          </div>
          <div>
            <p className="text-foreground text-sm font-semibold tracking-tight">
              Revisá tu casilla
            </p>
            <p className="text-muted-foreground mt-1 text-xs leading-relaxed">
              Si existe una cuenta con ese email, te enviamos un enlace para restablecer tu
              contraseña.
            </p>
          </div>
        </div>
        <Link
          href="/admin/login"
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-xs font-medium transition-colors"
        >
          ← Volver al inicio de sesión
        </Link>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="space-y-5">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center gap-2">
                <Mail size={11} className="text-muted-foreground" />
                <FormLabel className="font-mono text-[10px] tracking-[0.18em] uppercase">
                  Email
                </FormLabel>
              </div>
              <FormControl>
                <Input
                  type="email"
                  autoComplete="email"
                  autoFocus
                  placeholder="admin@ejemplo.com"
                  className="admin-focus-ring border-border bg-background/40 h-11 rounded-[var(--admin-radius)]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={loading} className="admin-glow w-full gap-1.5" size="lg">
          {loading ? 'Enviando…' : 'Enviar enlace'}
          <ArrowRight size={13} />
        </Button>
      </form>
    </Form>
  );
}
