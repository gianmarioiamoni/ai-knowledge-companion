/**
 * Marketplace Page Client Component
 * Main marketplace page with filters, grid, and search
 */

'use client'

import { JSX } from 'react'
import { useTranslations } from 'next-intl'
import { useMarketplace, useMarketplaceCategories } from '@/hooks/use-marketplace'
import { MarketplaceHeader } from '../sections/marketplace-header'
import { MarketplaceFilters } from '../sections/marketplace-filters'
import { MarketplaceGrid } from '../sections/marketplace-grid'
import { MarketplaceEmpty } from '../ui/marketplace-empty'
import { MarketplaceLoading } from '../ui/marketplace-loading'
import { MarketplaceError } from '../ui/marketplace-error'

export function MarketplacePage(): JSX.Element {
  const t = useTranslations('marketplace')
  
  const {
    tutors,
    total,
    isLoading,
    error,
    hasMore,
    updateFilters,
    updateSort,
    loadMore,
    resetFilters,
    query
  } = useMarketplace({
    filters: {},
    sort_by: 'newest',
    limit: 20,
    offset: 0
  })

  const { categories } = useMarketplaceCategories()

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <MarketplaceError error={error} onRetry={resetFilters} />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <MarketplaceHeader 
        total={total}
        onSearch={(search) => updateFilters({ search })}
      />

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        <aside className="lg:col-span-1">
          <MarketplaceFilters
            categories={categories}
            currentFilters={query.filters || {}}
            currentSort={query.sort_by || 'newest'}
            onFilterChange={updateFilters}
            onSortChange={updateSort}
            onReset={resetFilters}
          />
        </aside>

        {/* Main Content */}
        <main className="lg:col-span-3">
          {isLoading && tutors.length === 0 ? (
            <MarketplaceLoading />
          ) : tutors.length === 0 ? (
            <MarketplaceEmpty onReset={resetFilters} />
          ) : (
            <MarketplaceGrid
              tutors={tutors}
              hasMore={hasMore}
              isLoadingMore={isLoading}
              onLoadMore={loadMore}
            />
          )}
        </main>
      </div>
    </div>
  )
}

