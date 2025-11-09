/**
 * Usage Item Component - Single usage metric with progress bar
 */

import { JSX } from 'react'
import { Progress } from '@/components/ui/progress'

interface UsageItemProps {
  label: string
  current: number
  max: number
  isUnlimited: boolean
  unlimitedText: string
  showProgress?: boolean
}

export function UsageItem({ 
  label, 
  current, 
  max, 
  isUnlimited,
  unlimitedText,
  showProgress = true
}: UsageItemProps): JSX.Element {
  const usage = max > 0 ? (current / max) * 100 : 0
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">
          {isUnlimited ? unlimitedText : `${current} / ${max}`}
        </span>
      </div>
      {showProgress && !isUnlimited && (
        <Progress value={usage} className="h-2" />
      )}
    </div>
  )
}

