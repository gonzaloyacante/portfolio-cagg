import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';

import { GoogleAnalytics } from '@/components/GoogleAnalytics';
import { routing } from '@/i18n/routing';
import { fontDisplay, fontMono, fontSans } from '@/lib/fonts';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html lang={locale} className="h-full" data-scroll-behavior="smooth">
      <body
        className={`${fontDisplay.variable} ${fontSans.variable} ${fontMono.variable} flex min-h-full flex-col antialiased`}
      >
        <NextIntlClientProvider messages={messages}>{children}</NextIntlClientProvider>
        <GoogleAnalytics />
      </body>
    </html>
  );
}
