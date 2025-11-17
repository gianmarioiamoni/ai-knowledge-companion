/**
 * Admin Usage Totals Component
 * Displays total usage summary cards
 */

import { JSX } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, MessageSquare, Cpu, DollarSign, TrendingUp } from 'lucide-react'
import type { UsageTotals } from '@/hooks/use-admin-usage-data'

interface AdminUsageTotalsProps {
  totals: UsageTotals
}

export function AdminUsageTotals({ totals }: AdminUsageTotalsProps): JSX.Element {
  const avgCostPerUser = totals.users_count > 0
    ? totals.current.cost / totals.users_count
    : 0

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Users className="h-4 w-4" />
            Total Users
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totals.users_count}</div>
          <p className="text-xs text-muted-foreground">
            {totals.active_users} active
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            API Calls
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {totals.current.api_calls.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground">
            Last 30d: {totals.last_30_days.api_calls.toLocaleString()}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Cpu className="h-4 w-4" />
            Tokens
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {totals.current.tokens.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground">
            Last 30d: {totals.last_30_days.tokens.toLocaleString()}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Total Cost
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ${totals.current.cost.toFixed(2)}
          </div>
          <p className="text-xs text-muted-foreground">
            Last 30d: ${totals.last_30_days.cost.toFixed(2)}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Avg Cost/User
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ${avgCostPerUser.toFixed(2)}
          </div>
          <p className="text-xs text-muted-foreground">
            Current period
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

