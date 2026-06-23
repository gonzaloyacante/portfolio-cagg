import type { Metadata } from 'next';

import type { SeoConfig } from '@/generated/prisma/client';

/**
 * Centralized SEO helpers. The public landing builds a rich Metadata
 * object with proper OG / Twitter / canonical / hreflang tags and ships
 * JSON-LD structured data (Person + WebSite + BreadcrumbList) so the
 * site is well-indexed and shows rich cards when shared.
 *
 * Per-page overrides (title/description/ogImage/noIndex) are stored in
 * the SeoConfig table. The public `[locale]/page.tsx` `generateMetadata`
 * calls `seoMetadataFromConfig(config, locale)` to merge DB values on
 * top of the defaults below. Keeping this file free of Prisma imports
 * means unit tests can exercise it without a database connection.
 */

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://portfolio-cag.app';
const DEFAULT_OG_IMAGE = `${APP_URL}/opengraph-image`;

const SITE_NAME = 'Carlos A. Guerra — Portfolio';
const TWITTER_HANDLE = '@carlosguerra';

/**
 * Physical location of the business the portfolio advertises. The
 * portfolio is a freelancer's site, but the *client* (the one who
 * would hire the engineering services advertised here) is based in
 * Tigre, Buenos Aires, Argentina. The owner is not Argentine — only
 * the service-area metadata is.
 */
const BUSINESS_LOCATION = {
  streetAddress: 'Tigre',
  addressLocality: 'Tigre',
  addressRegion: 'Buenos Aires',
  addressCountry: 'AR',
  postalCode: 'B1648',
  // Approximate centroid of Tigre partido. Schema.org doesn't require
  // the centroid — Google's local results are pretty forgiving as
  // long as coordinates are on the right continent.
  geo: { latitude: -34.4264, longitude: -58.5797 },
} as const;

/** Pick the ES or EN SEO field value, falling back to the supplied default. */
function pickLocaleField(
  config: SeoConfig | null,
  field: 'title' | 'desc',
  locale: 'es' | 'en',
  fallback: string
): string {
  if (!config) return fallback;
  const value =
    locale === 'en'
      ? field === 'title'
        ? config.titleEn
        : config.descEn
      : field === 'title'
        ? config.titleEs
        : config.descEs;
  return value ?? fallback;
}

/**
 * Resolve the SEO override fields for a locale. Returns the final
 * values that should be used both for `<Metadata>` and for the
 * `WebPage` JSON-LD node — keeping them in sync is what prevents
 * Google from seeing a mismatch between the visible metadata and the
 * structured-data description.
 */
export function resolveSeoMeta(
  config: SeoConfig | null,
  locale: 'es' | 'en',
  defaults: { title: string; description: string }
): {
  title: string;
  description: string;
  ogImage: string;
  noIndex: boolean;
} {
  return {
    title: pickLocaleField(config, 'title', locale, defaults.title),
    description: pickLocaleField(config, 'desc', locale, defaults.description),
    ogImage: config?.ogImage ?? DEFAULT_OG_IMAGE,
    noIndex: config?.noIndex ?? false,
  };
}

/**
 * Build a Next.js Metadata object that respects per-page SEO overrides
 * stored in the SeoConfig table. The caller queries the config (so the
 * Prisma client is loaded only on the server) and passes it in.
 */
export function seoMetadataFromConfig(
  config: SeoConfig | null,
  locale: 'es' | 'en',
  defaults: { title: string; description: string }
): Metadata {
  const resolved = resolveSeoMeta(config, locale, defaults);
  return {
    title: resolved.title,
    description: resolved.description,
    robots: resolved.noIndex ? { index: false, follow: false } : { index: true, follow: true },
    openGraph: {
      images: [resolved.ogImage],
    },
  };
}

type BuildMetadataInput = {
  locale: 'es' | 'en';
  title: string;
  description: string;
  path: string;
  ogImage?: string;
  type?: 'website' | 'profile' | 'article';
  publishedTime?: string;
  noindex?: boolean;
};

