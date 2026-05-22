import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';

import { authClient } from '@/lib/auth-client';
import { resetPasswordSchema, type ResetPasswordData } from '@/validations/reset-password';

export function useResetPassword(token: string) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const form = useForm<ResetPasswordData>({ resolver: zodResolver(resetPasswordSchema) });

  const onSubmit = form.handleSubmit(async ({ password }) => {
    form.clearErrors();
    setLoading(true);
    try {
      const { error } = await authClient.resetPassword({ newPassword: password, token });
      if (error) {
        form.setError('root', { message: 'Token inválido o expirado.' });
      } else {
        setDone(true);
        setTimeout(() => router.replace('/admin/login'), 2000);
      }
    } catch {
      form.setError('root', { message: 'Error de conexión. Intentá de nuevo.' });
    } finally {
      setLoading(false);
    }
  });

  return { form, onSubmit, loading, done };
}
