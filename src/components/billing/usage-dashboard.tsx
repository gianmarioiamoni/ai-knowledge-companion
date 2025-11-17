/**
 * Usage Dashboard Component
 * Displays usage statistics and quota limits
 * 
 * SRP Applied:
 * - Logic: useBilling hook (src/hooks/use-billing.ts)
 * - UI: Separate components for each section
 */

'use client'

import { JSX } from 'react'
import { useBilling } from '@/hooks/use-billing'
import { calculateUsagePercentage } from '@/lib/supabase/billing'
import { DollarSign, Cpu, MessageSquare } from 'lucide-react'
import { UsageAlerts } from './ui/usage-alerts'
import { UsageQuotaCard } from './ui/usage-quota-card'
import { UsageSummaryStats } from './ui/usage-summary-stats'
import { UsageResetInfo } from './ui/usage-reset-info'
import { UsageLoading } from './ui/usage-loading'
import { UsageError } from './ui/usage-error'
import { UsageEmpty } from './ui/usage-empty'

export function UsageDashboard(): JSX.Element {
  const { quota, summary, alerts, isLoading, error } = useBilling()

  if (isLoading) {
    return <UsageLoading />
  }

  if (error) {
    return <UsageError error={error} />
  }

  if (!quota) {
    return <UsageEmpty />
  }

  const percentages = calculateUsagePercentage(quota)

  return (
    <div className="space-y-6">
      {/* Alerts */}
      <UsageAlerts alerts={alerts} />

      {/* Quota Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <UsageQuotaCard
          icon={MessageSquare}
          title="API Calls"
          current={quota.current_api_calls}
          max={quota.max_api_calls_per_month}
          percentage={percentages.api_calls_percent}
        />

        <UsageQuotaCard
          icon={Cpu}
          title="Tokens"
          current={quota.current_tokens}
          max={quota.max_tokens_per_month}
          percentage={percentages.tokens_percent}
        />

        <UsageQuotaCard
          icon={DollarSign}
          title="Cost"
          current={quota.current_cost}
          max={quota.max_cost_per_month}
          percentage={percentages.cost_percent}
          formatValue={(value) => `$${value.toFixed(2)}`}
        />
      </div>

      {/* Summary Stats */}
      {summary && <UsageSummaryStats summary={summary} />}

      {/* Reset Info */}
      <UsageResetInfo nextResetAt={quota.next_reset_at} />
    </div>
  )
}

