/**
 * Plan Features Builder
 */

import type { SubscriptionPlan } from '@/types/subscription'

export interface PlanFeature {
  name: string
  value: number | string
  included: boolean
}

export function buildPlanFeatures(
  plan: SubscriptionPlan,
  t: any,
  isUnlimitedTutors: boolean
): PlanFeature[] {
  return [
    {
      name: t('features.tutors'),
      value: isUnlimitedTutors ? t('unlimited') : plan.max_tutors,
      included: true
    },
    {
      name: t('features.documents'),
      value: plan.max_documents,
      included: true
    },
    {
      name: t('features.audioFiles'),
      value: plan.max_audio_files,
      included: plan.max_audio_files > 0
    },
    {
      name: t('features.imageFiles'),
      value: plan.max_image_files,
      included: plan.max_image_files > 0
    },
    {
      name: t('features.videoFiles'),
      value: plan.max_video_files,
      included: plan.max_video_files > 0
    }
  ]
}

