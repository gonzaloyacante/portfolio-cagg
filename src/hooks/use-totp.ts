import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';

import { authClient } from '@/lib/auth-client';
import { totpSchema, type TotpData } from '@/validations/totp';

export function useTotp() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const form = useForm<TotpData>({ resolver: zodResolver(totpSchema) });

  const onSubmit = form.handleSubmit(async ({ code }) => {
    form.clearErrors();
    setLoading(true);
    try {
      const { error } = await authClient.twoFactor.verifyTotp({ code });
      if (error) {
        form.setError('code', { message: 'Código inválido o expirado.' });
      } else {
        router.replace('/admin');
        router.refresh();
      }
    } catch {
      form.setError('code', { message: 'Error de conexión. Intentá de nuevo.' });
    } finally {
      setLoading(false);
    }
  });

  return { form, onSubmit, loading };
}
