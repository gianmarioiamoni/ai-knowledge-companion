/**
 * Usage Alerts Component
 * Displays usage alerts and warnings
 */

import { JSX } from 'react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'
import type { UsageAlert } from '@/types/billing'

interface UsageAlertsProps {
  alerts: UsageAlert[]
}

export function UsageAlerts({ alerts }: UsageAlertsProps): JSX.Element | null {
  if (alerts.length === 0) {
    return null
  }

  return (
    <div className="space-y-2">
      {alerts.map((alert) => (
        <Alert key={alert.id} variant={alert.alert_type === 'cost' ? 'destructive' : 'default'}>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{alert.alert_type.toUpperCase()}</AlertTitle>
          <AlertDescription>{alert.message}</AlertDescription>
        </Alert>
      ))}
    </div>
  )
}

