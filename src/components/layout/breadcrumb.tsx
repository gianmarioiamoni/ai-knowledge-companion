'use client'

import { useTranslations } from 'next-intl'
import { useBreadcrumbItems } from './breadcrumb/use-breadcrumb-items'
import { BreadcrumbList } from './breadcrumb/breadcrumb-list'

interface BreadcrumbProps {
  locale: string
}

/**
 * Main Breadcrumb navigation component
 * 
 * Responsibilities:
 * - Orchestrates breadcrumb rendering
 * - Handles conditional rendering logic
 * - Provides semantic HTML structure and accessibility
 * 
 * Delegates to:
 * - useBreadcrumbItems: Breadcrumb logic and item construction
 * - BreadcrumbList: Visual presentation of breadcrumb items
 * 
 * @see {@link useBreadcrumbItems} for translation strategy and item construction
 */
export function Breadcrumb({ locale }: BreadcrumbProps) {
  const tBreadcrumb = useTranslations('breadcrumb')
  const breadcrumbItems = useBreadcrumbItems({ locale })

  // Don't render if we're on home page or only have home in breadcrumb
  if (breadcrumbItems.length <= 1) {
    return null
  }

  return (
    <nav 
      aria-label={tBreadcrumb('ariaLabel')}
      className="border-b border-border/40 bg-background/50 backdrop-blur-sm"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <BreadcrumbList items={breadcrumbItems} />
      </div>
    </nav>
  )
}

