'use client'

import { JSX } from 'react'
import { useTranslations } from 'next-intl'
import { useAuth } from '@/hooks/use-auth'
import { LanguageSwitcher } from '@/components/language-switcher'
import { Link, useRouter, usePathname } from '@/i18n/navigation'
import { Button } from '@/components/ui/button'
import { MobileMenu } from './mobile-menu'
import { cn } from '@/lib/utils'

interface HeaderProps {
    locale: string
}

export function Header({ locale }: HeaderProps): JSX.Element {
    const { user, signOut } = useAuth()
    const router = useRouter()
    const pathname = usePathname()
    const t = useTranslations('navigation')

    const handleSignOut = async () => {
        await signOut()
        router.push('/')
    }

    const isActivePath = (path: string) => pathname === path

    return (
        <header className="sticky top-0 z-30 border-b bg-white/95 dark:bg-gray-900/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-gray-900/60">
            <div className="mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
                <div className="flex justify-between items-center gap-2 sm:gap-4">
                    {/* Left: Mobile Menu + Logo */}
                    <div className="flex items-center gap-2 sm:gap-4 min-w-0">
                        {/* Mobile Menu - Solo per utenti autenticati */}
                        {user && (
                            <MobileMenu
                                user={user}
                                onSignOut={handleSignOut}
                                locale={locale}
                            />
                        )}

                        {/* Logo */}
                        <Link href="/" className="min-w-0">
                            <h1 className="text-sm sm:text-base md:text-lg lg:text-xl font-semibold hover:text-blue-600 transition-colors truncate">
                                <span className="hidden sm:inline">AI Knowledge Companion</span>
                                <span className="sm:hidden">AI KC</span>
                            </h1>
                        </Link>

                        {/* Desktop Navigation */}
                        {user && (
                            <nav className="hidden md:flex items-center gap-4 lg:gap-6">
                                <Link
                                    href="/documents"
                                    className={cn(
                                        "text-sm lg:text-base transition-colors",
                                        isActivePath('/documents')
                                            ? "text-blue-600 dark:text-blue-400 font-medium"
                                            : "text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                                    )}
                                >
                                    {t('documents')}
                                </Link>
                                <Link
                                    href="/tutors"
                                    className={cn(
                                        "text-sm lg:text-base transition-colors",
                                        isActivePath('/tutors')
                                            ? "text-blue-600 dark:text-blue-400 font-medium"
                                            : "text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                                    )}
                                >
                                    {t('tutors')}
                                </Link>
                                <Link
                                    href="/dashboard"
                                    className={cn(
                                        "text-sm lg:text-base transition-colors",
                                        isActivePath('/dashboard')
                                            ? "text-blue-600 dark:text-blue-400 font-medium"
                                            : "text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                                    )}
                                >
                                    {t('dashboard')}
                                </Link>
                            </nav>
                        )}
                    </div>

                    {/* Right: Language Switcher + User Actions */}
                    <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 flex-shrink-0">
                        <LanguageSwitcher />

                        {user ? (
                            <div className="hidden md:flex items-center gap-3 lg:gap-4">
                                <span className="text-xs lg:text-sm text-gray-600 dark:text-gray-400 truncate max-w-[120px] lg:max-w-[200px]">
                                    {user.email}
                                </span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleSignOut}
                                    className="text-xs lg:text-sm"
                                >
                                    {t('logout')}
                                </Button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-1.5 sm:gap-2">
                                <Link href="/auth/login">
                                    <Button variant="outline" size="sm" className="text-xs sm:text-sm px-2 sm:px-4">
                                        {t('login')}
                                    </Button>
                                </Link>
                                <Link href="/auth/signup">
                                    <Button size="sm" className="text-xs sm:text-sm px-2 sm:px-4">
                                        {t('signup')}
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    )
}
