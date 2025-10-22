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

  // Debug logging (only for processing documents)
  if (isProcessing) {
    console.log(`📄 Document ${document.title} still processing:`, {
      id: document.id,
      status: document.status,
      tokens: document.length_tokens
    })
  }

  return (
    <Card className={`hover:shadow-md transition-shadow ${hasError ? 'border-red-200' : ''}`}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4 flex-1">
            <div className="text-2xl flex-shrink-0">
              {getFileTypeIcon(document.mime_type)}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                {document.title}
              </h3>
              {document.description && (
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">
                  {document.description}
                </p>
              )}

              {/* Document Stats */}
              <div className="flex items-center gap-4 mt-3 text-xs text-gray-500 dark:text-gray-400">
                <span>{formatFileSize(document.file_size)}</span>
                <span>•</span>
                <span>{document.mime_type.split('/')[1].toUpperCase()}</span>
                {document.length_tokens && document.length_tokens > 0 && (
                  <>
                    <span>•</span>
                    <span>{document.length_tokens.toLocaleString()} tokens</span>
                  </>
                )}
                <span>•</span>
                <span>
                  {new Date(document.created_at).toLocaleDateString()}
                </span>
              </div>

              {/* Status Badge */}
              <div className="mt-2">
                {getStatusBadge()}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-shrink-0 ml-4">
            {onDownload && isReady && (
              <Button
                variant="ghost"
                size="sm"
                className="gap-2"
                onClick={() => onDownload(document.id)}
                title="Download file"
              >
                <Download className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => onPreview(document.id)}
              disabled={isProcessing}
              title={isProcessing ? 'Document is still processing' : 'Preview document'}
            >
              <Eye className="h-4 w-4" />
              {translations.preview}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 text-red-600 hover:text-red-700"
              onClick={() => onDelete(document.id)}
              disabled={isProcessing}
              title={isProcessing ? 'Cannot delete while processing' : 'Delete document'}
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
