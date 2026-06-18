import type { Metadata } from 'next';

/**
 * Centralized SEO helpers. The public landing builds a rich Metadata
 * object with proper OG / Twitter / canonical / hreflang tags and ships
 * JSON-LD structured data (Person + WebSite + BreadcrumbList) so the
 * site is well-indexed and shows rich cards when shared.
 */

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://portfolio-cag.app';
const DEFAULT_OG_IMAGE = `${APP_URL}/opengraph-image`;

const SITE_NAME = 'Carlos A. Guerra — Portfolio';
const TWITTER_HANDLE = '@carlosguerra';

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

export const SEO_CONFIG = {
  APP_URL,
  SITE_NAME,
  DEFAULT_OG_IMAGE,
} as const;
