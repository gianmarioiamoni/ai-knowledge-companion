/**
 * Subscription and Plan Types
 */

export type PlanName = 'trial' | 'pro' | 'enterprise'

export type SubscriptionStatus = 'active' | 'trial' | 'cancelled' | 'expired'

export type BillingCycle = 'monthly' | 'yearly' | null

export interface SubscriptionPlan {
  id: string
  name: PlanName
  display_name: string
  description: string | null
  price_monthly: number
  price_yearly: number
  
  // Usage limits
  max_tutors: number // -1 means unlimited
  max_documents: number
  max_audio_files: number
  max_video_files: number
  
  // Features
  trial_days: number
  is_active: boolean
  sort_order: number
  
  created_at: string
  updated_at: string
}

export interface UserSubscription {
  id: string
  user_id: string
  plan_id: string
  
  status: SubscriptionStatus
  
  start_date: string
  end_date: string
  trial_end_date: string | null
  cancelled_at: string | null
  
  billing_cycle: BillingCycle
  last_payment_date: string | null
  next_payment_date: string | null
  
  created_at: string
  updated_at: string
}

export interface UserSubscriptionWithPlan extends UserSubscription {
  plan: SubscriptionPlan
  days_remaining: number
}

export interface UsageLimit {
  can_create: boolean
  current_count: number
  max_allowed: number // -1 means unlimited
  message: string
}

export interface PlanFeature {
  name: string
  included: boolean
  limit?: number | string
}

export interface PlanComparison {
  plan: SubscriptionPlan
  features: PlanFeature[]
  isCurrentPlan?: boolean
  isMostPopular?: boolean
}

