'use client';

import Link from 'next/link';

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
import { useLogin } from '@/hooks/use-login';

export default function LoginForm() {
  const { form, onSubmit, loading } = useLogin();

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

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-label tracking-label text-muted-foreground font-mono uppercase">
                Contraseña
              </FormLabel>
              <FormControl>
                <Input
                  type="password"
                  autoComplete="current-password"
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

        <div className="flex items-center justify-between pt-2">
          <Link
            href="/admin/forgot-password"
            className="text-muted-foreground hover:text-foreground text-sm transition-colors"
          >
            ¿Olvidó su contraseña?
          </Link>
          <Button type="submit" disabled={loading} size="lg" className="gap-2">
            {loading ? 'Verificando…' : 'Ingresar'}
            <ArrowRight />
          </Button>
        </div>
      </form>
    </Form>
  );
}
