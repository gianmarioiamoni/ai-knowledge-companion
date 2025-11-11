import Link from 'next/link'
import { Home } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface BreadcrumbItemProps {
  label: string
  href: string
  isCurrentPage: boolean
  isHome: boolean
}

/**
 * Individual breadcrumb item component
 * Handles rendering of a single breadcrumb link or current page indicator
 */
export const BreadcrumbItem = ({ 
  label, 
  href, 
  isCurrentPage, 
  isHome 
}: BreadcrumbItemProps) => {
  const tBreadcrumb = useTranslations('breadcrumb')

  if (isCurrentPage) {
    return (
      <span 
        className="font-medium text-foreground truncate max-w-[200px]"
        aria-current="page"
      >
        {isHome && (
          <Home className="h-3 w-3 inline mr-1" aria-hidden="true" />
        )}
        {label}
      </span>
    )
  }

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

