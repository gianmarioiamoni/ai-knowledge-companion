import { useMemo } from 'react'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { humanizeSlug } from './humanize-slug'

export interface BreadcrumbItem {
  label: string
  href: string
  isCurrentPage: boolean
}

interface UseBreadcrumbItemsProps {
  locale: string
}

/**
 * Hook for breadcrumb items logic
 * Handles route parsing, translation resolution, and item construction
 * 
 * Translation resolution strategy:
 * 1. Try navigation.{segment} - most routes are already translated there
 * 2. Try breadcrumb.{segment} - for special routes
 * 3. Fallback to humanized segment - automatic for new pages
 */
export const useBreadcrumbItems = ({ locale }: UseBreadcrumbItemsProps): BreadcrumbItem[] => {
  const pathname = usePathname()
  const t = useTranslations('navigation')
  const tBreadcrumb = useTranslations('breadcrumb')

  return useMemo((): BreadcrumbItem[] => {
    /**
     * Gets the translated label for a route segment
     * Uses intelligent fallback strategy for automatic translation
     */
    const getSegmentLabel = (segment: string): string => {
      // 1. Try navigation translations (most common routes)
      try {
        const navLabel = t(segment as any)
        if (navLabel && navLabel !== segment) {
          return navLabel
        }
      } catch {
        // Translation key doesn't exist in navigation
      }

      // 2. Try breadcrumb-specific translations (special routes)
      try {
        const breadcrumbLabel = tBreadcrumb(segment as any)
        if (breadcrumbLabel && breadcrumbLabel !== segment) {
          return breadcrumbLabel
        }
      } catch {
        // Translation key doesn't exist in breadcrumb
      }

      // 3. Fallback: humanize the segment for automatic readability
      return humanizeSlug(segment)
    }

    // Remove locale prefix from pathname
    const pathWithoutLocale = pathname.replace(`/${locale}`, '') || '/'
    
    // If we're on the home page, don't show breadcrumb
    if (pathWithoutLocale === '/') {
      return []
    }

    // Split path into segments
    const segments = pathWithoutLocale.split('/').filter(Boolean)
    
    // Build breadcrumb items
    const items: BreadcrumbItem[] = [
      {
        label: t('home'),
        href: `/${locale}`,
        isCurrentPage: false
      }
    ]

    let currentPath = `/${locale}`
    segments.forEach((segment, index) => {
      currentPath += `/${segment}`
      const isLast = index === segments.length - 1
      
      items.push({
        label: getSegmentLabel(segment),
        href: currentPath,
        isCurrentPage: isLast
      })
    })

    return items
  }, [pathname, locale, t, tBreadcrumb])
}

