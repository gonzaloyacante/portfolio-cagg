import { z } from 'zod';

const heroStatSchema = z.object({
  value: z.string().min(1),
  labelEs: z.string().min(1),
  labelEn: z.string().min(1),
  order: z.number().int().default(0),
});

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
  name: z.string().min(1).optional(),
  phoneDisplay: z.string().optional(),
  whatsappNumber: z.string().optional(),
  email: z.string().email().optional(),
  linkedinUrl: z.string().url().optional(),
  linkedinHandle: z.string().optional(),
  location: z.string().optional(),
});

export const sectionMetaUpdateSchema = z.object({
  overlineEs: z.string().nullish(),
  overlineEn: z.string().nullish(),
  titleEs: z.string().nullish(),
  titleEn: z.string().nullish(),
  descEs: z.string().nullish(),
  descEn: z.string().nullish(),
});
