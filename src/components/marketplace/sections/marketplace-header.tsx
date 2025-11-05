/**
 * Marketplace Header
 * Search bar and title
 */

'use client'

import { JSX, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search } from 'lucide-react'

interface MarketplaceHeaderProps {
  total: number
  onSearch: (search: string) => void
}

export function MarketplaceHeader({ total, onSearch }: MarketplaceHeaderProps): JSX.Element {
  const t = useTranslations('marketplace')
  const [searchValue, setSearchValue] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch(searchValue)
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-4xl font-bold">{t('title')}</h1>
        <p className="text-muted-foreground mt-2">
          {total > 0 ? `${total} ${t('featured')}` : t('noTutors')}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder={t('search')}
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button type="submit">
          {t('search')}
        </Button>
      </form>
    </div>
  )
}

