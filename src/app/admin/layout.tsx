import type { ReactNode } from 'react';

import { routing } from '@/i18n/routing';
import { fontDisplay, fontMono, fontSans } from '@/lib/fonts';

export default function AdminRootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang={routing.defaultLocale}>
      <body
        className={`${fontDisplay.variable} ${fontSans.variable} ${fontMono.variable} bg-background text-foreground antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