export function buildMetadata({
  locale,
  title,
  description,
  path,
  ogImage,
  type = 'website',
  noindex = false,
}: BuildMetadataInput): Metadata {
  const url = `${APP_URL}/${locale}${path === '/' ? '' : path}`;
  const fullTitle = `${title} — ${SITE_NAME}`;
  const canonical = path === '/' ? `${APP_URL}/${locale}` : url;
  // Per-locale OG image: English variant for the /en path, default
  // (Spanish) for everything else.
  const defaultImage = locale === 'en' ? `${APP_URL}/opengraph-image-en` : DEFAULT_OG_IMAGE;
  const image = ogImage ?? defaultImage;
  const otherLocale = locale === 'es' ? 'en' : 'es';

  return {
    title: fullTitle,
    description,
    applicationName: SITE_NAME,
    authors: [{ name: 'Carlos Armando Guerra', url: APP_URL }],
    generator: 'Next.js',
    keywords: [
      'Carlos Guerra',
      'ingeniero electrónico',
      'electronic engineer',
      'control industrial',
      'industrial control',
      'termoformado',
      'BOPP',
      'metalizado',
      'extrusión',
      'eficiencia energética',
      'automatización',
      'automation',
      'Argentina',
      'portfolio',
    ],
    referrer: 'origin-when-cross-origin',
    robots: noindex
      ? { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            'max-image-preview': 'large',
            'max-snippet': -1,
            'max-video-preview': -1,
          },
        },
    alternates: {
      canonical,
      languages: {
        es: `${APP_URL}/es${path === '/' ? '' : path}`,
        en: `${APP_URL}/en${path === '/' ? '' : path}`,
        'x-default': `${APP_URL}/es${path === '/' ? '' : path}`,
      },
    },
    openGraph: {
      type,
      siteName: SITE_NAME,
      title: fullTitle,
      description,
      url: canonical,
      locale: locale === 'es' ? 'es_AR' : 'en_US',
      alternateLocale: otherLocale === 'es' ? 'es_AR' : 'en_US',
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      site: TWITTER_HANDLE,
      creator: TWITTER_HANDLE,
      title: fullTitle,
      description,
      images: [image],
    },
    category: 'technology',
  };
}

/** Build a Person JSON-LD object for the structured data payload. */
export function personJsonLd(locale: 'es' | 'en') {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': `${APP_URL}/#person`,
    name: 'Carlos Armando Guerra',
    alternateName: 'Carlos A. Guerra',
    jobTitle:
      locale === 'es'
        ? 'Ingeniero Electrónico de Control Industrial'
        : 'Industrial Control Electronic Engineer',
    description:
      locale === 'es'
        ? 'Más de 30 años optimizando líneas de producción industrial. Termoformado, BOPP, metalizado, extrusión PP, eficiencia energética.'
        : 'Over 30 years optimizing industrial production lines. Thermoforming, BOPP, metallizing, PP extrusion, energy efficiency.',
    url: APP_URL,
    image: DEFAULT_OG_IMAGE,
    sameAs: ['https://www.linkedin.com/in/carlos-guerra'].filter(Boolean),
    knowsAbout: [
      'Control industrial',
      'Industrial automation',
      'Thermoforming',
      'BOPP film',
      'Metallizing',
      'PP extrusion',
      'Energy efficiency',
      'PLC programming',
    ],
    workLocation: {
      '@type': 'Place',
      name: 'Argentina',
    },
  };
}

/**
 * Build a ProfessionalService schema — wraps the Person as a service
 * provider and adds the contact channel. This is the schema Google
 * prefers for freelancers / consultants, and it's the one that can
 * surface the "service" rich result on mobile SERPs.
 */
export function professionalServiceJsonLd(
  locale: 'es' | 'en',
  contact: {
    phoneDisplay: string;
    whatsappNumber: string;
    email: string;
    linkedinUrl: string;
    location: string;
  } | null
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    '@id': `${APP_URL}/#service`,
    name: SITE_NAME,
    description:
      locale === 'es'
        ? 'Servicios de ingeniería para optimización de líneas de producción industrial: termoformado, BOPP, metalizado, extrusión PP, eficiencia energética y puesta a punto de maquinaria.'
        : 'Engineering services for industrial production line optimization: thermoforming, BOPP, metallizing, PP extrusion, energy efficiency, and machinery commissioning.',
    url: `${APP_URL}/${locale}`,
    image: DEFAULT_OG_IMAGE,
    provider: { '@id': `${APP_URL}/#person` },
    areaServed: {
      '@type': 'Country',
      name: 'Argentina',
    },
    ...(contact
      ? {
          telephone: contact.phoneDisplay,
          email: contact.email,
          address: {
            '@type': 'PostalAddress',
            addressCountry: 'AR',
            addressLocality: contact.location,
          },
        }
      : {}),
    priceRange: '$$',
    sameAs: ['https://www.linkedin.com/in/carlos-guerra'].filter(Boolean),
  };
}

/** Build a WebSite JSON-LD object. */
export function websiteJsonLd(locale: 'es' | 'en') {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${APP_URL}/#website`,
    name: SITE_NAME,
    url: `${APP_URL}/${locale}`,
    inLanguage: locale === 'es' ? 'es-AR' : 'en-US',
    publisher: { '@id': `${APP_URL}/#person` },
    author: { '@id': `${APP_URL}/#person` },
  };
}

