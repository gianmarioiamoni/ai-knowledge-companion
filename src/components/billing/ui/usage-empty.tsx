/**
 * Usage Empty Component
 * Displays empty state when no usage data available
 */

import { JSX } from 'react'

export function UsageEmpty(): JSX.Element {
  return (
    <div className="p-8 text-center">
      No usage data available
    </div>
  )
}

