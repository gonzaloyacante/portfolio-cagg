'use client';

import Link from 'next/link';

import { ArrowRight, CheckCircle } from 'lucide-react';

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
        <div className="flex items-start gap-3">
          <CheckCircle className="text-foreground mt-0.5 shrink-0" />
          <p className="text-muted-foreground text-sm">
            Si existe una cuenta con ese email, recibirás un enlace para restablecer tu contraseña.
          </p>
        </div>
        <Link
          href="/admin/login"
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm transition-colors"
        >
          ← Volver al inicio de sesión
        </Link>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="space-y-6">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-label tracking-label text-muted-foreground font-mono uppercase">
                Email
              </FormLabel>
              <FormControl>
                <Input
                  type="email"
                  autoComplete="email"
                  autoFocus
                  placeholder="admin@ejemplo.com"
                  className="h-11 rounded-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={loading} size="lg" className="w-full gap-2">
          {loading ? 'Enviando…' : 'Enviar enlace'}
          <ArrowRight />
        </Button>
      </form>
    </Form>
  );
}
