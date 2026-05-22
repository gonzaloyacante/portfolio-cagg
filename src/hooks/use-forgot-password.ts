import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';

import { authClient } from '@/lib/auth-client';
import { forgotPasswordSchema, type ForgotPasswordData } from '@/validations/forgot-password';

export function useForgotPassword() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const form = useForm<ForgotPasswordData>({ resolver: zodResolver(forgotPasswordSchema) });

  const onSubmit = form.handleSubmit(async ({ email }) => {
    setLoading(true);
    try {
      await authClient.requestPasswordReset({
        email,
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL ?? ''}/admin/reset-password`,
      });
    } catch {
      /* silent — evitar enumeración de usuarios */
    } finally {
      setSubmitted(true);
      setLoading(false);
    }
  });

  return { form, onSubmit, submitted, loading };
}
