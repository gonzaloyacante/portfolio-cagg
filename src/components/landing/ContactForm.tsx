'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';

import axios from 'axios';
import { ArrowUpRight, Loader2, MessageCircle } from 'lucide-react';
import { z } from 'zod/v4';

import { zodResolver } from '@hookform/resolvers/zod';

import { useReveal } from '@/hooks/use-reveal';
import { messagesService } from '@/services/messages-service';

import { ContactField } from './ContactField';

const MAX_MESSAGE = 2000;

// Mirrors server-side validation in /src/validations/message.ts so the
// client catches invalid input before round-tripping to the server. Keep
// the two in sync if you change one.
const contactSchema = z.object({
  name: z.string().trim().min(2, 'Mínimo 2 caracteres').max(100, 'Máximo 100 caracteres'),
  email: z.string().trim().toLowerCase().email('Email inválido').max(254, 'Email demasiado largo'),
  phone: z.string().trim().max(20).optional().or(z.literal('')),
  message: z
    .string()
    .trim()
    .min(10, 'Mínimo 10 caracteres')
    .max(MAX_MESSAGE, `Máximo ${MAX_MESSAGE} caracteres`),
  // Honeypot — must be empty. Real users never see this input.
  website: z.string().max(0).optional(),
});

type ContactFormData = z.infer<typeof contactSchema>;

type FeedbackState = { type: 'success' | 'error'; text: string } | null;

type ContactFormProps = {
  whatsappNumber: string;
};

function buildWaText(waPrefix: string, data: ContactFormData): string {
  const lines = [waPrefix, '', `• ${data.name}`, `• ${data.email}`];
  if (data.phone) lines.push(`• ${data.phone}`);
  lines.push('', data.message);
  return encodeURIComponent(lines.join('\n'));
}

function formatAxiosError(err: unknown, fallback: string): string {
  if (axios.isAxiosError(err)) {
    if (err.response?.status === 429) {
      const retryAfter = Number(err.response.headers['retry-after'] ?? 0);
      if (retryAfter > 0) {
        return `Demasiados intentos. Probá en ${Math.ceil(retryAfter / 60)} min.`;
      }
      return 'Demasiados intentos. Probá en unos minutos.';
    }
    if (err.response?.status === 422) {
      return 'Revisá los datos ingresados.';
    }
    if (err.response && err.response.status >= 500) {
      return 'El servidor tuvo un problema. Probá de nuevo o usá WhatsApp.';
    }
  }
  return fallback;
}

