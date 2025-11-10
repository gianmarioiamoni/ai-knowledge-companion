import { Metadata } from 'next'

/**
 * SEO Metadata Utilities
 * Helper functions for generating consistent metadata across pages
 */

interface GenerateMetadataProps {
  title: string
  description: string
  keywords?: string[]
  locale?: string
  path?: string
  image?: string
  noIndex?: boolean
}

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://aiknowledgecompanion.com'
const DEFAULT_OG_IMAGE = '/og-image.png'

export function generateMetadata({
  title,
  description,
  keywords = [],
  locale = 'en',
  path = '',
  image = DEFAULT_OG_IMAGE,
  noIndex = false,
}: GenerateMetadataProps): Metadata {
  const fullTitle = title.includes('|') ? title : `${title} | AI Knowledge Companion`
  const url = `${BASE_URL}/${locale}${path}`
  const imageUrl = image.startsWith('http') ? image : `${BASE_URL}${image}`

  const defaultKeywords = [
    'AI tutor',
    'learning assistant',
    'knowledge companion',
    'document analysis',
    'personalized learning',
    'AI education',
  ]

  const allKeywords = [...new Set([...defaultKeywords, ...keywords])]

  return {
    title: fullTitle,
    description,
    keywords: allKeywords,
    authors: [{ name: 'AI Knowledge Companion Team' }],
    creator: 'AI Knowledge Companion',
    publisher: 'AI Knowledge Companion',
    robots: noIndex
      ? 'noindex, nofollow'
      : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    alternates: {
      canonical: url,
      languages: {
        'en': `${BASE_URL}/en${path}`,
        'it': `${BASE_URL}/it${path}`,
      },
    },
    openGraph: {
      type: 'website',
      locale: locale === 'en' ? 'en_US' : 'it_IT',
      alternateLocale: locale === 'en' ? 'it_IT' : 'en_US',
      url,
      title: fullTitle,
      description,
      siteName: 'AI Knowledge Companion',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [imageUrl],
      creator: '@aiknowledgecompanion',
    },
    metadataBase: new URL(BASE_URL),
  }
}

/**
 * Generate metadata for landing page
 */
export function generateLandingMetadata(locale: string = 'en'): Metadata {
  return generateMetadata({
    title: locale === 'en' 
      ? 'Your Personal AI Learning Assistant | AI Knowledge Companion'
      : 'Il Tuo Assistente AI Personale per l\'Apprendimento | AI Knowledge Companion',
    description: locale === 'en'
      ? 'Create personalized AI tutors, upload documents, and engage in intelligent conversations. Transform your learning experience with AI Knowledge Companion.'
      : 'Crea tutor AI personalizzati, carica documenti e interagisci in conversazioni intelligenti. Trasforma la tua esperienza di apprendimento con AI Knowledge Companion.',
    keywords: [
      'AI tutor',
      'personalized learning',
      'document upload',
      'intelligent conversations',
      'RAG',
      'GPT-4',
    ],
    locale,
    path: '',
  })
}

/**
 * Generate metadata for authenticated pages (noindex)
 */
export function generateAuthMetadata(
  title: string,
  description: string,
  locale: string = 'en'
): Metadata {
  return generateMetadata({
    title,
    description,
    locale,
    noIndex: true, // Don't index authenticated pages
  })
}

