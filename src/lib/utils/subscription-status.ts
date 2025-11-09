/**
 * Subscription Status Utilities
 */

import type { SubscriptionStatus } from '@/types/subscription'

export const STATUS_COLORS: Record<SubscriptionStatus, string> = {
  active: 'bg-green-500',
  trial: 'bg-blue-500',
  cancelled: 'bg-yellow-500',
  expired: 'bg-red-500'
}

export function getStatusColor(status: SubscriptionStatus): string {
  return STATUS_COLORS[status]
}

