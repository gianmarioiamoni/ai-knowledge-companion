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
    <div className="flex justify-between items-center mb-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {title}
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mt-2">
          {subtitle}
        </p>
      </div>
      <div className="flex gap-2">
        {onTestConnectivity && (
          <Button
            variant="outline"
            onClick={onTestConnectivity}
            className="gap-2"
            title="Test Supabase connectivity"
          >
            <Wifi className="h-4 w-4" />
            Test
          </Button>
        )}
        {onRefresh && (
          <Button
            variant="outline"
            onClick={onRefresh}
            className="gap-2"
            title="Refresh documents"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        )}
        <Button
          className="gap-2"
          onClick={onToggleUpload}
        >
          <Plus className="h-4 w-4" />
          {showUpload ? 'Hide Upload' : uploadButtonText}
        </Button>
      </div>
    </div>
  )
}
