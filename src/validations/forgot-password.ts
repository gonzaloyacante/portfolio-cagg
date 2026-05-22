import { z } from 'zod';

export const forgotPasswordSchema = z.object({
  email: z.string().email('Email inválido'),
});

export type ForgotPasswordData = z.infer<typeof forgotPasswordSchema>;
