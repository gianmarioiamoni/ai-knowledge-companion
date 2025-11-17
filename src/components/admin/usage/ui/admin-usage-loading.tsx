/**
 * Admin Usage Loading Component
 * Displays loading state for admin usage dashboard
 */

import { JSX } from 'react'

export function AdminUsageLoading(): JSX.Element {
  return (
    <div className="p-8 text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
      <p className="mt-4 text-muted-foreground">Loading usage data...</p>
    </div>
  )
}

