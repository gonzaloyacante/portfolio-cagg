import type { MetadataRoute } from 'next';
import { unstable_cache } from 'next/cache';

import { prisma } from '@/lib/prisma';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://portfolio-cag.app';

const LOCALES = ['es', 'en'] as const;

const fetchLastmod = unstable_cache(
  async () => {
    try {
      const hero = await prisma.hero.findFirst({ select: { updatedAt: true } });
      return hero?.updatedAt ?? new Date();
    } catch {
      // If the DB is unreachable at build time, fall back to "now" so
      // the sitemap still gets a valid lastmod instead of 500-ing.
      return new Date();
    }
  },
  ['sitemap-lastmod'],
  { revalidate: 3600 }
);

/**
 * Dynamic sitemap covering the two public locales plus the static
 * pages. lastModified is computed from the Hero row in the DB so it
 * reflects real content changes (admin saves invalidate this cache
 * via the `landing` tag).
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = await fetchLastmod();

  const baseEntries: MetadataRoute.Sitemap = LOCALES.flatMap((locale) => [
    {
      url: `${APP_URL}/${locale}`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 1,
      alternates: {
        languages: {
          es: `${APP_URL}/es`,
          en: `${APP_URL}/en`,
        },
      },
    },
    {
      url: `${APP_URL}/${locale}#contact`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${APP_URL}/${locale}#projects`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${APP_URL}/${locale}#services`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
  ]);

  return baseEntries;
}
