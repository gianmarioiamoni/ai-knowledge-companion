/**
 * Cookie Category Item Component
 * Displays a single cookie category with toggle
 */

import { JSX } from 'react'
import { useTranslations } from 'next-intl'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'

interface CookieCategoryItemProps {
  categoryKey: 'necessary' | 'analytics' | 'preferences' | 'marketing'
  checked: boolean
  disabled?: boolean
  onToggle: () => void
}

export function CookieCategoryItem({
  categoryKey,
  checked,
  disabled = false,
  onToggle,
}: CookieCategoryItemProps): JSX.Element {
  const t = useTranslations('cookies.categories')

  const isNecessary = categoryKey === 'necessary'

  return (
    <div className={`space-y-3 ${!isNecessary ? 'border-t pt-4' : ''}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1 flex-1">
          <Label
            htmlFor={categoryKey}
            className={`text-base font-semibold ${!disabled ? 'cursor-pointer' : ''}`}
          >
            {t(`${categoryKey}.title`)}
          </Label>
          <p className="text-sm text-muted-foreground">
            {t(`${categoryKey}.description`)}
          </p>
          {!isNecessary && (
            <p className="text-xs text-muted-foreground italic">
              {t(`${categoryKey}.examples`)}
            </p>
          )}
        </div>

        {isNecessary ? (
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              {t('necessary.alwaysOn')}
            </span>
            <Switch checked={true} disabled />
          </div>
        ) : (
          <Switch
            id={categoryKey}
            checked={checked}
            disabled={disabled}
            onCheckedChange={onToggle}
          />
        )}
      </div>
    </div>
  )
}

