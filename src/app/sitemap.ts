import { MetadataRoute } from 'next'

/**
 * Dynamic Sitemap Generation
 * Automatically generates sitemap.xml for SEO
 * https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://aiknowledgecompanion.com'
  const currentDate = new Date()

  // Supported locales
  const locales = ['en', 'it']

  // Static pages (same for all locales)
  const staticPages = [
    '', // home
    'dashboard',
    'tutors',
    'documents',
    'multimedia',
    'plans',
    'profile',
    'privacy-policy',
    'terms-of-service',
    'cookie-policy',
  ]

  // Generate sitemap entries for all locales
  const sitemapEntries: MetadataRoute.Sitemap = []

  locales.forEach(locale => {
    staticPages.forEach(page => {
      const url = page === '' ? `${baseUrl}/${locale}` : `${baseUrl}/${locale}/${page}`
      
      // Set priority based on page importance
      let priority = 0.5
      let changeFrequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never' = 'weekly'

      if (page === '') {
        priority = 1.0
        changeFrequency = 'daily'
      } else if (page === 'plans' || page === 'tutors') {
        priority = 0.9
        changeFrequency = 'daily'
      } else if (page === 'dashboard' || page === 'documents' || page === 'multimedia') {
        priority = 0.8
        changeFrequency = 'daily'
      } else if (page.includes('policy') || page.includes('terms')) {
        priority = 0.3
        changeFrequency = 'monthly'
      }

      sitemapEntries.push({
        url,
        lastModified: currentDate,
        changeFrequency,
        priority,
        alternates: {
          languages: {
            en: `${baseUrl}/en${page ? `/${page}` : ''}`,
            it: `${baseUrl}/it${page ? `/${page}` : ''}`,
          },
        },
      })
    })
  })

  return sitemapEntries
}

