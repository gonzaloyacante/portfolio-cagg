import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { z } from 'zod/v4';

import { zodResolver } from '@hookform/resolvers/zod';

import axiosInstance from '@/lib/axios';

export const systemSettingsSchema = z.object({
  acceptingProjects: z.boolean(),
});

export type SystemSettingsValues = z.infer<typeof systemSettingsSchema>;

export function useSystemSettingsForm(initial: SystemSettingsValues) {
  const [status, setStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

  const form = useForm<SystemSettingsValues, unknown, SystemSettingsValues>({
    resolver: zodResolver(systemSettingsSchema),
    defaultValues: initial,
  });

  const onSubmit = form.handleSubmit(async (data) => {
    setStatus('saving');
    try {
      await axiosInstance.put('/api/admin/system', data);
      setStatus('success');
    } catch {
      setStatus('error');
    }
  });

  return { form, onSubmit, status };
}
