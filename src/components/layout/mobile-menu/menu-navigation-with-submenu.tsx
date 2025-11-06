/**
 * Mobile Menu Navigation with Submenu Support
 * Supports nested menu items with collapsible sections
 */

'use client'

import { useState } from 'react'
import { Link } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'
import { FileText, Users, LayoutDashboard, Store, CreditCard, FolderOpen, Music, ChevronDown, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { JSX } from 'react'

interface MenuSubItem {
  href: string
  icon: LucideIcon
  label: string
}

interface MenuItem {
  href?: string
  icon: LucideIcon
  label: string
  subItems?: MenuSubItem[]
}

interface MenuNavigationProps {
  user: any
  pathname: string
  onNavigate?: () => void
}

export function MenuNavigationWithSubmenu({ user, pathname, onNavigate }: MenuNavigationProps): JSX.Element {
  const t = useTranslations('navigation')
  const [expandedItem, setExpandedItem] = useState<string | null>(null)

  const menuItems: MenuItem[] = [
    {
      icon: FolderOpen,
      label: t('storage'),
      subItems: [
        { href: '/documents', icon: FileText, label: t('documents') },
        { href: '/multimedia', icon: Music, label: t('multimedia') },
      ],
    },
    { href: '/tutors', icon: Users, label: t('tutors') },
    { href: '/marketplace', icon: Store, label: t('marketplace') },
    { href: '/billing', icon: CreditCard, label: t('billing') },
    { href: '/dashboard', icon: LayoutDashboard, label: t('dashboard') },
  ]

  const isSubmenuActive = (subItems?: MenuSubItem[]) => {
    if (!subItems) return false
    return subItems.some((item) => pathname === item.href)
  }

  const handleItemClick = (itemKey: string) => {
    if (expandedItem === itemKey) {
      setExpandedItem(null)
    } else {
      setExpandedItem(itemKey)
    }
  }

  return (
    <nav className="flex-1 overflow-y-auto py-4">
      {user ? (
        <div className="space-y-1 px-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            const itemKey = item.href || item.label
            const hasSubItems = item.subItems && item.subItems.length > 0
            const isActive = item.href ? pathname === item.href : isSubmenuActive(item.subItems)
            const isExpanded = expandedItem === itemKey || isSubmenuActive(item.subItems)

            if (hasSubItems) {
              // Menu item with submenu
              return (
                <div key={itemKey}>
                  {/* Parent Item */}
                  <button
                    onClick={() => handleItemClick(itemKey)}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                      isActive
                        ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 shadow-sm font-semibold"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 font-medium"
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-5 w-5 flex-shrink-0 transition-transform",
                        isActive && "scale-110"
                      )}
                    />
                    <span className="flex-1 text-left">{item.label}</span>
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 transition-transform duration-200",
                        isExpanded && "rotate-180"
                      )}
                    />
                    {isActive && (
                      <span className="w-1 h-1 rounded-full bg-blue-600 dark:bg-blue-400" />
                    )}
                  </button>

                  {/* Submenu */}
                  {isExpanded && (
                    <div className="mt-1 ml-4 pl-4 border-l-2 border-gray-200 dark:border-gray-700 space-y-1">
                      {item.subItems?.map((subItem) => {
                        const SubIcon = subItem.icon
                        const isSubActive = pathname === subItem.href

                        return (
                          <Link
                            key={subItem.href}
                            href={subItem.href}
                            onClick={onNavigate}
                            className={cn(
                              "flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200",
                              isSubActive
                                ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-semibold"
                                : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                            )}
                          >
                            <SubIcon className="h-4 w-4 flex-shrink-0" />
                            <span className="text-sm">{subItem.label}</span>
                            {isSubActive && (
                              <span className="ml-auto w-1 h-1 rounded-full bg-blue-600 dark:bg-blue-400" />
                            )}
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            }

            // Regular menu item
            return (
              <Link
                key={itemKey}
                href={item.href!}
                onClick={onNavigate}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                  isActive
                    ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 shadow-sm font-semibold"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 font-medium"
                )}
              >
                <Icon
                  className={cn(
                    "h-5 w-5 flex-shrink-0 transition-transform",
                    isActive && "scale-110"
                  )}
                />
                <span>{item.label}</span>
                {isActive && (
                  <span className="ml-auto w-1 h-1 rounded-full bg-blue-600 dark:bg-blue-400" />
                )}
              </Link>
            )
          })}
        </div>
      ) : (
        <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400 text-sm px-4 text-center">
          {t('loginToAccess') || 'Login to access all features'}
        </div>
      )}
    </nav>
  )
}

