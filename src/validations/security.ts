import { z } from 'zod';

export const enableTotpSchema = z.object({
  password: z.string().min(1, 'Contraseña requerida'),
});

export const verifyTotpSetupSchema = z.object({
  code: z.string().length(6, 'Código de 6 dígitos').regex(/^\d+$/, 'Solo números'),
});

export const disableTotpSchema = z.object({
  password: z.string().min(1, 'Contraseña requerida'),
});

export type EnableTotpData = z.infer<typeof enableTotpSchema>;
export type VerifyTotpSetupData = z.infer<typeof verifyTotpSetupSchema>;
export type DisableTotpData = z.infer<typeof disableTotpSchema>;
