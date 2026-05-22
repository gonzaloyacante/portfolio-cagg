import { z } from 'zod';

export const totpSchema = z.object({
  code: z.string().length(6, 'Código de 6 dígitos').regex(/^\d+$/, 'Solo números'),
});

export type TotpData = z.infer<typeof totpSchema>;
