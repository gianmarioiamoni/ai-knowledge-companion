'use client'

import { JSX, useState } from 'react'
import { useTranslations } from 'next-intl'
import { useDocuments } from '@/hooks/use-documents'
import { DocumentsHeader } from '../sections/documents-header'
import { UploadSection } from '../sections/upload-section'
import { ErrorDisplay } from '../ui/error-display'
import { DocumentsList } from '../sections/documents-list'
import { DocumentPreview } from '../ui/document-preview'
import type { Document } from '@/types/database'

export function DocumentsPageClient(): JSX.Element {
  const t = useTranslations('documents')
  const { documents, loading, error, uploadDocument, deleteDocument, getFileUrl, refreshDocuments } = useDocuments()
  const [showUpload, setShowUpload] = useState(false)
  const [previewDocument, setPreviewDocument] = useState<Document | null>(null)

  const handlePreviewDocument = (id: string) => {
    const document = documents.find(doc => doc.id === id)
    if (document) {
      setPreviewDocument(document)
    }
  }

  const handleDownloadDocument = async (doc: Document) => {
    try {
      const url = await getFileUrl(doc.storage_path)
      if (url) {
        // Create a temporary link to download the file
        const link = window.document.createElement('a')
        link.href = url
        link.download = doc.title
        link.style.display = 'none'
        window.document.body.appendChild(link)
        link.click()
        window.document.body.removeChild(link)
      }
    } catch (error) {
      console.error('Download failed:', error)
    }
  }

  const documentTranslations = {
    uploaded: t('uploaded'),
    processed: t('ready'),
    preview: t('preview'), // Usa la traduzione corretta
    delete: t('delete')
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-4 sm:py-6 lg:py-8">
      <div className="mx-auto px-3 sm:px-4 lg:px-6 max-w-7xl">
        <DocumentsHeader
          title={t('title')}
          subtitle={t('title')}
          uploadButtonText={t('upload')}
          showUpload={showUpload}
          onToggleUpload={() => setShowUpload(!showUpload)}
          onRefresh={refreshDocuments}
        />

        <UploadSection
          title={t('upload')}
          description={t('supportedFormats')}
          onUpload={uploadDocument}
          loading={loading}
          show={showUpload}
        />

        <ErrorDisplay error={error} />

        <DocumentsList
          title={t('title')}
          documents={documents}
          loading={loading}
          emptyMessage={t('nameRequired')}
          onDeleteDocument={deleteDocument}
          onPreviewDocument={handlePreviewDocument}
          onDownloadDocument={(id) => {
            const document = documents.find(doc => doc.id === id)
            if (document) {
              handleDownloadDocument(document)
            }
          }}
          translations={documentTranslations}
        />

        {/* Document Preview Modal */}
        <DocumentPreview
          document={previewDocument}
          isOpen={!!previewDocument}
          onClose={() => setPreviewDocument(null)}
          onDownload={handleDownloadDocument}
        />
      </div>
    </div>
  )
}
