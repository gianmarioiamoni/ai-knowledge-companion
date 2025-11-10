/**
 * Footer Bottom Bar Component
 * Displays copyright notice and GDPR compliance badge
 */

import { JSX } from 'react'
import { useTranslations } from 'next-intl'

interface FooterBottomBarProps {
  currentYear: number
}

export function FooterBottomBar({ currentYear }: FooterBottomBarProps): JSX.Element {
  const t = useTranslations('footer')

  return (
    <div className="mt-8 pt-8 border-t">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
        <p>
          © {currentYear} AI Knowledge Companion. {t('rights')}
        </p>
        <p className="text-xs">
          {t('gdprCompliant')}
        </p>
      </div>
    </div>
  )
}

