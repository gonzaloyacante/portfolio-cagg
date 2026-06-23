import { z } from 'zod';

export const resetPasswordSchema = z
  .object({
    password: z.string().min(10, 'Mínimo 10 caracteres'),
    confirm: z.string().min(1, 'Requerido'),
  })
  .refine((d) => d.password === d.confirm, {
    message: 'Las contraseñas no coinciden',
    path: ['confirm'],
  });

export type ResetPasswordData = z.infer<typeof resetPasswordSchema>;
