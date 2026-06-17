import type { MetadataRoute } from 'next';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://portfolio-cag.app';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Carlos A. Guerra — Portfolio',
    short_name: 'CAG',
    description:
      'Ingeniero Electrónico de Control Industrial. Más de 30 años optimizando líneas de producción industrial.',
    start_url: '/es',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait-primary',
    background_color: '#0a0a0a',
    theme_color: '#0a0a0a',
    lang: 'es',
    categories: ['technology', 'productivity', 'business'],
    icons: [
      {
        src: `${APP_URL}/icon-192.png`,
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: `${APP_URL}/icon-512.png`,
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: `${APP_URL}/icon-maskable-512.png`,
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
