import { Button } from '@/components/ui/button'
import { Link } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'
import { UserCircle } from 'lucide-react'
import type { JSX } from 'react'

interface UserMenuProps {
  userEmail?: string
  onSignOut: () => void
}

export function UserMenu({ userEmail, onSignOut }: UserMenuProps): JSX.Element {
  const t = useTranslations('navigation')

  return (
    <div className="hidden md:flex items-center gap-3 lg:gap-4">
      <Link 
        href="/profile" 
        className="flex items-center gap-1.5 text-xs lg:text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors truncate max-w-[120px] lg:max-w-[200px] group"
      >
        <UserCircle className="h-4 w-4 flex-shrink-0 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
        <span className="truncate">{userEmail}</span>
      </Link>
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

