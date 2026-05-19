import { IBM_Plex_Mono, IBM_Plex_Sans, Plus_Jakarta_Sans } from 'next/font/google';

export const fontDisplay = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-display',
  display: 'swap',
  preload: true,
});

export const fontSans = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-sans',
  display: 'swap',
});

export const fontMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '600'],
  variable: '--font-mono',
  display: 'swap',
});
