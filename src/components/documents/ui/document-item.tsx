'use client'

import { JSX } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Eye, Trash2 } from 'lucide-react'
import { getFileTypeIcon } from '@/lib/supabase/documents'
import type { Document } from '@/types/database'

interface DocumentItemProps {
  document: Document
  onDelete: (id: string) => void
  onPreview: (id: string) => void
  translations: {
    uploaded: string
    processed: string
    preview: string
    delete: string
  }
}

export function DocumentItem({
  document,
  onDelete,
  onPreview,
  translations
}: DocumentItemProps): JSX.Element {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-2xl">
              {getFileTypeIcon(document.mime_type)}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {document.title}
              </h3>
              {document.description && (
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {document.description}
                </p>
              )}
              <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                <span>{document.mime_type}</span>
                <span>•</span>
                <span>
                  {translations.uploaded} {new Date(document.created_at).toLocaleDateString()}
                </span>
                <span>•</span>
                <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  {translations.processed}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => onPreview(document.id)}
            >
              <Eye className="h-4 w-4" />
              {translations.preview}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 text-red-600 hover:text-red-700"
              onClick={() => onDelete(document.id)}
            >
              <Trash2 className="h-4 w-4" />
              {translations.delete}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
