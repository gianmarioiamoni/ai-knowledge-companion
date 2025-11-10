/**
 * Usage Limits Helper - Check subscription limits before creating resources
 */

import { createClient } from '@/lib/supabase/server'

export type ResourceType = 'tutors' | 'documents' | 'audio' | 'video' | 'image'

export interface LimitCheckResult {
  canCreate: boolean
  currentCount: number
  maxAllowed: number
  message: string
}

/**
 * Check if user can create a resource based on their subscription plan
 */
export async function checkUsageLimit(
  userId: string,
  resourceType: ResourceType
): Promise<LimitCheckResult> {
  const supabase = await createClient()
  
  try {
    const { data, error } = await supabase
      .rpc('check_usage_limit', {
        p_user_id: userId,
        p_resource_type: resourceType
      })
    
    if (error || !data || data.length === 0) {
      console.error('Error checking usage limit:', error)
      // Default to deny if error
      return {
        canCreate: false,
        currentCount: 0,
        maxAllowed: 0,
        message: 'Could not verify subscription limits'
      }
    }
    
    return data[0]
  } catch (error) {
    console.error('Exception checking usage limit:', error)
    return {
      canCreate: false,
      currentCount: 0,
      maxAllowed: 0,
      message: 'Could not verify subscription limits'
    }
  }
}

/**
 * Enforce usage limit - throws error if limit reached
 */
export async function enforceUsageLimit(
  userId: string,
  resourceType: ResourceType
): Promise<void> {
  const result = await checkUsageLimit(userId, resourceType)
  
  if (!result.canCreate) {
    throw new Error(result.message)
  }
}

