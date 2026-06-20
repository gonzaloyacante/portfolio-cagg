import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';

import { authClient } from '@/lib/auth-client';
import { resetPasswordSchema, type ResetPasswordData } from '@/validations/reset-password';

export function useResetPassword(token: string) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  // After the password reset succeeds the form shows a success state for
  // ~2 s and then we navigate to the login page. We do not clear the
  // timer on unmount: at worst the navigation runs against an unmounted
  // context, which `router.replace` handles silently.
  useEffect(() => {
    if (!done) return;
    const timer = setTimeout(() => router.replace('/admin/login'), 2000);
    return () => clearTimeout(timer);
  }, [done, router]);

  const form = useForm<ResetPasswordData>({
    resolver: zodResolver(resetPasswordSchema),
    mode: 'onTouched',
  });

  const onSubmit = form.handleSubmit(async ({ password }) => {
    form.clearErrors();
    setLoading(true);
    try {
      const { error } = await authClient.resetPassword({ newPassword: password, token });
      if (error) {
        form.setError('root', { message: 'Token inválido o expirado.' });
      } else {
        setDone(true);
      }
    } catch {
      form.setError('root', { message: 'Error de conexión. Intentá de nuevo.' });
    } finally {
      setLoading(false);
    }
  });

  return { form, onSubmit, loading, done };
}
