/**
 * Usage Quota Card Component
 * Displays a single quota metric with progress bar
 */

import { JSX } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import type { LucideIcon } from 'lucide-react'

interface UsageQuotaCardProps {
  icon: LucideIcon
  title: string
  current: number
  max: number
  percentage: number
  unit?: string
  formatValue?: (value: number) => string
}

export function UsageQuotaCard({
  icon: Icon,
  title,
  current,
  max,
  percentage,
  unit,
  formatValue,
}: UsageQuotaCardProps): JSX.Element {
  const displayCurrent = formatValue ? formatValue(current) : current.toLocaleString()
  const displayMax = formatValue ? formatValue(max) : max.toLocaleString()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon className="h-5 w-5" />
          {title}
        </CardTitle>
        <CardDescription>
          {displayCurrent} / {displayMax}
          {unit && ` ${unit}`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Progress value={percentage} className="h-2" />
        <p className="text-sm text-muted-foreground mt-2">
          {percentage.toFixed(1)}% used
        </p>
      </CardContent>
    </Card>
  )
}

