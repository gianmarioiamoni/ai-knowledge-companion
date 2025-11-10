/**
 * Cookie Banner Component
 * Displays the bottom banner with consent options
 */

import { JSX } from 'react'
import { useTranslations } from 'next-intl'
import { Cookie, Settings, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface CookieBannerProps {
  onAcceptAll: () => void
  onRejectAll: () => void
  onCustomize: () => void
}

export function CookieBanner({
  onAcceptAll,
  onRejectAll,
  onCustomize,
}: CookieBannerProps): JSX.Element {
  const t = useTranslations('cookies.banner')

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6 bg-gradient-to-t from-black/50 to-transparent pointer-events-none">
      <Card className="max-w-4xl mx-auto shadow-2xl border-2 pointer-events-auto">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-2">
              <Cookie className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">{t('title')}</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0"
              onClick={onRejectAll}
              aria-label="Close and reject all"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <CardDescription className="text-sm">
            {t('description')}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="default"
              className="flex-1 sm:flex-none"
              onClick={onAcceptAll}
            >
              {t('acceptAll')}
            </Button>

            <Button
              variant="outline"
              className="flex-1 sm:flex-none"
              onClick={onRejectAll}
            >
              {t('necessaryOnly')}
            </Button>

            <Button
              variant="outline"
              className="flex-1 sm:flex-none gap-2"
              onClick={onCustomize}
            >
              <Settings className="h-4 w-4" />
              {t('customize')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

