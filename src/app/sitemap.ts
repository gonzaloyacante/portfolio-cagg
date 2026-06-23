import type { MetadataRoute } from 'next';
import { unstable_cache } from 'next/cache';

import { prisma } from '@/lib/prisma';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://portfolio-cag.app';

const LOCALES = ['es', 'en'] as const;

/**
 * Most-recent updatedAt across every content model that has an
 * `updatedAt` column AND is edited through the admin. Search engines
 * use `lastmod` to decide when to re-crawl, so this is what makes
 * the sitemap truthful: editing any of these rows bumps the
 * timestamp and Google knows there's fresh content to fetch.
 *
 * As of now, only Hero, SectionMeta and SeoConfig carry an
 * `updatedAt` column. The other collections (Brand, Project,
 * Service, etc.) don't have one — when those get added via a
 * migration, drop them into the `Promise.all` below.
 */
const fetchLastmod = unstable_cache(
  async () => {
    try {
      const results = await Promise.allSettled([
        prisma.hero.findFirst({ select: { updatedAt: true } }),
        prisma.sectionMeta.findFirst({
          select: { updatedAt: true },
          orderBy: { updatedAt: 'desc' },
        }),
        prisma.seoConfig.findFirst({
          select: { updatedAt: true },
          orderBy: { updatedAt: 'desc' },
        }),
      ]);

      const dates = results
        .filter(
          (r): r is PromiseFulfilledResult<{ updatedAt: Date } | null> => r.status === 'fulfilled'
        )
        .map((r) => r.value?.updatedAt)
        .filter((d): d is Date => d instanceof Date);

      if (dates.length === 0) return new Date();
      return new Date(Math.max(...dates.map((d) => d.getTime())));
    } catch {
      // If the DB is unreachable at build time, fall back to "now" so
      // the sitemap still gets a valid lastmod instead of 500-ing.
      return new Date();
    }
  },
  ['sitemap-lastmod'],
  { tags: ['landing'], revalidate: 3600 }
);

/**
 * Section anchors exposed on the landing. These are real URLs (with
 * the hash) because Google does index fragment URLs when they're
 * listed in a sitemap. Listed roughly by SEO importance.
 */
const SECTION_ANCHORS = [
  { hash: '#contact', priority: 0.8, changeFrequency: 'monthly' as const },
  { hash: '#projects', priority: 0.7, changeFrequency: 'monthly' as const },
  { hash: '#services', priority: 0.6, changeFrequency: 'monthly' as const },
];

/**
 * Build the `alternates.languages` block for a given path. The
 * landing is a single-page app, so the same anchors exist on both
 * locales — every entry gets a full hreflang set pointing to its
 * cross-locale siblings plus the x-default fallback.
 */
function buildAlternates(path: string) {
  return {
    languages: {
      es: `${APP_URL}/es${path}`,
      en: `${APP_URL}/en${path}`,
      'x-default': `${APP_URL}/es${path}`,
    },
  };
}

/**
 * Dynamic sitemap covering the two public locales plus the section
 * anchors. lastModified is computed from the most recently edited
 * content model so search engines re-crawl when anything on the
 * landing changes (admin saves invalidate this cache via the
 * `landing` tag).
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = await fetchLastmod();

  const entries: MetadataRoute.Sitemap = [];

  for (const locale of LOCALES) {
    // Home — the most important URL, weekly re-crawl, top priority.
    entries.push({
      url: `${APP_URL}/${locale}`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 1,
      alternates: buildAlternates(''),
    });

    // Section anchors — every entry ships full hreflang so Google
    // knows the cross-locale relationship even for fragment URLs.
    for (const { hash, priority, changeFrequency } of SECTION_ANCHORS) {
      entries.push({
        url: `${APP_URL}/${locale}${hash}`,
        lastModified,
        changeFrequency,
        priority,
        alternates: buildAlternates(hash),
      });
    }
  }

  return entries;
}
