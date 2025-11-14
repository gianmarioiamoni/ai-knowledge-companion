'use client'

import { JSX } from 'react'
import { LanguageSwitcher } from '@/components/language-switcher'
import { MobileMenu } from './mobile-menu'
import { useHeader } from '@/hooks/use-header'
import { Logo, UserMenu, AuthButtons } from './header/index'
import { DesktopNavigationWithSubmenu } from './header/desktop-navigation-with-submenu'

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
        <header className="sticky top-0 z-30 border-b bg-white/95 dark:bg-gray-900/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-gray-900/60 shadow-sm">
            <div className="mx-auto max-w-7xl px-2 sm:px-4 lg:px-6 py-2 sm:py-3">
                <div className="flex items-center justify-between gap-2 md:gap-4">
                    {/* Left: Mobile Menu + Logo */}
                    <div className="flex items-center gap-1 sm:gap-2">
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
                    </div>

                    {/* Center: Desktop Navigation - Only for authenticated users */}
                    {user && (
                        <nav className="hidden md:flex flex-1 justify-center max-w-3xl md:overflow-x-auto md:scrollbar-hide lg:overflow-visible" aria-label="Main navigation">
                            <DesktopNavigationWithSubmenu isActivePath={isActivePath} />
                        </nav>
                    )}

                    {/* Right: Language Switcher + User Actions */}
                    <div className="flex flex-col md:flex-col lg:flex-row items-end md:items-center gap-1 md:gap-1.5 lg:gap-2 flex-shrink-0">
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
