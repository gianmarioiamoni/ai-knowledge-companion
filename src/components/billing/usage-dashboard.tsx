/**
 * Usage Dashboard Component
 * Displays usage statistics and quota limits
 */

'use client'

import { JSX } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { useBilling } from '@/hooks/use-billing'
import { calculateUsagePercentage } from '@/lib/supabase/billing'
import { AlertCircle, DollarSign, Cpu, MessageSquare } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

export function UsageDashboard(): JSX.Element {
  const { quota, summary, alerts, isLoading, error } = useBilling()

  if (isLoading) {
    return <div className="p-8 text-center">Loading usage data...</div>
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (!quota) {
    return <div className="p-8 text-center">No usage data available</div>
  }

  const percentages = calculateUsagePercentage(quota)

  return (
    <div className="space-y-6">
      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((alert) => (
            <Alert key={alert.id} variant={alert.alert_type === 'cost' ? 'destructive' : 'default'}>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>{alert.alert_type.toUpperCase()}</AlertTitle>
              <AlertDescription>{alert.message}</AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* Quota Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* API Calls */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              API Calls
            </CardTitle>
            <CardDescription>
              {quota.current_api_calls.toLocaleString()} / {quota.max_api_calls_per_month.toLocaleString()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={percentages.api_calls_percent} className="h-2" />
            <p className="text-sm text-muted-foreground mt-2">
              {percentages.api_calls_percent.toFixed(1)}% used
            </p>
          </CardContent>
        </Card>

        {/* Tokens */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cpu className="h-5 w-5" />
              Tokens
            </CardTitle>
            <CardDescription>
              {quota.current_tokens.toLocaleString()} / {quota.max_tokens_per_month.toLocaleString()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={percentages.tokens_percent} className="h-2" />
            <p className="text-sm text-muted-foreground mt-2">
              {percentages.tokens_percent.toFixed(1)}% used
            </p>
          </CardContent>
        </Card>

        {/* Cost */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Cost
            </CardTitle>
            <CardDescription>
              ${quota.current_cost.toFixed(2)} / ${quota.max_cost_per_month.toFixed(2)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={percentages.cost_percent} className="h-2" />
            <p className="text-sm text-muted-foreground mt-2">
              {percentages.cost_percent.toFixed(1)}% used
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Summary Stats */}
      {summary && (
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
      )}

      {/* Reset Info */}
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">
            Your quota will reset on {new Date(quota.next_reset_at).toLocaleDateString()}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

