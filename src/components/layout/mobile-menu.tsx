'use client'

import { JSX, useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Link, usePathname } from '@/i18n/navigation'
import { Button } from '@/components/ui/button'
import { 
  Menu, 
  X, 
  FileText, 
  Users, 
  LayoutDashboard,
  LogOut,
  User as UserIcon
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface MobileMenuProps {
  user: any
  onSignOut: () => void
  locale: string
}

export function MobileMenu({ user, onSignOut, locale }: MobileMenuProps): JSX.Element {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const t = useTranslations('navigation')

  // Chiudi menu quando cambia route
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  // Previeni scroll quando menu aperto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const menuItems = [
    { href: '/documents', icon: FileText, label: t('documents') },
    { href: '/tutors', icon: Users, label: t('tutors') },
    { href: '/dashboard', icon: LayoutDashboard, label: t('dashboard') },
  ]

  return (
    <>
      {/* Hamburger Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden p-2"
        aria-label="Toggle menu"
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <Menu className="h-6 w-6" />
        )}
      </Button>

      {/* Overlay con blur */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-md z-40 md:hidden transition-all duration-300"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Slide-in Menu */}
      <div
        className={cn(
          "fixed top-0 left-0 h-screen w-[280px] bg-white dark:bg-gray-900 shadow-xl z-50 transform transition-transform duration-300 ease-in-out md:hidden overflow-hidden",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b flex-shrink-0">
            <h2 className="text-lg font-semibold">Menu</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="p-2"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* User Info */}
          {user && (
            <div className="p-4 border-b bg-gray-50 dark:bg-gray-800/50 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                  {user.email?.[0]?.toUpperCase() || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {user.email}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {t('profile')}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Links */}
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
                        "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                        isActive
                          ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                      )}
                    >
                      <Icon className="h-5 w-5 flex-shrink-0" />
                      <span className="font-medium">{item.label}</span>
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

          {/* Footer Actions */}
          <div className="p-4 border-t space-y-2 flex-shrink-0">
            {user ? (
              <Button
                variant="outline"
                className="w-full justify-start gap-3"
                onClick={() => {
                  setIsOpen(false)
                  onSignOut()
                }}
              >
                <LogOut className="h-4 w-4" />
                {t('logout')}
              </Button>
            ) : (
              <div className="space-y-2">
                <Link href="/auth/login" className="block">
                  <Button variant="outline" className="w-full">
                    {t('login')}
                  </Button>
                </Link>
                <Link href="/auth/signup" className="block">
                  <Button className="w-full">
                    {t('signup')}
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

