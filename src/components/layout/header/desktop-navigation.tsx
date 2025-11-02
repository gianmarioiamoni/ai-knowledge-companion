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
    { href: '/dashboard', label: t('dashboard') },
    { href: '/profile', label: t('profile') },
  ]

  return (
    <nav className="hidden md:flex items-center gap-4 lg:gap-6">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "text-sm lg:text-base transition-colors",
            isActivePath(item.href)
              ? "text-blue-600 dark:text-blue-400 font-medium"
              : "text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
          )}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  )
}

