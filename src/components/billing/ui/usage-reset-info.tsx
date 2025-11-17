/**
 * Usage Reset Info Component
 * Displays next reset date information
 */

import { JSX } from 'react'
import { Card, CardContent } from '@/components/ui/card'

interface UsageResetInfoProps {
  nextResetAt: string
}

export function UsageResetInfo({ nextResetAt }: UsageResetInfoProps): JSX.Element {
  return (
    <Card>
      <CardContent className="pt-6">
        <p className="text-sm text-muted-foreground">
          Your quota will reset on {new Date(nextResetAt).toLocaleDateString()}
        </p>
      </CardContent>
    </Card>
  )
}

