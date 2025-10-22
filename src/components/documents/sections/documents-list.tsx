'use client'

import { JSX } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { FileText } from 'lucide-react'
import { DocumentItem } from '../ui/document-item'
import type { Document } from '@/types/database'

interface DocumentsListProps {
  title: string
  documents: Document[]
  loading: boolean
  emptyMessage: string
  onDeleteDocument: (id: string) => void
  onPreviewDocument: (id: string) => void
  onDownloadDocument?: (id: string) => void
  translations: {
    uploaded: string
    processed: string
    preview: string
    delete: string
  }
}

export function DocumentsList({
  title,
  documents,
  loading,
  emptyMessage,
  onDeleteDocument,
  onPreviewDocument,
  onDownloadDocument,
  translations
}: DocumentsListProps): JSX.Element {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
        {title}
      </h2>

      {loading ? (
        <LoadingState />
      ) : documents.length === 0 ? (
        <EmptyState message={emptyMessage} />
      ) : (
        <div className="grid gap-4">
          {documents.map((document) => (
            <DocumentItem
              key={document.id}
              document={document}
              onDelete={onDeleteDocument}
              onPreview={onPreviewDocument}
              onDownload={onDownloadDocument}
              translations={translations}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function LoadingState(): JSX.Element {
  return (
    <Card>
      <CardContent className="py-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-300">
          Loading documents...
        </p>
      </CardContent>
    </Card>
  )
}

function EmptyState({ message }: { message: string }): JSX.Element {
  return (
    <Card>
      <CardContent className="py-8 text-center">
        <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
        <p className="text-gray-600 dark:text-gray-300">
          {message}
        </p>
      </CardContent>
    </Card>
  )
}
