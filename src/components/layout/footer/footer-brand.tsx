/**
 * Footer Brand Section Component
 * Displays the brand name and tagline
 */

import { JSX } from 'react'
import { useTranslations } from 'next-intl'

export function FooterBrand(): JSX.Element {
  const t = useTranslations('footer')

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-lg">AI Knowledge Companion</h3>
      <p className="text-sm text-muted-foreground">
        {t('tagline')}
      </p>
    </div>
  )
}

