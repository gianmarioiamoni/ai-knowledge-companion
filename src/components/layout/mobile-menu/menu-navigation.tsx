import { Link } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'
import { FileText, Users, LayoutDashboard, Store, CreditCard, MessageSquare, type LucideIcon } from 'lucide-react'
import type { User } from '@supabase/supabase-js'
import { cn } from '@/lib/utils'
import type { JSX } from 'react'

interface MenuItem {
  href: string
  icon: LucideIcon
  label: string
}

interface MenuNavigationProps {
  user: User | null
  pathname: string
}

export function MenuNavigation({ user, pathname }: MenuNavigationProps): JSX.Element {
  const t = useTranslations('navigation')

  const menuItems: MenuItem[] = [
    { href: '/documents', icon: FileText, label: t('documents') },
    { href: '/tutors', icon: Users, label: t('tutors') },
    { href: '/marketplace', icon: Store, label: t('marketplace') },
    { href: '/billing', icon: CreditCard, label: t('billing') },
    { href: '/dashboard', icon: LayoutDashboard, label: t('dashboard') },
    { href: '/contact', icon: MessageSquare, label: t('contact') },
  ]

  return (
    <nav className="flex-1 overflow-y-auto py-4">
      {user ? (
        <div className="space-y-1 px-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                  isActive
                    ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 shadow-sm font-semibold"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 font-medium"
                )}
              >
                <Icon className={cn(
                  "h-5 w-5 flex-shrink-0 transition-transform",
                  isActive && "scale-110"
                )} />
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

