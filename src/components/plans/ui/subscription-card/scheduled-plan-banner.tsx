/**
 * Scheduled Plan Banner Component
 * Displays information about a scheduled plan change
 */

import { JSX } from 'react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Calendar, Info } from 'lucide-react'

interface ScheduledPlanBannerProps {
  scheduledPlanName: string
  scheduledBillingCycle: string
  scheduledChangeDate: string
  currentPlanName: string
  currentBillingCycle: string
  // Translations
  titleText: string
  descriptionText: string
  effectiveDateText: string
}

export function ScheduledPlanBanner({
  scheduledPlanName,
  scheduledBillingCycle,
  scheduledChangeDate,
  currentPlanName,
  currentBillingCycle,
  titleText,
  descriptionText,
  effectiveDateText,
}: ScheduledPlanBannerProps): JSX.Element {
  // Format date
  const changeDate = new Date(scheduledChangeDate)
  const formattedDate = changeDate.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  // Determine if upgrade or downgrade
  const planOrder = { trial: 0, pro: 1, enterprise: 2 }
  const currentRank = planOrder[currentPlanName.toLowerCase() as keyof typeof planOrder] || 0
  const scheduledRank = planOrder[scheduledPlanName.toLowerCase() as keyof typeof planOrder] || 0
  const isUpgrade = scheduledRank > currentRank
  const isDowngrade = scheduledRank < currentRank

  return (
    <Alert className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/50">
      <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
      <AlertTitle className="text-blue-900 dark:text-blue-100">
        {titleText}
      </AlertTitle>
      <AlertDescription className="text-blue-800 dark:text-blue-200 space-y-2">
        <div>
          {descriptionText
            .replace('{current}', `${currentPlanName} (${currentBillingCycle})`)
            .replace('{scheduled}', `${scheduledPlanName} (${scheduledBillingCycle})`)}
        </div>
        <div className="flex items-center gap-2 text-sm font-medium">
          <Calendar className="h-3.5 w-3.5" />
          <span>
            {effectiveDateText}: {formattedDate}
          </span>
        </div>
        {isDowngrade && (
          <div className="text-xs mt-2 text-blue-700 dark:text-blue-300">
            💡 {/* Emoji for tip */}
            Your current plan benefits will remain active until the change date.
          </div>
        )}
        {isUpgrade && (
          <div className="text-xs mt-2 text-blue-700 dark:text-blue-300">
            🚀 {/* Emoji for upgrade */}
            You'll be charged a prorated amount for the remaining days when upgrading.
          </div>
        )}
      </AlertDescription>
    </Alert>
  )
}

