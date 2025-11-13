import { useMemo } from 'react'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { humanizeSlug } from './humanize-slug'

export interface BreadcrumbItem {
  label: string
  href: string | null  // null for non-linkable intermediate segments
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
    // Segments that don't have their own page and should not be links
    const nonLinkableSegments = new Set(['auth', 'admin'])
    
    /**
     * Checks if a segment should be rendered as a link
     * Some intermediate segments (like 'auth') don't have their own page
     */
    const isSegmentLinkable = (segment: string, isLast: boolean): boolean => {
      // Current page is never a link
      if (isLast) return false
      // Check if segment is in the non-linkable list
      return !nonLinkableSegments.has(segment)
    }
    /**
     * Gets the translated label for a route segment
     * Uses intelligent fallback strategy for automatic translation
     */
    const getSegmentLabel = (segment: string): string => {
      // 1. Try navigation translations (most common routes)
      try {
        // Type assertion: translation functions accept any string key
        const navLabel = t(segment as string)
        if (navLabel && navLabel !== segment) {
          return navLabel
        }
      } catch {
        // Translation key doesn't exist in navigation
      }

      // 2. Try breadcrumb-specific translations (special routes)
      try {
        // Type assertion: translation functions accept any string key
        const breadcrumbLabel = tBreadcrumb(segment as string)
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
      const isLinkable = isSegmentLinkable(segment, isLast)
      
      items.push({
        label: getSegmentLabel(segment),
        href: isLinkable ? currentPath : null,  // null for non-linkable segments
        isCurrentPage: isLast
      })
    })

    return items
  }, [pathname, locale, t, tBreadcrumb])
}