/** ItemList JSON-LD for the services collection. */
export function servicesItemListJsonLd(
  locale: 'es' | 'en',
  services: { id: string; label: string }[]
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    '@id': `${APP_URL}/#services`,
    name: locale === 'es' ? 'Servicios de ingeniería' : 'Engineering services',
    itemListOrder: 'https://schema.org/ItemListOrderAscending',
    numberOfItems: services.length,
    itemListElement: services.map((s, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: s.label,
      url: `${APP_URL}/${locale}/#services`,
    })),
  };
}

/** ItemList JSON-LD for the projects collection (Case studies). */
export function projectsItemListJsonLd(
  locale: 'es' | 'en',
  projects: { id: string; title: string; period: string; tag: string }[]
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    '@id': `${APP_URL}/#projects`,
    name: locale === 'es' ? 'Casos de estudio' : 'Case studies',
    itemListOrder: 'https://schema.org/ItemListOrderAscending',
    numberOfItems: projects.length,
    itemListElement: projects.map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: p.title,
      description: p.tag,
      url: `${APP_URL}/${locale}/#projects`,
    })),
  };
}

/** BreadcrumbList JSON-LD for the section anchors. */
export function breadcrumbJsonLd(locale: 'es' | 'en', items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: `${APP_URL}/${locale}${item.path === '/' ? '' : item.path}`,
    })),
  };
}

/** FAQPage JSON-LD — wraps the FAQ items as a single Question/Answer list. */
export function faqPageJsonLd(locale: 'es' | 'en', faqs: { q: string; a: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': `${APP_URL}/${locale}#faq`,
    inLanguage: locale === 'es' ? 'es-AR' : 'en-US',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: f.a,
      },
    })),
  };
}

/**
 * WebPage schema. Identifies this concrete page within the WebSite so
 * Google can distinguish it from the rest of the domain. Date-modified
 * is wired to the Hero's updatedAt (the most-edited content on the
 * page) so search engines see a real freshness signal.
 */
export function webPageJsonLd(
  locale: 'es' | 'en',
  page: {
    title: string;
    description: string;
    ogImage: string;
    lastModified: Date | string;
  }
) {
  // Next.js's RSC payload serializer sometimes flattens Date to an
  // ISO string across the `unstable_cache` boundary, so accept both.
  const lastModifiedIso =
    page.lastModified instanceof Date
      ? page.lastModified.toISOString()
      : new Date(page.lastModified).toISOString();

  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${APP_URL}/${locale}#webpage`,
    url: `${APP_URL}/${locale}`,
    name: page.title,
    description: page.description,
    inLanguage: locale === 'es' ? 'es-AR' : 'en-US',
    isPartOf: { '@id': `${APP_URL}/#website` },
    about: { '@id': `${APP_URL}/#person` },
    mainEntity: { '@id': `${APP_URL}/#service` },
    primaryImageOfPage: {
      '@type': 'ImageObject',
      '@id': `${page.ogImage}#primary-image`,
      url: page.ogImage,
    },
    dateModified: lastModifiedIso,
    speakable: {
      '@type': 'SpeakableSpecification',
      // Headings + the lead paragraph are the bits a voice assistant
      // would naturally read aloud.
      xpath: ['/html/head/title', '/html/body//h1', '/html/body//h2'],
    },
  };
}

/**
 * LocalBusiness schema. This describes the *service area*, not the
 * freelancer personally — the portfolio advertises engineering
 * services whose target client is located in Tigre, Buenos Aires,
 * Argentina. Owner nationality is irrelevant; the service-area
 * metadata is what helps Google match this site with local queries.
 */
export function localBusinessJsonLd(
  locale: 'es' | 'en',
  contact: {
    phoneDisplay: string;
    whatsappNumber: string;
    email: string;
    linkedinUrl: string;
  } | null
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${APP_URL}/#local-business`,
    name: SITE_NAME,
    description:
      locale === 'es'
        ? `Servicios de ingeniería en ${BUSINESS_LOCATION.addressLocality}, ${BUSINESS_LOCATION.addressRegion}. Termoformado, BOPP, metalizado, extrusión PP, eficiencia energética y puesta a punto de maquinaria.`
        : `Engineering services in ${BUSINESS_LOCATION.addressLocality}, ${BUSINESS_LOCATION.addressRegion}. Thermoforming, BOPP, metallizing, PP extrusion, energy efficiency and machinery commissioning.`,
    url: APP_URL,
    image: DEFAULT_OG_IMAGE,
    logo: {
      '@type': 'ImageObject',
      url: `${APP_URL}/icon.svg`,
    },
    telephone: contact?.phoneDisplay,
    email: contact?.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: BUSINESS_LOCATION.streetAddress,
      addressLocality: BUSINESS_LOCATION.addressLocality,
      addressRegion: BUSINESS_LOCATION.addressRegion,
      addressCountry: BUSINESS_LOCATION.addressCountry,
      postalCode: BUSINESS_LOCATION.postalCode,
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: BUSINESS_LOCATION.geo.latitude,
      longitude: BUSINESS_LOCATION.geo.longitude,
    },
    // The service covers the whole partido of Tigre + greater Buenos
    // Aires + Argentina-wide. We list the locality first because
    // Google's local-pack prefers the most-specific match.
    areaServed: [
      {
        '@type': 'City',
        name: BUSINESS_LOCATION.addressLocality,
        '@id': 'https://www.wikidata.org/wiki/Q42602',
      },
      {
        '@type': 'City',
        name: 'Buenos Aires',
        '@id': 'https://www.wikidata.org/wiki/Q1486',
      },
      {
        '@type': 'AdministrativeArea',
        name: 'Provincia de Buenos Aires',
      },
      {
        '@type': 'Country',
        name: 'Argentina',
      },
    ],
    // The LocalBusiness is a sub-org of the ProfessionalService node
    // already declared on the page — keep them linked by @id.
    parentOrganization: { '@id': `${APP_URL}/#service` },
    priceRange: '$$',
    currenciesAccepted: 'ARS, USD',
    paymentAccepted: 'Cash, Credit Card, Bank Transfer, Wire',
    sameAs: contact ? [contact.linkedinUrl].filter(Boolean) : [],
  };
}

