'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Upload, FileText, Trash2, Eye, Plus } from 'lucide-react'
import { useTranslations } from '@/hooks/use-translations'

interface DocumentsPageClientProps {
  locale: 'en' | 'it'
}

// Mock data for now
const mockDocuments = [
  {
    id: '1',
    title: 'Machine Learning Basics.pdf',
    description: 'Introduction to machine learning concepts',
    size: '2.4 MB',
    uploadedAt: '2024-01-15',
    type: 'pdf',
    status: 'processed'
  },
  {
    id: '2',
    title: 'React Documentation.md',
    description: 'React hooks and components guide',
    size: '1.2 MB',
    uploadedAt: '2024-01-14',
    type: 'markdown',
    status: 'processing'
  }
]

export function DocumentsPageClient({ locale }: DocumentsPageClientProps): JSX.Element {
  const { t } = useTranslations(locale)
  const [documents] = useState(mockDocuments)

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
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          {t('documents.upload.title')}
        </Button>
      </div>

      {/* Upload Area */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            {t('documents.upload.title')}
          </CardTitle>
          <CardDescription>
            {t('documents.upload.description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:border-gray-400 dark:hover:border-gray-500 transition-colors cursor-pointer">
            <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-lg font-medium text-gray-600 dark:text-gray-300 mb-2">
              {t('documents.upload.dropzone')}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t('documents.upload.browse')}
            </p>
            <Button variant="outline" className="mt-4">
              {t('documents.upload.button')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Documents List */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          {t('documents.list.title')}
        </h2>
        
        {documents.length === 0 ? (
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
                      <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                        <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {doc.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {doc.description}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                          <span>{doc.size}</span>
                          <span>•</span>
                          <span>
                            {t('documents.meta.uploaded')} {doc.uploadedAt}
                          </span>
                          <span>•</span>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            doc.status === 'processed' 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                          }`}>
                            {doc.status === 'processed' 
                              ? t('documents.status.processed')
                              : t('documents.status.processing')
                            }
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" className="gap-2">
                        <Eye className="h-4 w-4" />
                        {t('documents.actions.preview')}
                      </Button>
                      <Button variant="outline" size="sm" className="gap-2 text-red-600 hover:text-red-700">
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
