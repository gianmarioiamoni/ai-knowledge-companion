/**
 * Plan Badges Component - Display most popular and current plan badges
 */

import { JSX } from 'react'
import { Badge } from '@/components/ui/badge'
import { Zap } from 'lucide-react'

type TranslationFunction = (key: string) => string

interface PlanBadgesProps {
  isMostPopular: boolean
  isCurrentPlan: boolean
  t: TranslationFunction
}

export function PlanBadges({ isMostPopular, isCurrentPlan, t }: PlanBadgesProps): JSX.Element | null {
  return (
    <>
      {isMostPopular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <Badge variant="default" className="bg-primary text-primary-foreground flex items-center gap-1 px-3 py-1">
            <Zap className="h-3 w-3" />
            {t('mostPopular')}
          </Badge>
        </div>
      )}

      {isCurrentPlan && (
        <div className="absolute -top-3 right-4">
          <Badge variant="outline" className="bg-green-50 dark:bg-green-900/20 border-green-500 text-green-700 dark:text-green-300">
            {t('currentPlan')}
          </Badge>
        </div>
      )}
    </>
  )
}

