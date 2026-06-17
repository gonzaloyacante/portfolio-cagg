import type { MetadataRoute } from 'next';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://portfolio-cag.app';

/**
 * robots.txt. Disallow /admin and /api, allow everything else, point
 * to the sitemap. Sitemap-discovery robots get a small crawl delay
 * so a misbehaving crawler can't hammer the site.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/api', '/_next'],
        crawlDelay: 1,
      },
      // Explicit rule for major search bots — same policy, no delay.
      {
        userAgent: ['Googlebot', 'Bingbot', 'Slurp', 'DuckDuckBot'],
        allow: '/',
        disallow: ['/admin', '/api'],
      },
      // AI scrapers are usually fine but we don't owe them training data.
      {
        userAgent: [
          'GPTBot',
          'ChatGPT-User',
          'CCBot',
          'Google-Extended',
          'anthropic-ai',
          'Claude-Web',
        ],
        disallow: '/',
      },
    ],
    sitemap: `${APP_URL}/sitemap.xml`,
    host: APP_URL,
  };
}
