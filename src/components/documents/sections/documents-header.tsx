'use client'

import { JSX } from 'react'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

interface DocumentsHeaderProps {
  title: string
  subtitle: string
  uploadButtonText: string
  showUpload: boolean
  onToggleUpload: () => void
}

export function DocumentsHeader({
  title,
  subtitle,
  uploadButtonText,
  showUpload,
  onToggleUpload
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
      <Button
        className="gap-2"
        onClick={onToggleUpload}
      >
        <Plus className="h-4 w-4" />
        {showUpload ? 'Hide Upload' : uploadButtonText}
      </Button>
    </div>
  )
}
