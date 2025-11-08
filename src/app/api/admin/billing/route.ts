/**
 * Admin Billing Aggregated API
 * 
 * GET /api/admin/billing
 * 
 * Returns aggregated billing data across all users
 * 
 * Query params:
 * - period: 'day' | 'week' | 'month' | 'year' (default: 'month')
 * - limit: number (default: 10) - for top users
 * 
 * Access: Admin, Super Admin
 */

import { NextRequest, NextResponse } from 'next/server'
import { withAdmin } from '@/lib/middleware/admin-guard'
import { createServiceClient } from '@/lib/supabase/service'

interface BillingAggregated {
  totalUsers: number
  activeUsers: number
  totalCost: number
  totalTokens: number
  totalApiCalls: number
  averageCostPerUser: number
  topUsersByCost: Array<{
    userId: string
    email: string
    displayName: string | null
    cost: number
    tokens: number
    apiCalls: number
  }>
  costByDay: Array<{
    date: string
    cost: number
    tokens: number
    apiCalls: number
  }>
  summary: {
    currentMonth: {
      cost: number
      tokens: number
      apiCalls: number
    }
    previousMonth: {
      cost: number
      tokens: number
      apiCalls: number
    }
    growth: {
      cost: number // percentage
      tokens: number
      apiCalls: number
    }
  }
}

export const GET = withAdmin(async (request: NextRequest, { roleInfo }) => {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'month'
    const limit = parseInt(searchParams.get('limit') || '10')

    const supabase = createServiceClient()

    // Get date range based on period
    const now = new Date()
    let startDate: Date

    switch (period) {
      case 'day':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000)
        break
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1)
        break
      case 'month':
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        break
    }

    // Get all user quotas for current period
    const { data: quotas, error: quotasError } = await supabase
      .from('user_quotas')
      .select('user_id, current_cost, current_tokens, current_api_calls')

    if (quotasError) {
      console.error('Error fetching quotas:', quotasError)
      return NextResponse.json(
        { error: 'Failed to fetch billing data' },
        { status: 500 }
      )
    }

    // Calculate totals
    const totalCost = quotas?.reduce((sum, q) => sum + Number(q.current_cost), 0) || 0
    const totalTokens = quotas?.reduce((sum, q) => sum + Number(q.current_tokens), 0) || 0
    const totalApiCalls = quotas?.reduce((sum, q) => sum + Number(q.current_api_calls), 0) || 0

    // Get total users count
    const { count: totalUsers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })

    // Get active users (users who have made API calls this period)
    const activeUsers = quotas?.filter((q) => Number(q.current_api_calls) > 0).length || 0

    // Get top users by cost
    const topUserIds = quotas
      ?.sort((a, b) => Number(b.current_cost) - Number(a.current_cost))
      .slice(0, limit)
      .map((q) => q.user_id) || []

    const { data: topUsersProfiles } = await supabase
      .from('profiles')
      .select('id, display_name')
      .in('id', topUserIds)

    // Get emails from auth.users
    const { data: authUsers } = await supabase.auth.admin.listUsers()
    
    const topUsers = topUserIds.map((userId) => {
      const quota = quotas?.find((q) => q.user_id === userId)
      const profile = topUsersProfiles?.find((p) => p.id === userId)
      const authUser = authUsers.users.find((u) => u.id === userId)

      return {
        userId,
        email: authUser?.email || 'Unknown',
        displayName: profile?.display_name || null,
        cost: Number(quota?.current_cost || 0),
        tokens: Number(quota?.current_tokens || 0),
        apiCalls: Number(quota?.current_api_calls || 0),
      }
    })

    // Get usage logs for the period to create time series
    const { data: usageLogs } = await supabase
      .from('usage_logs')
      .select('created_at, cost_estimate, tokens_used, api_calls')
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: true })

    // Group by day
    const costByDay: Record<string, { cost: number; tokens: number; apiCalls: number }> = {}

    usageLogs?.forEach((log) => {
      const date = new Date(log.created_at).toISOString().split('T')[0]
      if (!costByDay[date]) {
        costByDay[date] = { cost: 0, tokens: 0, apiCalls: 0 }
      }
      costByDay[date].cost += Number(log.cost_estimate || 0)
      costByDay[date].tokens += Number(log.tokens_used || 0)
      costByDay[date].apiCalls += Number(log.api_calls || 0)
    })

    const costByDayArray = Object.entries(costByDay).map(([date, data]) => ({
      date,
      ...data,
    }))

    // Calculate previous period for growth comparison
    const previousPeriodStart = new Date(startDate)
    const previousPeriodEnd = new Date(startDate)

    switch (period) {
      case 'day':
        previousPeriodStart.setDate(previousPeriodStart.getDate() - 1)
        break
      case 'week':
        previousPeriodStart.setDate(previousPeriodStart.getDate() - 7)
        break
      case 'year':
        previousPeriodStart.setFullYear(previousPeriodStart.getFullYear() - 1)
        previousPeriodEnd.setFullYear(previousPeriodEnd.getFullYear() - 1)
        break
      case 'month':
      default:
        previousPeriodStart.setMonth(previousPeriodStart.getMonth() - 1)
        previousPeriodEnd.setMonth(previousPeriodEnd.getMonth() - 1)
        break
    }

    const { data: previousLogs } = await supabase
      .from('usage_logs')
      .select('cost_estimate, tokens_used, api_calls')
      .gte('created_at', previousPeriodStart.toISOString())
      .lt('created_at', startDate.toISOString())

    const previousCost = previousLogs?.reduce((sum, log) => sum + Number(log.cost_estimate || 0), 0) || 0
    const previousTokens = previousLogs?.reduce((sum, log) => sum + Number(log.tokens_used || 0), 0) || 0
    const previousApiCalls = previousLogs?.reduce((sum, log) => sum + Number(log.api_calls || 0), 0) || 0

    // Calculate growth percentages
    const costGrowth = previousCost > 0 ? ((totalCost - previousCost) / previousCost) * 100 : 0
    const tokensGrowth = previousTokens > 0 ? ((totalTokens - previousTokens) / previousTokens) * 100 : 0
    const apiCallsGrowth = previousApiCalls > 0 ? ((totalApiCalls - previousApiCalls) / previousApiCalls) * 100 : 0

    const result: BillingAggregated = {
      totalUsers: totalUsers || 0,
      activeUsers,
      totalCost,
      totalTokens,
      totalApiCalls,
      averageCostPerUser: activeUsers > 0 ? totalCost / activeUsers : 0,
      topUsersByCost: topUsers,
      costByDay: costByDayArray,
      summary: {
        currentMonth: {
          cost: totalCost,
          tokens: totalTokens,
          apiCalls: totalApiCalls,
        },
        previousMonth: {
          cost: previousCost,
          tokens: previousTokens,
          apiCalls: previousApiCalls,
        },
        growth: {
          cost: costGrowth,
          tokens: tokensGrowth,
          apiCalls: apiCallsGrowth,
        },
      },
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error in GET /api/admin/billing:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
})

