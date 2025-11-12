import Link from 'next/link'
import { Home } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface BreadcrumbItemProps {
  label: string
  href: string | null  // null for non-linkable segments
  isCurrentPage: boolean
  isHome: boolean
}

/**
 * Individual breadcrumb item component
 * Handles rendering of a single breadcrumb link, current page, or non-linkable segment
 */
export const BreadcrumbItem = ({ 
  label, 
  href, 
  isCurrentPage, 
  isHome 
}: BreadcrumbItemProps) => {
  const tBreadcrumb = useTranslations('breadcrumb')

  // Current page or non-linkable segment - render as plain text
  if (isCurrentPage || !href) {
    return (
      <span 
        className="font-medium text-foreground truncate max-w-[200px]"
        aria-current={isCurrentPage ? "page" : undefined}
      >
        {isHome && (
          <Home className="h-3 w-3 inline mr-1" aria-hidden="true" />
        )}
        {label}
      </span>
    )
  }

  // Linkable segment - render as link
  return (
    <Link
      href={href}
      className="hover:text-foreground transition-colors truncate max-w-[200px] inline-flex items-center"
      aria-label={isHome ? tBreadcrumb('goToHome') : undefined}
    >
      {isHome && (
        <Home className="h-3 w-3 inline mr-1" aria-hidden="true" />
      )}
      {label}
    </Link>
  )
}

