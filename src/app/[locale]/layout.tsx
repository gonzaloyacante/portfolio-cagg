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

        {/* PWA: iOS status bar style, fullscreen-capable web app. */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="CAG Portfolio" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="application-name" content="CAG Portfolio" />

        {/* Microsoft tile color for Edge / IE pinned sites. */}
        <meta name="msapplication-TileColor" content="#0a0a0a" />
        <meta name="msapplication-tap-highlight" content="no" />
        <meta name="theme-color" content="#0a0a0a" media="(prefers-color-scheme: dark)" />

        {/*
          Don't let mobile browsers auto-link phone numbers, emails
          or addresses — that would break the typography of the
          landing (and the contact section is already styled).
        */}
        <meta name="format-detection" content="telephone=no, email=no, address=no" />

        {/* Misc. */}
        <meta name="rating" content="general" />
        <meta name="distribution" content="global" />
        <meta name="revisit-after" content="7 days" />

        {/* iOS Smart App Banner (if a native app is published later) */}
        {/* <meta name="apple-itunes-app" content="app-id=000000000" /> */}

        {/*
          Facebook App Links — only uncomment if/when native apps
          ship on iOS / Android so deep links open in the app.
        */}
        {/*
        <meta property="al:ios:url" content="applinks://docs" />
        <meta property="al:ios:app_store_id" content="000000000" />
        <meta property="al:ios:app_name" content="CAG Portfolio" />
        <meta property="al:android:url" content="applinks://docs" />
        <meta property="al:android:app_name" content="CAG Portfolio" />
        <meta property="al:android:package" content="dev.carlosguerra.portfolio" />
        <meta property="al:web:url" content="https://carlosguerra.dev/es" />
        */}
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
