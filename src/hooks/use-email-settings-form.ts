import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { z } from 'zod/v4';

import { zodResolver } from '@hookform/resolvers/zod';

import axiosInstance from '@/lib/axios';

export const emailSettingsSchema = z.object({
  notificationEmail: z.union([z.email('Email inválido'), z.literal('')]),
  notificationsEnabled: z.boolean(),
});

export type EmailSettingsValues = z.infer<typeof emailSettingsSchema>;

export function useEmailSettingsForm(initial: EmailSettingsValues) {
  const [status, setStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

  const form = useForm<EmailSettingsValues, unknown, EmailSettingsValues>({
    resolver: zodResolver(emailSettingsSchema),
    defaultValues: initial,
  });

  const onSubmit = form.handleSubmit(async (data) => {
    setStatus('saving');
    try {
      await axiosInstance.put('/api/admin/email-settings', data);
      setStatus('success');
    } catch {
      setStatus('error');
    }
  });

  return { form, onSubmit, status };
}
