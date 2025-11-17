/**
 * Admin Usage Error Component
 * Displays error state for admin usage dashboard
 */

import { JSX } from 'react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'

interface AdminUsageErrorProps {
  error: string
}

export function AdminUsageError({ error }: AdminUsageErrorProps): JSX.Element {
  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>{error}</AlertDescription>
    </Alert>
  )
}

