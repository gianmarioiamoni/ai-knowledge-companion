'use client'

import { JSX } from 'react'
import { createPortal } from 'react-dom'
import { useMobileMenu } from '@/hooks/use-mobile-menu'
import { HamburgerButton, MenuOverlay, MenuPanel } from './mobile-menu/index'

interface MobileMenuProps {
  user: any
  onSignOut: () => void
  locale: string
}

/**
 * Mobile Menu Component
 * 
 * Orchestrates the mobile menu functionality:
 * - Hamburger button in header
 * - Overlay with blur effect
 * - Slide-in menu panel (rendered via Portal)
 * 
 * Uses SRP: delegates logic to custom hook and rendering to specialized components
 */
export function MobileMenu({ user, onSignOut }: MobileMenuProps): JSX.Element {
  const {
    isOpen,
    mounted,
    pathname,
    toggleMenu,
    closeMenu
  } = useMobileMenu()

  // Menu portal - rendered outside app-blur-target to avoid blur effect
  const menuPortal = mounted && (
    <>
      <MenuOverlay isOpen={isOpen} onClose={closeMenu} />
      <MenuPanel
        isOpen={isOpen}
        user={user}
        pathname={pathname}
        onClose={closeMenu}
        onSignOut={onSignOut}
      />
    </>
  )

  return (
    <>
      <HamburgerButton isOpen={isOpen} onClick={toggleMenu} />
      
      {/* Render menu via portal to escape blur context */}
      {mounted && typeof document !== 'undefined' && createPortal(menuPortal, document.body)}
    </>
  )
}

