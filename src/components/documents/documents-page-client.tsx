'use client'

import { JSX, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, Trash2, Eye, Plus } from 'lucide-react'
import { useTranslations } from '@/hooks/use-translations'
import { useDocuments } from '@/hooks/use-documents'
import { FileUpload } from './file-upload'
import { getFileTypeIcon } from '@/lib/supabase/documents'

interface DocumentsPageClientProps {
  locale: 'en' | 'it'
}

export function DocumentsPageClient({ locale }: DocumentsPageClientProps): JSX.Element {
  const { t } = useTranslations(locale)
  const { documents, loading, error, uploadDocument, deleteDocument } = useDocuments()
  const [showUpload, setShowUpload] = useState(false)

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t('documents.title')}
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            {t('documents.subtitle')}
          </p>
        </div>
        <Button
          className="gap-2"
          onClick={() => setShowUpload(!showUpload)}
        >
          <Plus className="h-4 w-4" />
          {showUpload ? 'Hide Upload' : t('documents.upload.title')}
        </Button>
      </div>

      {/* Upload Area */}
      {showUpload && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>
              {t('documents.upload.title')}
            </CardTitle>
            <CardDescription>
              {t('documents.upload.description')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FileUpload
              onUpload={uploadDocument}
              loading={loading}
            />
          </CardContent>
        </Card>
      )}

      {/* Error Display */}
      {error && (
        <Card className="mb-8 border-red-200 bg-red-50 dark:bg-red-950">
          <CardContent className="p-4">
            <p className="text-red-600 dark:text-red-400 text-sm">
              {error}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Documents List */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          {t('documents.list.title')}
        </h2>

        {loading ? (
          <Card>
            <CardContent className="py-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-300">
                Loading documents...
              </p>
            </CardContent>
          </Card>
        ) : documents.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 dark:text-gray-300">
                {t('documents.list.empty')}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {documents.map((doc) => (
              <Card key={doc.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-2xl">
                        {getFileTypeIcon(doc.mime_type)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {doc.title}
                        </h3>
                        {doc.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            {doc.description}
                          </p>
                        )}
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                          <span>{doc.mime_type}</span>
                          <span>•</span>
                          <span>
                            {t('documents.meta.uploaded')} {new Date(doc.created_at).toLocaleDateString()}
                          </span>
                          <span>•</span>
                          <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                            {t('documents.status.processed')}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" className="gap-2">
                        <Eye className="h-4 w-4" />
                        {t('documents.actions.preview')}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2 text-red-600 hover:text-red-700"
                        onClick={() => deleteDocument(doc.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                        {t('documents.actions.delete')}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
