'use client'

import { JSX } from 'react'
import { useTranslations } from 'next-intl'
import { useAuth } from '@/hooks/use-auth'
import { LanguageSwitcher } from '@/components/language-switcher'
import { Link, useRouter } from '@/i18n/navigation'
import { Button } from '@/components/ui/button'

interface HeaderProps {
    locale: string
}

export function Header({ locale }: HeaderProps): JSX.Element {
    const { user, signOut } = useAuth()
    const router = useRouter()
    const t = useTranslations('navigation')

    const handleSignOut = async () => {
        await signOut()
        router.push('/')
    }

    return (
        <header className="border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
            <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                <div className="flex items-center gap-8">
                    <Link href="/">
                        <h1 className="text-xl font-semibold hover:text-blue-600 transition-colors">
                            AI Knowledge Companion
                        </h1>
                    </Link>

                    {user && (
                        <nav className="flex items-center gap-6">
                            <Link
                                href="/documents"
                                className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
                            >
                                {t('documents')}
                            </Link>
                            <Link
                                href="/tutors"
                                className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
                            >
                                {t('tutors')}
                            </Link>
                            <Link
                                href="/dashboard"
                                className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
                            >
                                {t('dashboard')}
                            </Link>
                        </nav>
                    )}
                </div>

                <div className="flex items-center gap-4">
                    <LanguageSwitcher />

                    {user ? (
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-gray-600">
                                {user.email}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleSignOut}
                            >
                                {t('logout')}
                            </Button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Link href="/auth/login">
                                <Button variant="outline" size="sm">
                                    {t('login')}
                                </Button>
                            </Link>
                            <Link href="/auth/signup">
                                <Button size="sm">
                                    {t('signup')}
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </header>
    )
}
