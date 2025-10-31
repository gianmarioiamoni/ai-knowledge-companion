'use client'

import { JSX } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Eye, Trash2, Clock, CheckCircle, AlertCircle, Download } from 'lucide-react'
import { getFileTypeIcon } from '@/lib/supabase/documents'
import type { Document } from '@/types/database'

interface DocumentItemProps {
  document: Document
  onDelete: (id: string) => void
  onPreview: (id: string) => void
  onDownload?: (id: string) => void
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
  onDownload,
  translations
}: DocumentItemProps): JSX.Element {
  const getStatusBadge = () => {
    switch (document.status) {
      case 'processing':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
            <Clock className="h-3 w-3" />
            Processing
          </span>
        )
      case 'ready':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            <CheckCircle className="h-3 w-3" />
            Ready
          </span>
        )
      case 'error':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
            <AlertCircle className="h-3 w-3" />
            Error
          </span>
        )
      default:
        return (
          <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200">
            Unknown
          </span>
        )
    }
  }

  const formatFileSize = (bytes?: number | null) => {
    if (!bytes) return 'Unknown size'
    const mb = bytes / (1024 * 1024)
    return `${mb.toFixed(1)} MB`
  }

  const isProcessing = document.status === 'processing'
  const isReady = document.status === 'ready'
  const hasError = document.status === 'error'

  // Debug logging removed for cleaner console

  return (
    <Card className={`hover:shadow-md transition-shadow ${hasError ? 'border-red-200' : ''} overflow-hidden`}>
      <CardContent className="p-3 sm:p-4 lg:p-6">
        <div className="flex flex-col sm:flex-row items-start justify-between gap-3 sm:gap-4">
          <div className="flex items-start gap-2 sm:gap-3 lg:gap-4 flex-1 w-full min-w-0">
            <div className="text-xl sm:text-2xl flex-shrink-0">
              {getFileTypeIcon(document.mime_type)}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white truncate">
                {document.title}
              </h3>
              {document.description && (
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mt-0.5 sm:mt-1 line-clamp-2">
                  {document.description}
                </p>
              )}

              {/* Document Stats */}
              <div className="flex flex-wrap items-center gap-1 sm:gap-2 lg:gap-4 mt-2 sm:mt-3 text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
                <span className="whitespace-nowrap">{formatFileSize(document.file_size)}</span>
                <span className="hidden sm:inline">•</span>
                <span className="whitespace-nowrap">{document.mime_type.split('/')[1].toUpperCase()}</span>
                {document.length_tokens && document.length_tokens > 0 && (
                  <>
                    <span className="hidden sm:inline">•</span>
                    <span className="whitespace-nowrap">{document.length_tokens.toLocaleString()} tokens</span>
                  </>
                )}
                <span className="hidden sm:inline">•</span>
                <span className="whitespace-nowrap">
                  {new Date(document.created_at).toLocaleDateString()}
                </span>
              </div>

              {/* Status Badge */}
              <div className="mt-1.5 sm:mt-2">
                {getStatusBadge()}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0 w-full sm:w-auto sm:ml-2 lg:ml-4">
            {onDownload && isReady && (
              <Button
                variant="ghost"
                size="sm"
                className="gap-1 px-2 sm:px-3 flex-1 sm:flex-none"
                onClick={() => onDownload(document.id)}
                title="Download file"
              >
                <Download className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="text-xs sm:hidden">Download</span>
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              className="gap-1 px-2 sm:px-3 text-xs sm:text-sm flex-1 sm:flex-none"
              onClick={() => onPreview(document.id)}
              disabled={isProcessing}
              title={isProcessing ? 'Document is still processing' : 'Preview document'}
            >
              <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="sm:inline">{translations.preview}</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-1 px-2 sm:px-3 text-xs sm:text-sm text-red-600 hover:text-red-700 flex-1 sm:flex-none"
              onClick={() => onDelete(document.id)}
              disabled={isProcessing}
              title={isProcessing ? 'Cannot delete while processing' : 'Delete document'}
            >
              <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="sm:inline">{translations.delete}</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
