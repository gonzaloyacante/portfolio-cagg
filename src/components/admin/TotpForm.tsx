'use client';

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
import { useTotp } from '@/hooks/use-totp';

export default function TotpForm() {
  const { form, onSubmit, loading } = useTotp();

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="space-y-6">
        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-label tracking-label text-muted-foreground font-mono uppercase">
                Código 2FA
              </FormLabel>
              <FormControl>
                <Input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  autoFocus
                  autoComplete="one-time-code"
                  placeholder="000000"
                  className="tracking-code h-14 rounded-none text-center font-mono text-2xl"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={loading} size="lg" className="w-full gap-2">
          {loading ? 'Verificando…' : 'Verificar código'}
          <ArrowRight />
        </Button>
      </form>
    </Form>
  );
}
