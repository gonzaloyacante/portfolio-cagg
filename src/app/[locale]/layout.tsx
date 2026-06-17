import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';

import { GoogleAnalytics } from '@/components/GoogleAnalytics';
import { WebVitals } from '@/components/WebVitals';
import { routing } from '@/i18n/routing';
import { fontDisplay, fontMono, fontSans } from '@/lib/fonts';
import { defaultViewport } from '@/lib/viewport';

export const viewport = defaultViewport;

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
      <head>
        {/*
          Performance: preconnect to Cloudinary so image requests start
          before the browser even parses the <img> tag. Also enables HTTP/3
          hints for Google Analytics when present.
        */}
        <link rel="preconnect" href="https://res.cloudinary.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
        <link rel="preconnect" href="https://www.googletagmanager.com" crossOrigin="anonymous" />
        {/*
          Icon chain. Modern browsers prefer the SVG (sharp on hi-DPI,
          scales to any size). Safari pinned-tab uses a monochrome SVG
          so the OS can tint it to match the user's theme.
        */}
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#0a0a0a" />
      </head>
      <body
        className={`${fontDisplay.variable} ${fontSans.variable} ${fontMono.variable} flex min-h-full flex-col antialiased`}
      >
        <NextIntlClientProvider messages={messages}>{children}</NextIntlClientProvider>
        <WebVitals />
        <GoogleAnalytics />
      </body>
    </html>
  );
}