export function ContactForm({ whatsappNumber }: ContactFormProps) {
  const t = useTranslations('contact.form');
  const [feedback, setFeedback] = useState<FeedbackState>(null);
  const [ref, visible] = useReveal<HTMLDivElement>();

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { isSubmitting, errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    mode: 'onBlur',
  });

  const messageValue = useWatch({ control, name: 'message' }) ?? '';
  const remainingChars = MAX_MESSAGE - messageValue.length;
  const messageTooLong = remainingChars < 0;

  const onSubmit = async (data: ContactFormData) => {
    setFeedback(null);
    let persistError: unknown = null;
    try {
      await messagesService.submit(data);
    } catch (err) {
      persistError = err;
      console.error('[contact] persist failed', err);
    }

    if (persistError) {
      const msg = formatAxiosError(persistError, 'No se pudo guardar el mensaje.');
      // For 422 we keep the form filled so the user can correct it.
      if (
        axios.isAxiosError(persistError) &&
        (persistError.response?.status === 422 || persistError.response?.status === 429)
      ) {
        setFeedback({ type: 'error', text: msg });
        return;
      }
      // Network/5xx → still open WhatsApp as fallback but warn the user.
      const text = buildWaText(t('wa_prefix'), data);
      window.open(`https://wa.me/${whatsappNumber}?text=${text}`, '_blank', 'noopener,noreferrer');
      setFeedback({
        type: 'error',
        text: `${msg} Abriendo WhatsApp como alternativa.`,
      });
      reset();
      window.setTimeout(() => setFeedback(null), 8000);
      return;
    }

    const text = buildWaText(t('wa_prefix'), data);
    window.open(`https://wa.me/${whatsappNumber}?text=${text}`, '_blank', 'noopener,noreferrer');
    setFeedback({ type: 'success', text: t('success') });
    reset();
    window.setTimeout(() => setFeedback(null), 6000);
  };

  return (
    <div
      ref={ref}
      className={`transition-all delay-150 duration-700 lg:col-span-7 ${
        visible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
      }`}
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        data-testid="contact-form"
        noValidate
        className="border-border bg-card border p-7 lg:p-10"
      >
        <div className="mb-8 flex items-center justify-between">
          <span className="text-muted-foreground/60 text-label tracking-label font-mono uppercase">
            FORM · 002 / CONSULTA TÉCNICA
          </span>
          <span className="num text-muted-foreground/60 text-label font-mono">v1.2</span>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <ContactField
            id="cf-name"
            name="name"
            label={t('name')}
            required
            autoComplete="name"
            maxLength={100}
            testId="contact-input-name"
            error={errors.name?.message}
            registration={register('name')}
          />
          <ContactField
            id="cf-email"
            name="email"
            type="email"
            label={t('email')}
            required
            autoComplete="email"
            maxLength={254}
            testId="contact-input-email"
            error={errors.email?.message}
            registration={register('email', {
              // Normalise on every keystroke so the user sees what the
              // server will receive (the server also lowercases).
              setValueAs: (v: unknown) => (typeof v === 'string' ? v.trim().toLowerCase() : v),
            })}
          />
          <div className="sm:col-span-2">
            <ContactField
              id="cf-phone"
              name="phone"
              type="tel"
              label={t('phone')}
              autoComplete="tel"
              maxLength={20}
              testId="contact-input-phone"
              registration={register('phone')}
            />
          </div>
          <div className="sm:col-span-2">
            <label
              htmlFor="cf-msg"
              className="text-muted-foreground/60 text-label tracking-label mb-2 block font-mono uppercase"
            >
              {t('message')}
            </label>
            <textarea
              id="cf-msg"
              rows={5}
              data-testid="contact-input-message"
              maxLength={MAX_MESSAGE}
              aria-invalid={!!errors.message}
              className="border-border focus:border-foreground text-foreground placeholder:text-muted-foreground/40 w-full resize-none border-0 border-b bg-transparent py-2 text-base transition-colors outline-none"
              {...register('message')}
            />
            <div className="mt-1 flex items-center justify-between text-xs">
              {errors.message ? (
                <p role="alert" className="text-destructive">
                  {errors.message.message}
                </p>
              ) : (
                <span />
              )}
              <span
                className={`num font-mono ${
                  messageTooLong ? 'text-destructive' : 'text-muted-foreground/60'
                }`}
              >
                {remainingChars}
              </span>
            </div>
          </div>

          {/* Honeypot — visually hidden, present in DOM for bots to fill. */}
          <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden="true">
            <label htmlFor="cf-website">Website</label>
            <input
              id="cf-website"
              type="text"
              tabIndex={-1}
              autoComplete="off"
              {...register('website')}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          data-testid="contact-submit"
          aria-busy={isSubmitting}
          className="bg-foreground text-background hover:bg-foreground/90 group mt-10 inline-flex items-center justify-center gap-3 px-7 py-4 text-sm font-semibold tracking-wide transition-colors disabled:opacity-50"
        >
          {isSubmitting ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <MessageCircle size={16} strokeWidth={2.2} />
          )}
          {t('submit')}
          <ArrowUpRight
            size={16}
            className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          />
        </button>

        <p className="text-muted-foreground/60 mt-5 max-w-md text-xs leading-relaxed">
          {t('note')}
        </p>

        {feedback && (
          <div
            data-testid="contact-feedback"
            role={feedback.type === 'error' ? 'alert' : 'status'}
            aria-live="polite"
            className={`animate-fade-up mt-6 border px-4 py-3 text-sm ${
              feedback.type === 'success'
                ? 'border-border bg-background text-foreground'
                : 'border-destructive/40 bg-destructive/10 text-destructive'
            }`}
          >
            {feedback.text}
          </div>
        )}
      </form>
    </div>
  );
}
