/**
 * Billing Summary Cards Component
 * 
 * Displays current vs previous period comparison
 * SRP: Only responsible for rendering summary comparison cards
 */

'use client'

import { JSX } from 'react'
import { useTranslations } from 'next-intl'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface PeriodData {
  cost: number
  tokens: number
  apiCalls: number
}

interface BillingSummaryCardsProps {
  currentPeriod: PeriodData
  previousPeriod: PeriodData
}

export function BillingSummaryCards({
  currentPeriod,
  previousPeriod,
}: BillingSummaryCardsProps): JSX.Element {
  const t = useTranslations('admin.billing.summary')

  const renderPeriodCard = (
    title: string,
    data: PeriodData,
    isCurrent: boolean
  ) => (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex justify-between">
          <span className="text-sm text-muted-foreground">
            {t('cost', { default: 'Cost' })}
          </span>
          <span className={isCurrent ? 'font-medium' : 'font-medium text-muted-foreground'}>
            ${data.cost.toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-muted-foreground">
            {t('tokens', { default: 'Tokens' })}
          </span>
          <span className={isCurrent ? 'font-medium' : 'font-medium text-muted-foreground'}>
            {data.tokens.toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-muted-foreground">
            {t('calls', { default: 'API Calls' })}
          </span>
          <span className={isCurrent ? 'font-medium' : 'font-medium text-muted-foreground'}>
            {data.apiCalls.toLocaleString()}
          </span>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {renderPeriodCard(
        t('current', { default: 'Current Period' }),
        currentPeriod,
        true
      )}
      {renderPeriodCard(
        t('previous', { default: 'Previous Period' }),
        previousPeriod,
        false
      )}
    </div>
  )
}

