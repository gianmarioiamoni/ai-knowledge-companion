/**
 * Marketplace Filters
 * Sidebar with category, price, rating filters
 */

'use client'

import { JSX } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import type { MarketplaceFilters as Filters, MarketplaceSortBy } from '@/types/marketplace'

interface MarketplaceFiltersProps {
  categories: Array<{ category: string; count: number }>
  currentFilters: Partial<Filters>
  currentSort: MarketplaceSortBy
  onFilterChange: (filters: Partial<Filters>) => void
  onSortChange: (sort: MarketplaceSortBy) => void
  onReset: () => void
}

export function MarketplaceFilters({
  categories,
  currentFilters,
  currentSort,
  onFilterChange,
  onSortChange,
  onReset
}: MarketplaceFiltersProps): JSX.Element {
  const t = useTranslations('marketplace')

  return (
    <div className="space-y-4">
      {/* Sort */}
      <Card>
        <CardHeader>
          <CardTitle>{t('sort')}</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup value={currentSort} onValueChange={(v) => onSortChange(v as MarketplaceSortBy)}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="newest" id="newest" />
              <Label htmlFor="newest">{t('newest')}</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="popular" id="popular" />
              <Label htmlFor="popular">{t('popular')}</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="rating" id="rating" />
              <Label htmlFor="rating">{t('rating')}</Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Categories */}
      {categories.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t('categories')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button
                variant={!currentFilters.category ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => onFilterChange({ category: undefined })}
              >
                All
              </Button>
              {categories.map((cat) => (
                <Button
                  key={cat.category}
                  variant={currentFilters.category === cat.category ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => onFilterChange({ category: cat.category })}
                >
                  {cat.category} ({cat.count})
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Price Filter */}
      <Card>
        <CardHeader>
          <CardTitle>Price</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup 
            value={currentFilters.is_free === true ? 'free' : currentFilters.is_free === false ? 'paid' : 'all'} 
            onValueChange={(v) => {
              if (v === 'all') onFilterChange({ is_free: undefined })
              else if (v === 'free') onFilterChange({ is_free: true })
              else onFilterChange({ is_free: false })
            }}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="all" id="all" />
              <Label htmlFor="all">All</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="free" id="free" />
              <Label htmlFor="free">{t('free')}</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="paid" id="paid" />
              <Label htmlFor="paid">{t('paid')}</Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Reset Button */}
      <Button variant="outline" className="w-full" onClick={onReset}>
        Reset Filters
      </Button>
    </div>
  )
}

