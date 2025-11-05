/**
 * Marketplace Grid
 * Grid of tutor cards with infinite scroll
 */

'use client'

import { JSX } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { MarketplaceTutorCard } from '../ui/marketplace-tutor-card'
import type { MarketplaceTutor } from '@/types/marketplace'

interface MarketplaceGridProps {
  tutors: MarketplaceTutor[]
  hasMore: boolean
  isLoadingMore: boolean
  onLoadMore: () => void
}

export function MarketplaceGrid({
  tutors,
  hasMore,
  isLoadingMore,
  onLoadMore
}: MarketplaceGridProps): JSX.Element {
  const t = useTranslations('marketplace')

  return (
    <div className="space-y-6">
      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {tutors.map((tutor) => (
          <MarketplaceTutorCard key={tutor.id} tutor={tutor} />
        ))}
      </div>

      {/* Load More */}
      {hasMore && (
        <div className="flex justify-center">
          <Button
            onClick={onLoadMore}
            disabled={isLoadingMore}
            variant="outline"
            size="lg"
          >
            {isLoadingMore ? 'Loading...' : 'Load More'}
          </Button>
        </div>
      )}
    </div>
  )
}

