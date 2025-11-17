/**
 * All Users Usage Dashboard Component
 * Displays usage statistics for all users (Super Admin only)
 */

'use client'

import { useEffect, useState } from 'react'
import { JSX } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { AlertCircle, DollarSign, Cpu, MessageSquare, Users, TrendingUp } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

interface UserUsage {
  user_id: string
  email: string
  role: string
  status: string
  current: {
    api_calls: number
    tokens: number
    cost: number
  }
  max: {
    api_calls: number
    tokens: number
    cost: number
  }
  percentages: {
    api_calls: number
    tokens: number
    cost: number
  }
  last_30_days: {
    api_calls: number
    tokens: number
    cost: number
  }
  billing_period_start: string
  next_reset_at: string
}

interface UsageTotals {
  current: {
    api_calls: number
    tokens: number
    cost: number
  }
  max: {
    api_calls: number
    tokens: number
    cost: number
  }
  last_30_days: {
    api_calls: number
    tokens: number
    cost: number
  }
  users_count: number
  active_users: number
}

interface UsageData {
  users: UserUsage[]
  totals: UsageTotals
}

export function AllUsersUsageDashboard(): JSX.Element {
  const [data, setData] = useState<UsageData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<'cost' | 'tokens' | 'api_calls'>('cost')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  useEffect(() => {
    fetchUsageData()
  }, [])

  const fetchUsageData = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch('/api/admin/usage/all')
      if (!response.ok) {
        throw new Error('Failed to fetch usage data')
      }

      const result = await response.json()
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch usage data')
      }

      setData(result)
    } catch (err) {
      console.error('Error fetching usage data:', err)
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const getSortedUsers = () => {
    if (!data) return []

    const sorted = [...data.users].sort((a, b) => {
      let aValue: number
      let bValue: number

      switch (sortBy) {
        case 'cost':
          aValue = a.current.cost
          bValue = b.current.cost
          break
        case 'tokens':
          aValue = a.current.tokens
          bValue = b.current.tokens
          break
        case 'api_calls':
          aValue = a.current.api_calls
          bValue = b.current.api_calls
          break
      }

      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue
    })

    return sorted
  }

  const getProgressColor = (percentage: number): string => {
    if (percentage >= 90) return 'bg-red-500'
    if (percentage >= 70) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-muted-foreground">Loading usage data...</p>
      </div>
    )
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

  if (!data) {
    return <div className="p-8 text-center">No usage data available</div>
  }

  const sortedUsers = getSortedUsers()

  return (
    <div className="space-y-6">
      {/* Totals Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              Total Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totals.users_count}</div>
            <p className="text-xs text-muted-foreground">
              {data.totals.active_users} active
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
              {data.totals.current.api_calls.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Last 30d: {data.totals.last_30_days.api_calls.toLocaleString()}
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
              {data.totals.current.tokens.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Last 30d: {data.totals.last_30_days.tokens.toLocaleString()}
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
              ${data.totals.current.cost.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Last 30d: ${data.totals.last_30_days.cost.toFixed(2)}
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
              ${(data.totals.current.cost / data.totals.users_count).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Current period
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Users Usage Details</CardTitle>
              <CardDescription>Usage statistics for all users</CardDescription>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setSortBy('cost')
                  setSortOrder(sortBy === 'cost' && sortOrder === 'desc' ? 'asc' : 'desc')
                }}
                className={`px-3 py-1 text-sm rounded ${
                  sortBy === 'cost'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground'
                }`}
              >
                Cost {sortBy === 'cost' && (sortOrder === 'desc' ? '↓' : '↑')}
              </button>
              <button
                onClick={() => {
                  setSortBy('tokens')
                  setSortOrder(sortBy === 'tokens' && sortOrder === 'desc' ? 'asc' : 'desc')
                }}
                className={`px-3 py-1 text-sm rounded ${
                  sortBy === 'tokens'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground'
                }`}
              >
                Tokens {sortBy === 'tokens' && (sortOrder === 'desc' ? '↓' : '↑')}
              </button>
              <button
                onClick={() => {
                  setSortBy('api_calls')
                  setSortOrder(sortBy === 'api_calls' && sortOrder === 'desc' ? 'asc' : 'desc')
                }}
                className={`px-3 py-1 text-sm rounded ${
                  sortBy === 'api_calls'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground'
                }`}
              >
                API Calls {sortBy === 'api_calls' && (sortOrder === 'desc' ? '↓' : '↑')}
              </button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sortedUsers.map((user) => (
              <div
                key={user.user_id}
                className="border rounded-lg p-4 space-y-3 hover:bg-accent/50 transition-colors"
              >
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
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

