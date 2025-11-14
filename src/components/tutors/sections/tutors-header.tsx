'use client'

import { JSX } from 'react'
import { Button } from '@/components/ui/button'
import { Plus, Search, Filter } from 'lucide-react'

interface TutorsHeaderProps {
  title: string
  subtitle: string
  searchPlaceholder: string
  searchQuery: string
  onSearchChange: (query: string) => void
  onNewTutor: () => void
  onFilters?: () => void
}

export function TutorsHeader({
  title,
  subtitle,
  searchPlaceholder,
  searchQuery,
  onSearchChange,
  onNewTutor,
  onFilters
}: TutorsHeaderProps): JSX.Element {
  return (
    <div className="flex flex-col gap-6">
      {/* Title and Actions */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {title}
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            {subtitle}
          </p>
        </div>
        <Button onClick={onNewTutor} className="gap-2">
          <Plus className="h-4 w-4" />
          New Tutor
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        {onFilters && (
          <Button variant="outline" onClick={onFilters} className="gap-2">
            <Filter className="h-4 w-4" />
            Filters
          </Button>
        )}
      </div>
    </div>
  )
}
