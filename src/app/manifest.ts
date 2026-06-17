import type { MetadataRoute } from 'next';

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
    screenshots: [
      {
        src: '/apple-touch-startup-image',
        sizes: '1242x2688',
        type: 'image/png',
        form_factor: 'narrow',
        label: 'Carlos A. Guerra — Portfolio',
      },
    ],
    icons: [
      {
        src: '/icon/32',
        sizes: '32x32',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon/192',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon/512',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon/maskable-192',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icon/maskable-512',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
