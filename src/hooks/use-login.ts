import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';

import { authClient } from '@/lib/auth-client';
import { loginSchema, type LoginData } from '@/validations/login';

export function useLogin() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const form = useForm<LoginData>({ resolver: zodResolver(loginSchema) });

  const onSubmit = form.handleSubmit(async ({ email, password }) => {
    form.clearErrors();
    setLoading(true);
    try {
      const { error } = await authClient.signIn.email({ email, password, callbackURL: '/admin' });
      if (error) {
        const code = (error as { code?: string }).code;
        if (code === 'TWO_FACTOR_REQUIRED') return;
        form.setError('root', { message: 'Credenciales inválidas.' });
      } else {
        router.replace('/admin');
        router.refresh();
      }
    } catch {
      form.setError('root', { message: 'Error de conexión. Intentá de nuevo.' });
    } finally {
      setLoading(false);
    }
  });

  return { form, onSubmit, loading };
}
