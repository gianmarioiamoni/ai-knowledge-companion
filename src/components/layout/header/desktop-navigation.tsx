import { Link } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'
import type { JSX } from 'react'

interface DesktopNavigationProps {
  isActivePath: (path: string) => boolean
}

interface NavItem {
  href: string
  label: string
}

export function DesktopNavigation({ isActivePath }: DesktopNavigationProps): JSX.Element {
  const t = useTranslations('navigation')

  const navItems: NavItem[] = [
    { href: '/documents', label: t('documents') },
    { href: '/tutors', label: t('tutors') },
    { href: '/marketplace', label: t('marketplace') },
    { href: '/billing', label: t('billing') },
    { href: '/dashboard', label: t('dashboard') },
    { href: '/contact', label: t('contact') },
  ]

  return (
    <nav className="hidden md:flex items-center gap-2 lg:gap-3">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "relative px-4 py-2 text-sm lg:text-base font-medium rounded-lg transition-all duration-200",
            isActivePath(item.href)
              ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 shadow-sm"
              : "text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800/50"
          )}
        >
          {item.label}
          {isActivePath(item.href) && (
            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full" />
          )}
        </Link>
      ))}
    </nav>
  )
}

