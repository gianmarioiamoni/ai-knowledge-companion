/**
 * Features List Component
 */

import { JSX } from 'react'
import { Check } from 'lucide-react'
import type { PlanFeature } from '@/lib/utils/plan-features'

interface FeaturesListProps {
  features: PlanFeature[]
}

export function FeaturesList({ features }: FeaturesListProps): JSX.Element {
  return (
    <div className="space-y-3">
      {features.filter(f => f.included).map((feature, index) => (
        <div key={index} className="flex items-center gap-3">
          <Check className="h-5 w-5 text-primary flex-shrink-0" />
          <span className="text-sm">
            <span className="font-semibold">{feature.value}</span> {feature.name}
          </span>
        </div>
      ))}
    </div>
  )
}

