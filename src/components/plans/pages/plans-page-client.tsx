/**
 * Plans Page Client Component - Orchestrator
 * 
 * Responsibilities:
 * - Coordinate data fetching (plans, subscription)
 * - Manage loading state
 * - Delegate rendering to specialized components
 * - Delegate logic to custom hooks
 */

'use client'

import { JSX } from 'react'
import { usePlans } from '@/hooks/use-plans'
import { useSubscription } from '@/hooks/use-subscription'
import { usePlanSelection } from '@/hooks/use-plan-selection'
import { PlansHeader, CurrentPlanBanner, PricingGrid, FAQSection } from '../sections'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

export function PlansPageClient(): JSX.Element {
  // Data fetching
  const { plans, loading: plansLoading } = usePlans()
  const { subscription, loading: subLoading } = useSubscription()
  
  // Business logic
  const { handleSelectPlan } = usePlanSelection()
  
  // Combined loading state
  const loading = plansLoading || subLoading

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  // Main content
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <PlansHeader />
        <CurrentPlanBanner subscription={subscription} />
        <PricingGrid 
          plans={plans} 
          subscription={subscription}
          onSelectPlan={handleSelectPlan}
        />
        <FAQSection />
      </div>
    </div>
  )
}
