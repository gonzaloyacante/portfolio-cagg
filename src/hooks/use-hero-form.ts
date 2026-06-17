import { useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';

import { z } from 'zod/v4';

import { zodResolver } from '@hookform/resolvers/zod';

import axiosInstance from '@/lib/axios';

const statSchema = z.object({
  value: z.string().min(1, 'Requerido'),
  labelEs: z.string().min(1, 'Requerido'),
  labelEn: z.string().min(1, 'Requerido'),
  order: z.number().int(),
});

export const heroFormSchema = z.object({
  overlineEs: z.string().min(1, 'Requerido'),
  overlineEn: z.string().min(1, 'Requerido'),
  name: z.string().min(1, 'Requerido'),
  headlineEs: z.string().min(1, 'Requerido'),
  headlineEn: z.string().min(1, 'Requerido'),
  summaryEs: z.string().min(1, 'Requerido'),
  summaryEn: z.string().min(1, 'Requerido'),
  ctaWhatsappEs: z.string().min(1, 'Requerido'),
  ctaWhatsappEn: z.string().min(1, 'Requerido'),
  ctaEmailEs: z.string().min(1, 'Requerido'),
  ctaEmailEn: z.string().min(1, 'Requerido'),
  ctaLinkedinEs: z.string().min(1, 'Requerido'),
  ctaLinkedinEn: z.string().min(1, 'Requerido'),
  portraitUrl: z
    .string()
    .url()
    .nullish()
    .or(z.literal('').transform(() => null)),
  stats: z.array(statSchema),
});

export type HeroFormValues = z.infer<typeof heroFormSchema>;

export function useHeroForm(initial: HeroFormValues) {
  const [status, setStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

  const form = useForm<HeroFormValues, unknown, HeroFormValues>({
    resolver: zodResolver(heroFormSchema),
    defaultValues: initial,
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'stats',
  });

  const onSubmit = form.handleSubmit(async (data) => {
    setStatus('saving');
    try {
      await axiosInstance.put('/api/admin/hero', data);
      setStatus('success');
    } catch {
      setStatus('error');
    }
  });

  const addStat = () => append({ value: '', labelEs: '', labelEn: '', order: fields.length });

  return { form, fields, addStat, remove, onSubmit, status };
}
