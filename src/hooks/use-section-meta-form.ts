import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { z } from 'zod/v4';

import { zodResolver } from '@hookform/resolvers/zod';

import axiosInstance from '@/lib/axios';

const sectionMetaFormSchema = z.object({
  overlineEs: z.string(),
  overlineEn: z.string(),
  titleEs: z.string(),
  titleEn: z.string(),
  descEs: z.string(),
  descEn: z.string(),
});

export type SectionMetaFormValues = z.infer<typeof sectionMetaFormSchema>;

export function useSectionMetaForm(slug: string, initial: SectionMetaFormValues) {
  const [status, setStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

  const form = useForm<SectionMetaFormValues, unknown, SectionMetaFormValues>({
    resolver: zodResolver(sectionMetaFormSchema),
    defaultValues: initial,
  });

  const onSubmit = form.handleSubmit(async (data) => {
    setStatus('saving');
    try {
      await axiosInstance.put(`/api/admin/sections/${slug}`, data);
      setStatus('success');
    } catch {
      setStatus('error');
    }
  });

  return { form, onSubmit, status };
}
