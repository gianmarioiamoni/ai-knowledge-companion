/**
 * Marketplace Empty State
 */

'use client'

import { JSX } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Package } from 'lucide-react'

interface MarketplaceEmptyProps {
  onReset: () => void
}

export function MarketplaceEmpty({ onReset }: MarketplaceEmptyProps): JSX.Element {
  const t = useTranslations('marketplace')

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <Package className="h-16 w-16 text-muted-foreground mb-4" />
      <h3 className="text-xl font-semibold mb-2">{t('noTutors')}</h3>
      <p className="text-muted-foreground mb-6 max-w-md">
        No tutors match your current filters. Try adjusting your search criteria.
      </p>
      <Button onClick={onReset} variant="outline">
        Reset Filters
      </Button>
    </div>
  )
}

