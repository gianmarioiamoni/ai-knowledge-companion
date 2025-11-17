/**
 * Usage Summary Stats Component
 * Displays last 30 days summary statistics
 */

import { JSX } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { UsageSummary } from '@/types/billing'

interface UsageSummaryStatsProps {
  summary: UsageSummary
}

export function UsageSummaryStats({ summary }: UsageSummaryStatsProps): JSX.Element {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Last 30 Days Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold">{summary.total_api_calls.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">Total Calls</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{summary.total_tokens.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">Total Tokens</div>
          </div>
          <div>
            <div className="text-2xl font-bold">${summary.total_cost.toFixed(2)}</div>
            <div className="text-sm text-muted-foreground">Total Cost</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

