/**
 * Admin Usage Sort Buttons Component
 * Displays sorting controls for user list
 */

import { JSX } from 'react'
import type { SortField, SortOrder } from '@/hooks/use-admin-usage-data'

interface AdminUsageSortButtonsProps {
  sortBy: SortField
  sortOrder: SortOrder
  onSort: (field: SortField) => void
}

export function AdminUsageSortButtons({
  sortBy,
  sortOrder,
  onSort,
}: AdminUsageSortButtonsProps): JSX.Element {
  const getSortIndicator = (field: SortField): string => {
    if (sortBy !== field) return ''
    return sortOrder === 'desc' ? ' ↓' : ' ↑'
  }

  const getButtonClass = (field: SortField): string => {
    const baseClass = 'px-3 py-1 text-sm rounded transition-colors'
    return sortBy === field
      ? `${baseClass} bg-primary text-primary-foreground`
      : `${baseClass} bg-secondary text-secondary-foreground hover:bg-secondary/80`
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={() => onSort('cost')}
        className={getButtonClass('cost')}
      >
        Cost{getSortIndicator('cost')}
      </button>
      <button
        onClick={() => onSort('tokens')}
        className={getButtonClass('tokens')}
      >
        Tokens{getSortIndicator('tokens')}
      </button>
      <button
        onClick={() => onSort('api_calls')}
        className={getButtonClass('api_calls')}
      >
        API Calls{getSortIndicator('api_calls')}
      </button>
    </div>
  )
}

