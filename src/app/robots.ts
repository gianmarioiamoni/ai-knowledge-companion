import { MetadataRoute } from 'next'

/**
 * Robots.txt Generation
 * Controls search engine crawling behavior
 * https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots
 */
export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://aiknowledgecompanion.com'

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',           // Don't crawl API routes
          '/dashboard/',     // Don't crawl authenticated pages
          '/profile/',       // Don't crawl user profiles
          '/documents/',     // Don't crawl user documents
          '/multimedia/',    // Don't crawl user multimedia
          '/*?*',            // Don't crawl URLs with query parameters
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/api/',
          '/dashboard/',
          '/profile/',
          '/documents/',
          '/multimedia/',
        ],
        crawlDelay: 0,
      },
      {
        userAgent: 'Bingbot',
        allow: '/',
        disallow: [
          '/api/',
          '/dashboard/',
          '/profile/',
          '/documents/',
          '/multimedia/',
        ],
        crawlDelay: 0,
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}

