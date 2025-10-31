import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'
import type { JSX } from 'react'

interface MenuHeaderProps {
  onClose: () => void
}

export function MenuHeader({ onClose }: MenuHeaderProps): JSX.Element {
  return (
    <div className="flex items-center justify-between p-4 border-b flex-shrink-0">
      <h2 className="text-lg font-semibold">Menu</h2>
      <Button
        variant="ghost"
        size="sm"
        onClick={onClose}
        className="p-2"
        aria-label="Close menu"
      >
        <X className="h-5 w-5" />
      </Button>
    </div>
  )
}

