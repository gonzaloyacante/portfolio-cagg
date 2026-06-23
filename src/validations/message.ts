import { z } from 'zod';

export const contactMessageSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().toLowerCase().email('Email inválido').max(254),
  phone: z.string().trim().max(20).default(''),
  message: z.string().trim().min(10).max(2000),
  website: z.string().max(0).optional(),
});

export type ContactMessageData = z.infer<typeof contactMessageSchema>;
