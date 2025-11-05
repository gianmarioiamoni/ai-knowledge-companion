/**
 * Billing & Usage Tracking Service
 * Handles usage logging, quota management, and billing analytics
 */

import { createClient } from './client'
import type {
  UserQuota,
  UsageAlert,
  UsageSummary,
  UsageLogData,
  QuotaCheckResult,
  BillingPeriod
} from '@/types/billing'

/**
 * Log usage and check quotas
 */
export async function logUsage(
  usageData: UsageLogData
): Promise<{ data?: QuotaCheckResult; error?: string }> {
  try {
    const supabase = createClient()

    const { data, error } = await supabase.rpc('log_usage_and_check_quota', {
      p_user_id: usageData.user_id,
      p_tutor_id: usageData.tutor_id || null,
      p_action: usageData.action,
      p_api_calls: usageData.api_calls,
      p_tokens_used: usageData.tokens_used,
      p_cost_estimate: usageData.cost_estimate,
      p_metadata: usageData.metadata || {}
    })

    if (error) {
      console.error('Error logging usage:', error)
      return { error: error.message }
    }

    return { data: data[0] }
  } catch (error) {
    console.error('Exception in logUsage:', error)
    return {
      error: error instanceof Error ? error.message : 'Failed to log usage'
    }
  }
}

/**
 * Get user quota
 */
export async function getUserQuota(
  userId: string
): Promise<{ data?: UserQuota; error?: string }> {
  try {
    const supabase = createClient()

    // Initialize quota if not exists
    await supabase.rpc('initialize_user_quota', { p_user_id: userId })

    const { data, error } = await supabase
      .from('user_quotas')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error) {
      return { error: error.message }
    }

    return { data }
  } catch (error) {
    console.error('Exception in getUserQuota:', error)
    return {
      error: error instanceof Error ? error.message : 'Failed to get user quota'
    }
  }
}

/**
 * Update user quota limits
 */
export async function updateQuotaLimits(
  userId: string,
  limits: Partial<Pick<UserQuota, 'max_api_calls_per_month' | 'max_tokens_per_month' | 'max_cost_per_month'>>
): Promise<{ data?: UserQuota; error?: string }> {
  try {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('user_quotas')
      .update(limits)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      return { error: error.message }
    }

    return { data }
  } catch (error) {
    console.error('Exception in updateQuotaLimits:', error)
    return {
      error: error instanceof Error ? error.message : 'Failed to update quota limits'
    }
  }
}

/**
 * Get usage summary
 */
export async function getUsageSummary(
  userId: string,
  days: number = 30
): Promise<{ data?: UsageSummary; error?: string }> {
  try {
    const supabase = createClient()

    const { data, error } = await supabase
      .rpc('get_usage_summary', {
        p_user_id: userId,
        p_days: days
      })
      .single()

    if (error) {
      return { error: error.message }
    }

    return { data }
  } catch (error) {
    console.error('Exception in getUsageSummary:', error)
    return {
      error: error instanceof Error ? error.message : 'Failed to get usage summary'
    }
  }
}

/**
 * Get user alerts
 */
export async function getUserAlerts(
  userId: string,
  unreadOnly: boolean = false
): Promise<{ data?: UsageAlert[]; error?: string }> {
  try {
    const supabase = createClient()

    let query = supabase
      .from('usage_alerts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (unreadOnly) {
      query = query.eq('is_read', false)
    }

    const { data, error } = await query

    if (error) {
      return { error: error.message }
    }

    return { data: data || [] }
  } catch (error) {
    console.error('Exception in getUserAlerts:', error)
    return {
      error: error instanceof Error ? error.message : 'Failed to get alerts'
    }
  }
}

/**
 * Mark alert as read
 */
export async function markAlertAsRead(
  alertId: string
): Promise<{ error?: string }> {
  try {
    const supabase = createClient()

    const { error } = await supabase
      .from('usage_alerts')
      .update({ is_read: true })
      .eq('id', alertId)

    if (error) {
      return { error: error.message }
    }

    return {}
  } catch (error) {
    console.error('Exception in markAlertAsRead:', error)
    return {
      error: error instanceof Error ? error.message : 'Failed to mark alert as read'
    }
  }
}

/**
 * Get billing periods
 */
export async function getBillingPeriods(
  userId: string,
  limit: number = 12
): Promise<{ data?: BillingPeriod[]; error?: string }> {
  try {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('billing_periods')
      .select('*')
      .eq('user_id', userId)
      .order('period_start', { ascending: false })
      .limit(limit)

    if (error) {
      return { error: error.message }
    }

    return { data: data || [] }
  } catch (error) {
    console.error('Exception in getBillingPeriods:', error)
    return {
      error: error instanceof Error ? error.message : 'Failed to get billing periods'
    }
  }
}

/**
 * Calculate quota usage percentage
 */
export function calculateUsagePercentage(quota: UserQuota): {
  api_calls_percent: number
  tokens_percent: number
  cost_percent: number
  highest_percent: number
  highest_type: 'api_calls' | 'tokens' | 'cost'
} {
  const api_calls_percent = (quota.current_api_calls / quota.max_api_calls_per_month) * 100
  const tokens_percent = (quota.current_tokens / quota.max_tokens_per_month) * 100
  const cost_percent = (quota.current_cost / quota.max_cost_per_month) * 100

  const percentages = {
    api_calls: api_calls_percent,
    tokens: tokens_percent,
    cost: cost_percent
  }

  const highest = Object.entries(percentages).sort((a, b) => b[1] - a[1])[0]

  return {
    api_calls_percent,
    tokens_percent,
    cost_percent,
    highest_percent: highest[1],
    highest_type: highest[0] as 'api_calls' | 'tokens' | 'cost'
  }
}

