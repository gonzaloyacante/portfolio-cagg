import { z } from 'zod';

export const heroStatSchema = z.object({
  value: z.string().min(1, 'Requerido'),
  labelEs: z.string().min(1, 'Requerido'),
  labelEn: z.string().min(1, 'Requerido'),
  order: z.number().int().default(0),
});

/**
 * Full schema used by the HeroForm on the client. Every text field is
 * required so the admin can't save with empty placeholders. The server
 * route uses `heroUpdateSchema` (partial of this) because it accepts
 * sparse updates from the API surface.
 */
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
    .url('URL inválida')
    .nullish()
    .or(z.literal('').transform(() => null)),
  stats: z.array(heroStatSchema),
});

/**
 * `HeroFormValues` is the *output* type of the schema (after defaults are
 * applied). The form hook uses this for `defaultValues` and the data
 * delivered to `handleSubmit`. `HeroFormInput` is the *input* type — what
 * raw form fields look like before validation. The two diverge because
 * `heroStatSchema.order` has `.default(0)`, so input has `order?` while
 * output has `order: number`.
 */
export type HeroFormValues = z.infer<typeof heroFormSchema>;
export type HeroFormInput = z.input<typeof heroFormSchema>;

export const heroUpdateSchema = z.object({
  overlineEs: z.string().min(1).optional(),
  overlineEn: z.string().min(1).optional(),
  name: z.string().min(1).optional(),
  headlineEs: z.string().min(1).optional(),
  headlineEn: z.string().min(1).optional(),
  summaryEs: z.string().min(1).optional(),
  summaryEn: z.string().min(1).optional(),
  ctaWhatsappEs: z.string().optional(),
  ctaWhatsappEn: z.string().optional(),
  ctaEmailEs: z.string().optional(),
  ctaEmailEn: z.string().optional(),
  ctaLinkedinEs: z.string().optional(),
  ctaLinkedinEn: z.string().optional(),
  portraitUrl: z
    .string()
    .url()
    .nullish()
    .or(z.literal('').transform(() => null)),
  stats: z.array(heroStatSchema).optional(),
});

export const experienceCardSchema = z.object({
  code: z.string().min(1),
  titleEs: z.string().min(1),
  titleEn: z.string().min(1),
  bodyEs: z.string().min(1),
  bodyEn: z.string().min(1),
  order: z.number().int().default(0),
});

export const processStepSchema = z.object({
  code: z.string().min(1),
  titleEs: z.string().min(1),
  titleEn: z.string().min(1),
  bodyEs: z.string().min(1),
  bodyEn: z.string().min(1),
  deliverableEs: z.string().min(1),
  deliverableEn: z.string().min(1),
  order: z.number().int().default(0),
});

export const serviceSchema = z.object({
  labelEs: z.string().min(1),
  labelEn: z.string().min(1),
  order: z.number().int().default(0),
});

export const projectSchema = z.object({
  tag: z.string().min(1),
  periodEs: z.string().min(1),
  periodEn: z.string().min(1),
  titleEs: z.string().min(1),
  titleEn: z.string().min(1),
  challengeEs: z.string().min(1),
  challengeEn: z.string().min(1),
  interventionEs: z.string().min(1),
  interventionEn: z.string().min(1),
  outcomeEs: z.string().min(1),
  outcomeEn: z.string().min(1),
  order: z.number().int().default(0),
});

export const resultItemSchema = z.object({
  kEs: z.string().min(1),
  kEn: z.string().min(1),
  vEs: z.string().min(1),
  vEn: z.string().min(1),
  order: z.number().int().default(0),
});

export const testimonialSchema = z.object({
  quoteEs: z.string().min(1),
  quoteEn: z.string().min(1),
  roleEs: z.string().min(1),
  roleEn: z.string().min(1),
  sectorEs: z.string().min(1),
  sectorEn: z.string().min(1),
  order: z.number().int().default(0),
});

export const timelineItemSchema = z.object({
  period: z.string().min(1),
  titleEs: z.string().min(1),
  titleEn: z.string().min(1),
  bodyEs: z.string().min(1),
  bodyEn: z.string().min(1),
  order: z.number().int().default(0),
});

export const faqItemSchema = z.object({
  qEs: z.string().min(1),
  qEn: z.string().min(1),
  aEs: z.string().min(1),
  aEn: z.string().min(1),
  order: z.number().int().default(0),
});

export const brandSchema = z.object({
  name: z.string().min(1),
  order: z.number().int().default(0),
});

export const contactInfoUpdateSchema = z.object({
  name: z.string().min(1).nullish(),
  phoneDisplay: z.string().nullish(),
  whatsappNumber: z.string().nullish(),
  email: z.string().trim().toLowerCase().email().nullish(),
  linkedinUrl: z.string().url().or(z.literal('')).nullish(),
  linkedinHandle: z.string().nullish(),
  location: z.string().nullish(),
});

export const sectionMetaUpdateSchema = z.object({
  overlineEs: z.string().nullish(),
  overlineEn: z.string().nullish(),
  titleEs: z.string().nullish(),
  titleEn: z.string().nullish(),
  descEs: z.string().nullish(),
  descEn: z.string().nullish(),
});

/**
 * Single source of truth for the admin forms. Each hook imports from
 * here instead of re-declaring its own Zod schema — that's how we
 * avoid the client/server drift that previously let some fields be
 * required on the client and optional on the server (or vice versa).
 */

export const contactInfoFormSchema = z.object({
  name: z.string().min(1, 'Requerido'),
  phoneDisplay: z.string().min(1, 'Requerido'),
  whatsappNumber: z.string().min(1, 'Requerido'),
  email: z.string().trim().toLowerCase().email('Email inválido'),
  linkedinUrl: z.url('URL inválida'),
  linkedinHandle: z.string().min(1, 'Requerido'),
  location: z.string().min(1, 'Requerido'),
});
export type ContactInfoFormValues = z.infer<typeof contactInfoFormSchema>;

export const sectionMetaFormSchema = z.object({
  overlineEs: z.string(),
  overlineEn: z.string(),
  titleEs: z.string(),
  titleEn: z.string(),
  descEs: z.string(),
  descEn: z.string(),
});
export type SectionMetaFormValues = z.infer<typeof sectionMetaFormSchema>;

export const emailSettingsFormSchema = z.object({
  notificationEmail: z.string().trim().toLowerCase().email('Email inválido').or(z.literal('')),
  notificationsEnabled: z.boolean(),
});
export type EmailSettingsFormValues = z.infer<typeof emailSettingsFormSchema>;

export const systemSettingsFormSchema = z.object({
  acceptingProjects: z.boolean(),
});
export type SystemSettingsFormValues = z.infer<typeof systemSettingsFormSchema>;
