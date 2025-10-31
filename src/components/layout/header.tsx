'use client'

import { JSX } from 'react'
import { LanguageSwitcher } from '@/components/language-switcher'
import { MobileMenu } from './mobile-menu'
import { useHeader } from '@/hooks/use-header'
import { Logo, DesktopNavigation, UserMenu, AuthButtons } from './header/index'

interface HeaderProps {
    locale: string
}

/**
 * Header Component
 * 
 * Main navigation header for the application:
 * - Mobile menu (hamburger) for authenticated users
 * - Logo with responsive text
 * - Desktop navigation links
 * - Language switcher
 * - User menu (authenticated) or auth buttons (guest)
 * 
 * Uses SRP: delegates logic to custom hook and rendering to specialized components
 */
export function Header({ locale }: HeaderProps): JSX.Element {
    const {
        user,
        handleSignOut,
        isActivePath
    } = useHeader()

    return (
        <header className="sticky top-0 z-30 border-b bg-white/95 dark:bg-gray-900/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-gray-900/60">
            <div className="mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
                <div className="flex justify-between items-center gap-2 sm:gap-4">
                    {/* Left: Mobile Menu + Logo + Desktop Navigation */}
                    <div className="flex items-center gap-2 sm:gap-4 min-w-0">
                        {/* Mobile Menu - Only for authenticated users */}
                        {user && (
                            <MobileMenu
                                user={user}
                                onSignOut={handleSignOut}
                                locale={locale}
                            />
                        )}

                        {/* Logo */}
                        <Logo />

                        {/* Desktop Navigation - Only for authenticated users */}
                        {user && <DesktopNavigation isActivePath={isActivePath} />}
                    </div>

                    {/* Right: Language Switcher + User Actions */}
                    <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 flex-shrink-0">
                        <LanguageSwitcher />

                        {/* Authenticated: User Menu | Guest: Auth Buttons */}
                        {user ? (
                            <UserMenu userEmail={user.email} onSignOut={handleSignOut} />
                        ) : (
                            <AuthButtons />
                        )}
                    </div>
                </div>
            </div>
        </header>
    )
}
