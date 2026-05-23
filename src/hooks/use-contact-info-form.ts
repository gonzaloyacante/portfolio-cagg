import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { z } from 'zod/v4';

import { zodResolver } from '@hookform/resolvers/zod';

import axiosInstance from '@/lib/axios';

export const contactInfoFormSchema = z.object({
  name: z.string().min(1, 'Requerido'),
  phoneDisplay: z.string().min(1, 'Requerido'),
  whatsappNumber: z.string().min(1, 'Requerido'),
  email: z.email('Email inválido'),
  linkedinUrl: z.url('URL inválida'),
  linkedinHandle: z.string().min(1, 'Requerido'),
  location: z.string().min(1, 'Requerido'),
});

export type ContactInfoFormValues = z.infer<typeof contactInfoFormSchema>;

export function useContactInfoForm(initial: ContactInfoFormValues) {
  const [status, setStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

  const form = useForm<ContactInfoFormValues, unknown, ContactInfoFormValues>({
    resolver: zodResolver(contactInfoFormSchema),
    defaultValues: initial,
  });

  const onSubmit = form.handleSubmit(async (data) => {
    setStatus('saving');
    try {
      await axiosInstance.put('/api/admin/contact-info', data);
      setStatus('success');
    } catch {
      setStatus('error');
    }
  });

  return { form, onSubmit, status };
}
