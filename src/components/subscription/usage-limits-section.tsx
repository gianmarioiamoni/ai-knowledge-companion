/**
 * Usage Limits Section Component
 */

import { JSX } from 'react'
import { UsageItem } from './usage-item'
import type { UserSubscriptionWithPlan } from '@/types/subscription'

interface UsageLimitsSectionProps {
  subscription: UserSubscriptionWithPlan
  title: string
  tutorsLabel: string
  documentsLabel: string
  audioFilesLabel: string
  unlimitedText: string
}

export function UsageLimitsSection({ 
  subscription,
  title,
  tutorsLabel,
  documentsLabel,
  audioFilesLabel,
  unlimitedText
}: UsageLimitsSectionProps): JSX.Element {
  // TODO: Replace with actual usage data when available
  const currentUsage = {
    tutors: 0,
    documents: 0,
    audio: 0
  }

  return (
    <div className="pt-4 border-t space-y-3">
      <h4 className="font-semibold text-sm">{title}</h4>
      
      {/* Tutors */}
      <UsageItem
        label={tutorsLabel}
        current={currentUsage.tutors}
        max={subscription.max_tutors}
        isUnlimited={subscription.max_tutors === -1}
        unlimitedText={unlimitedText}
      />

      {/* Documents */}
      <UsageItem
        label={documentsLabel}
        current={currentUsage.documents}
        max={subscription.max_documents}
        isUnlimited={subscription.max_documents === -1}
        unlimitedText={unlimitedText}
      />

      {/* Audio Files */}
      {subscription.max_audio_files > 0 && (
        <UsageItem
          label={audioFilesLabel}
          current={currentUsage.audio}
          max={subscription.max_audio_files}
          isUnlimited={false}
          unlimitedText={unlimitedText}
        />
      )}
    </div>
  )
}

