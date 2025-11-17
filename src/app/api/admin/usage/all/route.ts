import { NextRequest, NextResponse } from 'next/server'
import { withSuperAdmin } from '@/lib/middleware/admin-guard'
import { createServiceClient } from '@/lib/supabase/service-client'

/**
 * GET /api/admin/usage/all
 * Get usage statistics for all users (super admin only)
 */
export const GET = withSuperAdmin(async (_request: NextRequest) => {
  const supabase = createServiceClient()

  try {
    // Get all user quotas with user information
    const { data: quotas, error: quotasError } = await supabase
      .from('user_quotas')
      .select(`
        user_id,
        current_api_calls,
        current_tokens,
        current_cost,
        max_api_calls_per_month,
        max_tokens_per_month,
        max_cost_per_month,
        billing_period_start,
        next_reset_at
      `)
      .order('current_cost', { ascending: false })

    if (quotasError || !quotas) {
      console.error('❌ Error fetching user quotas:', quotasError)
      return NextResponse.json(
        { error: 'Failed to fetch user quotas' },
        { status: 500 }
      )
    }

    // Get user profiles to get email addresses
    const userIds = quotas.map((q: { user_id: string }) => q.user_id)
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, email, role, status')
      .in('id', userIds)

    if (profilesError) {
      console.error('❌ Error fetching profiles:', profilesError)
      return NextResponse.json(
        { error: 'Failed to fetch user profiles' },
        { status: 500 }
      )
    }

    // Get billing tracking summary for last 30 days
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const { data: tracking, error: trackingError } = await supabase
      .from('billing_tracking')
      .select('user_id, action, tokens_used, cost_estimate')
      .gte('created_at', thirtyDaysAgo.toISOString())

    if (trackingError) {
      console.error('❌ Error fetching billing tracking:', trackingError)
    }

    // Combine data
    const usageData = quotas.map((quota: Record<string, unknown>) => {
      const profile = profiles?.find((p: { id: string }) => p.id === quota.user_id)
      const userTracking = tracking?.filter((t: { user_id: string }) => t.user_id === quota.user_id) || []
      
      // Calculate last 30 days stats
      const last30DaysTokens = userTracking.reduce((sum, t: { tokens_used?: number }) => sum + (t.tokens_used || 0), 0)
      const last30DaysCost = userTracking.reduce((sum, t: { cost_estimate?: number }) => sum + (t.cost_estimate || 0), 0)
      const last30DaysApiCalls = userTracking.length

      // Calculate percentages
      const maxApiCalls = quota.max_api_calls_per_month as number
      const currentApiCalls = quota.current_api_calls as number
      const maxTokens = quota.max_tokens_per_month as number
      const currentTokens = quota.current_tokens as number
      const maxCost = quota.max_cost_per_month as number
      const currentCost = quota.current_cost as number

      const apiCallsPercent = maxApiCalls > 0
        ? (currentApiCalls / maxApiCalls) * 100
        : 0
      const tokensPercent = maxTokens > 0
        ? (currentTokens / maxTokens) * 100
        : 0
      const costPercent = maxCost > 0
        ? (currentCost / maxCost) * 100
        : 0

      return {
        user_id: quota.user_id as string,
        email: (profile as unknown as { email?: string })?.email || 'Unknown',
        role: (profile as unknown as { role?: string })?.role || 'user',
        status: (profile as unknown as { status?: string })?.status || 'active',
        current: {
          api_calls: currentApiCalls,
          tokens: currentTokens,
          cost: currentCost,
        },
        max: {
          api_calls: maxApiCalls,
          tokens: maxTokens,
          cost: maxCost,
        },
        percentages: {
          api_calls: Math.round(apiCallsPercent * 10) / 10,
          tokens: Math.round(tokensPercent * 10) / 10,
          cost: Math.round(costPercent * 10) / 10,
        },
        last_30_days: {
          api_calls: last30DaysApiCalls,
          tokens: last30DaysTokens,
          cost: last30DaysCost,
        },
        billing_period_start: quota.billing_period_start as string,
        next_reset_at: quota.next_reset_at as string,
      }
    })

    // Calculate totals
    const totals = {
      current: {
        api_calls: usageData.reduce((sum, u) => sum + u.current.api_calls, 0),
        tokens: usageData.reduce((sum, u) => sum + u.current.tokens, 0),
        cost: usageData.reduce((sum, u) => sum + u.current.cost, 0),
      },
      max: {
        api_calls: usageData.reduce((sum, u) => sum + u.max.api_calls, 0),
        tokens: usageData.reduce((sum, u) => sum + u.max.tokens, 0),
        cost: usageData.reduce((sum, u) => sum + u.max.cost, 0),
      },
      last_30_days: {
        api_calls: usageData.reduce((sum, u) => sum + u.last_30_days.api_calls, 0),
        tokens: usageData.reduce((sum, u) => sum + u.last_30_days.tokens, 0),
        cost: usageData.reduce((sum, u) => sum + u.last_30_days.cost, 0),
      },
      users_count: usageData.length,
      active_users: usageData.filter(u => u.status === 'active').length,
    }

    return NextResponse.json({
      success: true,
      users: usageData,
      totals,
    })
  } catch (error) {
    console.error('❌ Error in /api/admin/usage/all:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
})

