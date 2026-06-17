'use client';

import Link from 'next/link';

import { ArrowRight, KeyRound } from 'lucide-react';

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
import { useLogin } from '@/hooks/use-login';

export default function LoginForm() {
  const { form, onSubmit, loading } = useLogin();

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="space-y-5">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-mono text-[10px] tracking-[0.18em] uppercase">
                Email
              </FormLabel>
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

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center gap-2">
                <KeyRound size={11} className="text-muted-foreground" />
                <FormLabel className="font-mono text-[10px] tracking-[0.18em] uppercase">
                  Contraseña
                </FormLabel>
              </div>
              <FormControl>
                <Input
                  type="password"
                  autoComplete="current-password"
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

        <div className="flex items-center justify-between gap-2 pt-1">
          <Link
            href="/admin/forgot-password"
            className="text-muted-foreground hover:text-foreground text-xs transition-colors"
          >
            ¿Olvidaste tu contraseña?
          </Link>
          <Button type="submit" disabled={loading} className="admin-glow gap-1.5">
            {loading ? 'Verificando…' : 'Ingresar'}
            <ArrowRight size={13} />
          </Button>
        </div>
      </form>
    </Form>
  );
}
