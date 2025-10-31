'use client'

import { JSX } from 'react'
import { Button } from '@/components/ui/button'
import { Plus, RefreshCw, Wifi } from 'lucide-react'

interface DocumentsHeaderProps {
  title: string
  subtitle: string
  uploadButtonText: string
  showUpload: boolean
  onToggleUpload: () => void
  onRefresh?: () => void
  onTestConnectivity?: () => void
}

export function DocumentsHeader({
  title,
  subtitle,
  uploadButtonText,
  showUpload,
  onToggleUpload,
  onRefresh,
  onTestConnectivity
}: DocumentsHeaderProps): JSX.Element {
  return (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 sm:gap-0 mb-6 sm:mb-8">
      <div className="min-w-0">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white truncate">
          {title}
        </h1>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mt-1 sm:mt-2 line-clamp-2">
          {subtitle}
        </p>
      </div>
      <div className="flex gap-1.5 sm:gap-2 flex-shrink-0">
        {onTestConnectivity && (
          <Button
            variant="outline"
            onClick={onTestConnectivity}
            className="gap-1 sm:gap-2 px-2 sm:px-4"
            size="sm"
            title="Test Supabase connectivity"
          >
            <Wifi className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline text-xs sm:text-sm">Test</span>
          </Button>
        )}
        {onRefresh && (
          <Button
            variant="outline"
            onClick={onRefresh}
            className="gap-1 sm:gap-2 px-2 sm:px-4"
            size="sm"
            title="Refresh documents"
          >
            <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline text-xs sm:text-sm">Refresh</span>
          </Button>
        )}
        <Button
          className="gap-1 sm:gap-2 px-2 sm:px-4"
          size="sm"
          onClick={onToggleUpload}
        >
          <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
          <span className="text-xs sm:text-sm">{showUpload ? 'Hide' : uploadButtonText}</span>
        </Button>
      </div>
    </div>
  )
}
