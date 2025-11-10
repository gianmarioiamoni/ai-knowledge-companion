/**
 * Cookie Preferences Modal Component
 * Displays detailed cookie preferences with toggles for each category
 */

import { JSX } from 'react'
import { useTranslations } from 'next-intl'
import { Cookie } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { CookieCategoryItem } from './cookie-category-item'
import type { CookieConsent } from '@/lib/utils/cookies'

interface CookiePreferencesModalProps {
  open: boolean
  preferences: CookieConsent
  onClose: () => void
  onSave: () => void
  onToggle: (key: keyof CookieConsent) => void
}

export function CookiePreferencesModal({
  open,
  preferences,
  onClose,
  onSave,
  onToggle,
}: CookiePreferencesModalProps): JSX.Element {
  const t = useTranslations('cookies')

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Cookie className="h-5 w-5" />
            {t('modal.title')}
          </DialogTitle>
          <DialogDescription>{t('modal.description')}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Necessary Cookies - Always On */}
          <CookieCategoryItem
            categoryKey="necessary"
            checked={true}
            disabled={true}
            onToggle={() => {}}
          />

          {/* Analytics Cookies */}
          <CookieCategoryItem
            categoryKey="analytics"
            checked={preferences.analytics}
            onToggle={() => onToggle('analytics')}
          />

          {/* Preferences Cookies */}
          <CookieCategoryItem
            categoryKey="preferences"
            checked={preferences.preferences}
            onToggle={() => onToggle('preferences')}
          />

          {/* Marketing Cookies */}
          <CookieCategoryItem
            categoryKey="marketing"
            checked={preferences.marketing}
            onToggle={() => onToggle('marketing')}
          />
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="w-full sm:w-auto"
          >
            {t('modal.close')}
          </Button>
          <Button
            variant="default"
            onClick={onSave}
            className="w-full sm:w-auto"
          >
            {t('banner.savePreferences')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

