import { useState, useEffect } from 'react'
import { usePathname } from '@/i18n/navigation'

export function useMobileMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()

  // Ensure we're mounted (client-side only)
  useEffect(() => {
    setMounted(true)
  }, [])

  // Chiudi menu quando cambia route
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  // Previeni scroll e applica blur quando menu aperto
  useEffect(() => {
    const blurTarget = document.getElementById('app-blur-target')
    
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      // Applica blur e scale-down al target specifico (esclude il menu)
      if (blurTarget) {
        blurTarget.style.filter = 'blur(8px)'
        blurTarget.style.transform = 'scale(0.95)'
        blurTarget.style.transition = 'all 0.3s ease-in-out'
        blurTarget.style.transformOrigin = 'center center'
      }
    } else {
      document.body.style.overflow = 'unset'
      // Rimuovi blur e scale
      if (blurTarget) {
        blurTarget.style.filter = 'none'
        blurTarget.style.transform = 'scale(1)'
      }
    }
    
    return () => {
      document.body.style.overflow = 'unset'
      if (blurTarget) {
        blurTarget.style.filter = 'none'
        blurTarget.style.transform = 'scale(1)'
      }
    }
  }, [isOpen])

  const toggleMenu = () => setIsOpen(!isOpen)
  const closeMenu = () => setIsOpen(false)

  return {
    isOpen,
    mounted,
    pathname,
    toggleMenu,
    closeMenu
  }
}

