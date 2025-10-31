import { Link } from '@/i18n/navigation'
import { Button } from '@/components/ui/button'
import { useTranslations } from 'next-intl'
import { LogOut } from 'lucide-react'
import type { JSX } from 'react'

interface MenuFooterProps {
  user: any
  onSignOut: () => void
  onClose: () => void
}

export function MenuFooter({ user, onSignOut, onClose }: MenuFooterProps): JSX.Element {
  const t = useTranslations('navigation')

  const handleSignOut = () => {
    onClose()
    onSignOut()
  }

  return (
    <div className="p-4 border-t space-y-2 flex-shrink-0">
      {user ? (
        <Button
          variant="outline"
          className="w-full justify-start gap-3"
          onClick={handleSignOut}
        >
          <LogOut className="h-4 w-4" />
          {t('logout')}
        </Button>
      ) : (
        <div className="space-y-2">
          <Link href="/auth/login" className="block">
            <Button variant="outline" className="w-full">
              {t('login')}
            </Button>
          </Link>
          <Link href="/auth/signup" className="block">
            <Button className="w-full">
              {t('signup')}
            </Button>
          </Link>
        </div>
      )}
    </div>
  )
}

