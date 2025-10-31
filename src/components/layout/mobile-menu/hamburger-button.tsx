import { Button } from '@/components/ui/button'
import { Menu, X } from 'lucide-react'
import type { JSX } from 'react'

interface HamburgerButtonProps {
  isOpen: boolean
  onClick: () => void
}

export function HamburgerButton({ isOpen, onClick }: HamburgerButtonProps): JSX.Element {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      className="md:hidden p-2"
      aria-label="Toggle menu"
    >
      {isOpen ? (
        <X className="h-6 w-6" />
      ) : (
        <Menu className="h-6 w-6" />
      )}
    </Button>
  )
}

