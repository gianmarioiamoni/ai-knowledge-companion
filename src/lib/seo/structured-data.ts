/**
 * Structured Data (JSON-LD) Generators
 * Helps search engines understand page content
 * https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data
 */

interface Organization {
  name: string
  url: string
  logo?: string
  description?: string
  sameAs?: string[]
}

interface WebPage {
  name: string
  url: string
  description: string
  inLanguage: string
}

interface _Product {
  name: string
  description: string
  offers: {
    price: string
    priceCurrency: string
    availability: string
  }
}

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://aiknowledgecompanion.com'

/**
 * Organization structured data (for all pages)
 */
export function generateOrganizationSchema(locale: string = 'en'): string {
  const org: Organization = {
    name: 'AI Knowledge Companion',
    url: `${BASE_URL}/${locale}`,
    logo: `${BASE_URL}/logo.png`,
    description: locale === 'en'
      ? 'AI-powered learning platform that creates personalized tutors from your documents'
      : 'Piattaforma di apprendimento potenziata dall\'AI che crea tutor personalizzati dai tuoi documenti',
    sameAs: [
      // Add social media links when available
      // 'https://twitter.com/aiknowledgecompanion',
      // 'https://linkedin.com/company/aiknowledgecompanion',
    ],
  }

  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Organization',
    ...org,
  })
}

/**
 * WebSite structured data (for home page)
 */
export function generateWebSiteSchema(locale: string = 'en'): string {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'AI Knowledge Companion',
    url: `${BASE_URL}/${locale}`,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${BASE_URL}/${locale}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  })
}

/**
 * WebPage structured data (for generic pages)
 */
export function generateWebPageSchema(
  name: string,
  url: string,
  description: string,
  locale: string = 'en'
): string {
  const page: WebPage = {
    name,
    url,
    description,
    inLanguage: locale === 'en' ? 'en-US' : 'it-IT',
  }

  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    ...page,
    isPartOf: {
      '@type': 'WebSite',
      url: `${BASE_URL}/${locale}`,
    },
  })
}

/**
 * SoftwareApplication structured data (for product pages)
 */
export function generateSoftwareApplicationSchema(locale: string = 'en'): string {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'AI Knowledge Companion',
    applicationCategory: 'EducationalApplication',
    operatingSystem: 'Web Browser',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '150',
    },
    description: locale === 'en'
      ? 'Create personalized AI tutors from your documents and engage in intelligent learning conversations'
      : 'Crea tutor AI personalizzati dai tuoi documenti e interagisci in conversazioni di apprendimento intelligenti',
  })
}

/**
 * Offer structured data (for pricing plans)
 */
export function generateOfferSchema(
  name: string,
  price: string,
  currency: string = 'USD',
  locale: string = 'en'
): string {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Offer',
    name,
    price,
    priceCurrency: currency,
    availability: 'https://schema.org/InStock',
    url: `${BASE_URL}/${locale}/plans`,
    seller: {
      '@type': 'Organization',
      name: 'AI Knowledge Companion',
    },
  })
}

/**
 * FAQPage structured data (for pages with Q&A)
 */
export function generateFAQSchema(
  faqs: Array<{ question: string; answer: string }>
): string {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  })
}

/**
 * BreadcrumbList structured data (for navigation)
 */
export function generateBreadcrumbSchema(
  breadcrumbs: Array<{ name: string; url: string }>,
  locale: string = 'en'
): string {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${BASE_URL}/${locale}${item.url}`,
    })),
  })
}

/**
 * Note: Use StructuredDataWrapper component from '@/components/seo' to inject JSON-LD
 * Example:
 * import { StructuredDataWrapper } from '@/components/seo'
 * <StructuredDataWrapper data={schema} />
 */

