import { Button } from '@/components/ui/button'
import { useTranslations } from 'next-intl'
import type { JSX } from 'react'

interface UserMenuProps {
  userEmail?: string
  onSignOut: () => void
}

export function UserMenu({ userEmail, onSignOut }: UserMenuProps): JSX.Element {
  const t = useTranslations('navigation')

  return (
    <div className="hidden md:flex items-center gap-3 lg:gap-4">
      <span className="text-xs lg:text-sm text-gray-600 dark:text-gray-400 truncate max-w-[120px] lg:max-w-[200px]">
        {userEmail}
      </span>
      <Button
        variant="outline"
        size="sm"
        onClick={onSignOut}
        className="text-xs lg:text-sm"
      >
        {t('logout')}
      </Button>
    </div>
  )
}

