import type { JSX } from 'react'

interface MenuOverlayProps {
  isOpen: boolean
  onClose: () => void
}

export function MenuOverlay({ isOpen, onClose }: MenuOverlayProps): JSX.Element | null {
  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 bg-black/30 backdrop-blur-md z-[100] md:hidden transition-all duration-300"
      onClick={onClose}
      aria-hidden="true"
    />
  )
}

