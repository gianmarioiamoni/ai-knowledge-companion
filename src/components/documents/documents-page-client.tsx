'use client'

import { JSX, useState } from 'react'
import { useTranslations } from '@/hooks/use-translations'
import { useDocuments } from '@/hooks/use-documents'
import { DocumentsHeader } from './documents-header'
import { UploadSection } from './upload-section'
import { ErrorDisplay } from './error-display'
import { DocumentsList } from './documents-list'

interface DocumentsPageClientProps {
  locale: 'en' | 'it'
}

export function DocumentsPageClient({ locale }: DocumentsPageClientProps): JSX.Element {
  const { t } = useTranslations(locale)
  const { documents, loading, error, uploadDocument, deleteDocument } = useDocuments()
  const [showUpload, setShowUpload] = useState(false)

  const handlePreviewDocument = (id: string) => {
    // TODO: Implement document preview
    console.log('Preview document:', id)
  }

  const documentTranslations = {
    uploaded: t('documents.meta.uploaded'),
    processed: t('documents.status.processed'),
    preview: t('documents.actions.preview'),
    delete: t('documents.actions.delete')
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <DocumentsHeader
        title={t('documents.title')}
        subtitle={t('documents.subtitle')}
        uploadButtonText={t('documents.upload.title')}
        showUpload={showUpload}
        onToggleUpload={() => setShowUpload(!showUpload)}
      />

      <UploadSection
        title={t('documents.upload.title')}
        description={t('documents.upload.description')}
        onUpload={uploadDocument}
        loading={loading}
        show={showUpload}
      />

      <ErrorDisplay error={error} />

      <DocumentsList
        title={t('documents.list.title')}
        documents={documents}
        loading={loading}
        emptyMessage={t('documents.list.empty')}
        onDeleteDocument={deleteDocument}
        onPreviewDocument={handlePreviewDocument}
        translations={documentTranslations}
      />
    </div>
  )
}
