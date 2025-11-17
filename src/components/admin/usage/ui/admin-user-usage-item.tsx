/**
 * Admin User Usage Item Component
 * Displays usage details for a single user
 */

import { JSX } from 'react'
import { Progress } from '@/components/ui/progress'
import type { UserUsage } from '@/hooks/use-admin-usage-data'

interface AdminUserUsageItemProps {
  user: UserUsage
}

export function AdminUserUsageItem({ user }: AdminUserUsageItemProps): JSX.Element {
  const getProgressColor = (percentage: number): string => {
    if (percentage >= 90) return 'bg-red-500'
    if (percentage >= 70) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  return (
    <div className="border rounded-lg p-4 space-y-3 hover:bg-accent/50 transition-colors">
      {/* User Info */}
      <div className="flex items-center justify-between">
        <div>
          <div className="font-medium">{user.email}</div>
          <div className="text-xs text-muted-foreground">
            {user.role} • {user.status}
          </div>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold">${user.current.cost.toFixed(2)}</div>
          <div className="text-xs text-muted-foreground">
            ${user.max.cost.toFixed(2)} limit
          </div>
        </div>
      </div>

      {/* Progress Bars */}
      <div className="space-y-2">
        {/* API Calls */}
        <div>
          <div className="flex items-center justify-between text-xs mb-1">
            <span>API Calls</span>
            <span className="text-muted-foreground">
              {user.current.api_calls.toLocaleString()} /{' '}
              {user.max.api_calls.toLocaleString()}
            </span>
          </div>
          <Progress
            value={user.percentages.api_calls}
            className="h-2"
          />
        </div>

        {/* Tokens */}
        <div>
          <div className="flex items-center justify-between text-xs mb-1">
            <span>Tokens</span>
            <span className="text-muted-foreground">
              {user.current.tokens.toLocaleString()} /{' '}
              {user.max.tokens.toLocaleString()}
            </span>
          </div>
          <Progress
            value={user.percentages.tokens}
            className="h-2"
          />
        </div>

        {/* Cost */}
        <div>
          <div className="flex items-center justify-between text-xs mb-1">
            <span>Cost</span>
            <span className="text-muted-foreground">
              ${user.current.cost.toFixed(2)} / ${user.max.cost.toFixed(2)}
            </span>
          </div>
          <Progress
            value={user.percentages.cost}
            className={`h-2 ${getProgressColor(user.percentages.cost)}`}
          />
        </div>
      </div>

      {/* Last 30 Days Stats */}
      <div className="grid grid-cols-3 gap-2 pt-2 border-t text-xs">
        <div>
          <div className="text-muted-foreground">Last 30d Calls</div>
          <div className="font-medium">{user.last_30_days.api_calls.toLocaleString()}</div>
        </div>
        <div>
          <div className="text-muted-foreground">Last 30d Tokens</div>
          <div className="font-medium">{user.last_30_days.tokens.toLocaleString()}</div>
        </div>
        <div>
          <div className="text-muted-foreground">Last 30d Cost</div>
          <div className="font-medium">${user.last_30_days.cost.toFixed(2)}</div>
        </div>
      </div>
    </div>
  )
}

