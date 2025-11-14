/**
 * Desktop Navigation with Submenu Support
 * Supports nested menu items with dropdown and role-based visibility
 */

'use client'

import { useState } from 'react'
import { Link } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'
import { ChevronDown } from 'lucide-react'
import { useRole } from '@/hooks/use-role'
import type { JSX } from 'react'

interface DesktopNavigationProps {
  isActivePath: (path: string) => boolean
}

interface NavSubItem {
  href: string
  label: string
  adminOnly?: boolean
  superAdminOnly?: boolean
}

interface NavItem {
  href?: string
  label: string
  subItems?: NavSubItem[]
  adminOnly?: boolean
  superAdminOnly?: boolean
  hideForUsers?: boolean
  hideForAdmins?: boolean
}

export function DesktopNavigationWithSubmenu({ isActivePath }: DesktopNavigationProps): JSX.Element {
  const t = useTranslations('navigation')
  const { isAdmin, isSuperAdmin } = useRole()
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)

  const navItems: NavItem[] = [
    // User menus - hidden for admins
    {
      label: t('storage'),
      hideForAdmins: true,
      subItems: [
        { href: '/documents', label: t('documents') },
        { href: '/multimedia', label: t('multimedia') },
      ],
    },
    { href: '/tutors', label: t('tutors'), hideForAdmins: true },
    { href: '/marketplace', label: t('marketplace'), hideForAdmins: true },
    { href: '/plans', label: t('plans'), hideForAdmins: true },
    { href: '/dashboard', label: t('dashboard'), hideForAdmins: true },
    // Contact - visible to all authenticated users
    { href: '/contact', label: t('contact') },
    // Admin menu - only for admin/super_admin
    {
      label: t('admin'),
      adminOnly: true,
      subItems: [
        { href: '/admin/dashboard', label: t('adminDashboard') },
        { href: '/admin/users', label: t('adminUsers') },
        { href: '/admin/billing', label: t('adminBilling') },
      ],
    },
  ]

  // Filter items based on role
  const visibleItems = navItems.filter((item) => {
    if (item.superAdminOnly && !isSuperAdmin) return false
    if (item.adminOnly && !isAdmin) return false
    if (item.hideForUsers && !isAdmin) return false
    if (item.hideForAdmins && isAdmin) return false
    return true
  })

  const isSubmenuActive = (subItems?: NavSubItem[]) => {
    if (!subItems) return false
    return subItems.some((item) => isActivePath(item.href))
  }

  return (
    <nav className="hidden md:flex items-center gap-2 lg:gap-3 flex-nowrap">
      {visibleItems.map((item) => {
        const key = item.href || item.label
        const hasSubItems = item.subItems && item.subItems.length > 0
        const isActive = item.href ? isActivePath(item.href) : isSubmenuActive(item.subItems)

        if (hasSubItems) {
          // Dropdown menu
          return (
            <div
              key={key}
              className="relative flex-shrink-0"
              onMouseEnter={() => setOpenDropdown(key)}
              onMouseLeave={() => setOpenDropdown(null)}
            >
              <button
                className={cn(
                  "relative px-3 lg:px-4 py-2 text-sm lg:text-base font-medium rounded-lg transition-all duration-200 flex items-center gap-1 whitespace-nowrap",
                  isActive
                    ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 shadow-sm"
                    : "text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                )}
              >
                {item.label}
                <ChevronDown
                  className={cn(
                    "h-4 w-4 transition-transform duration-200",
                    openDropdown === key && "rotate-180"
                  )}
                />
                {isActive && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full" />
                )}
              </button>

              {/* Dropdown Menu */}
              {openDropdown === key && (
                <div className="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
                  {item.subItems?.map((subItem) => (
                    <Link
                      key={subItem.href}
                      href={subItem.href}
                      className={cn(
                        "block px-4 py-2 text-sm transition-colors",
                        isActivePath(subItem.href)
                          ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 font-medium"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                      )}
                    >
                      {subItem.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )
        }

        // Regular link
        return (
          <Link
            key={key}
            href={item.href!}
            className={cn(
              "relative px-3 lg:px-4 py-2 text-sm lg:text-base font-medium rounded-lg transition-all duration-200 whitespace-nowrap flex-shrink-0",
              isActive
                ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 shadow-sm"
                : "text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800/50"
            )}
          >
            {item.label}
            {isActive && (
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full" />
            )}
          </Link>
        )
      })}
    </nav>
  )
}

