// Billing & Usage Tracking Types

export interface UserQuota {
  id: string
  user_id: string
  
  // Limits
  max_api_calls_per_month: number
  max_tokens_per_month: number
  max_cost_per_month: number
  
  // Current usage
  current_api_calls: number
  current_tokens: number
  current_cost: number
  
  // Reset tracking
  last_reset_at: string
  next_reset_at: string
  
  // Notifications
  notification_threshold_percent: number
  notifications_enabled: boolean
  
  created_at: string
  updated_at: string
}

export interface UsageAlert {
  id: string
  user_id: string
  alert_type: 'api_calls' | 'tokens' | 'cost' | 'monthly_reset'
  threshold_value: number | null
  current_value: number | null
  message: string
  is_read: boolean
  created_at: string
}

export interface BillingPeriod {
  id: string
  user_id: string
  period_start: string
  period_end: string
  total_api_calls: number
  total_tokens: number
  total_cost: number
  breakdown: Record<string, any>
  created_at: string
}

export interface UsageSummary {
  total_api_calls: number
  total_tokens: number
  total_cost: number
  daily_breakdown: Record<string, {
    api_calls: number
    tokens: number
    cost: number
  }>
  action_breakdown: Record<string, number>
  tutor_breakdown: Record<string, {
    api_calls: number
    tokens: number
    cost: number
  }>
}

export interface UsageLogData {
  user_id: string
  tutor_id?: string | null
  action: 'embedding' | 'completion' | 'api_call'
  api_calls: number
  tokens_used: number
  cost_estimate: number
  metadata?: Record<string, any>
}

export interface QuotaCheckResult {
  quota_exceeded: boolean
  exceeded_type: string | null
  current_value: number | null
  max_value: number | null
}

