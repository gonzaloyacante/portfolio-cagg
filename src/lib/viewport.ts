import type { Viewport } from 'next';

/**
 * Centralized viewport config. Next.js 16 moved colorScheme / themeColor /
 * viewport out of `Metadata` and into a separate `Viewport` export. The
 * default is dark-mode friendly, matching the admin and the landing.
 */
export const defaultViewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#0a0a0a',
  colorScheme: 'dark',
};
