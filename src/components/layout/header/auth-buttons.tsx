import { Link } from '@/i18n/navigation'
import { Button } from '@/components/ui/button'
import { useTranslations } from 'next-intl'
import type { JSX } from 'react'

export function AuthButtons(): JSX.Element {
  const t = useTranslations('navigation')

  return (
    <div className="flex items-center gap-1.5 sm:gap-2">
      <Link href="/contact">
        <Button variant="ghost" size="sm" className="text-xs sm:text-sm px-2 sm:px-3">
          {t('contact')}
        </Button>
      </Link>
      <Link href="/auth/login">
        <Button variant="outline" size="sm" className="text-xs sm:text-sm px-2 sm:px-4">
          {t('login')}
        </Button>
      </Link>
      <Link href="/auth/signup">
        <Button size="sm" className="text-xs sm:text-sm px-2 sm:px-4">
          {t('signup')}
        </Button>
      </Link>
    </div>
  )
}