/**
 * Verification meta tags for Search Console + Bing Webmaster. The
 * actual codes live in env so they're not committed. If the env var
 * is unset the field is omitted (no empty/placeholder meta tag leaks
 * to production).
 *
 * Setup:
 *   1. Google Search Console → Settings → Ownership verification →
 *      HTML tag → copy the `content=` value → set NEXT_PUBLIC_GSC_TOKEN
 *   2. Bing Webmaster Tools → Verify ownership → HTML <meta> tag →
 *      copy the `content=` value → set NEXT_PUBLIC_BING_TOKEN
 *
 *   # .env.local
 *   NEXT_PUBLIC_GSC_TOKEN=abc123…
 *   NEXT_PUBLIC_BING_TOKEN=xyz789…
 */
export function searchConsoleVerification(): Metadata['verification'] {
  const verification: Metadata['verification'] = {};
  const gsc = process.env.NEXT_PUBLIC_GSC_TOKEN;
  const bing = process.env.NEXT_PUBLIC_BING_TOKEN;
  if (gsc) verification.google = gsc;
  if (bing) verification.other = { 'msvalidate.01': bing };
  return Object.keys(verification).length > 0 ? verification : undefined;
}

/**
 * Build a single `@graph`-wrapped JSON-LD payload for the landing
 * page. This is what Google's Rich Results Test wants — one
 * `<script type="application/ld+json">` containing every node,
 * cross-referenced by `@id`, instead of seven separate scripts that
 * each re-declare the same `@context`.
 *
 * The order of nodes in the graph is intentional: Person /
 * ProfessionalService / WebSite come first so other nodes can link
 * to them by @id. WebPage and LocalBusiness follow, then the
 * collection-level lists (services, projects), then the FAQ and the
 * breadcrumb.
 */
export function landingJsonLdGraph(input: {
  locale: 'es' | 'en';
  contact: {
    phoneDisplay: string;
    whatsappNumber: string;
    email: string;
    linkedinUrl: string;
    location: string;
  } | null;
  services: { id: string; label: string }[];
  projects: { id: string; title: string; period: string; tag: string }[];
  faqs: { q: string; a: string }[];
  breadcrumbs: { name: string; path: string }[];
  webPage: {
    title: string;
    description: string;
    ogImage: string;
    lastModified: Date;
  };
}) {
  const { locale, contact, services, projects, faqs, breadcrumbs, webPage } = input;

  // Strip @context from each node — it lives at the graph root.
  // Uses Reflect.deleteProperty so we don't trip the
  // `no-unused-vars` rule on a destructured rename.
  const strip = <T extends Record<string, unknown>>(node: T): Omit<T, '@context'> => {
    const result = { ...node };
    Reflect.deleteProperty(result, '@context');
    return result as Omit<T, '@context'>;
  };

  return {
    '@context': 'https://schema.org',
    '@graph': [
      strip(personJsonLd(locale)),
      strip(professionalServiceJsonLd(locale, contact)),
      strip(websiteJsonLd(locale)),
      strip(webPageJsonLd(locale, webPage)),
      strip(localBusinessJsonLd(locale, contact)),
      strip(servicesItemListJsonLd(locale, services)),
      strip(projectsItemListJsonLd(locale, projects)),
      strip(breadcrumbJsonLd(locale, breadcrumbs)),
      strip(faqPageJsonLd(locale, faqs)),
    ],
  };
}

export const SEO_CONFIG = {
  APP_URL,
  SITE_NAME,
  DEFAULT_OG_IMAGE,
  BUSINESS_LOCATION,
} as const;
