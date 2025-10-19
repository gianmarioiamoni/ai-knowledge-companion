import { JSX } from 'react'
import { DocumentsPageClient } from '@/components/documents'
import { AuthGuard } from '@/components/auth/auth-guard'

interface DocumentsPageProps {
  params: Promise<{ locale: string }>
}

export default async function DocumentsPage({ params }: DocumentsPageProps): Promise<JSX.Element> {
  const { locale } = await params

  return (
    <AuthGuard requireAuth={true}>
      <DocumentsPageClient locale={locale as 'en' | 'it'} />
    </AuthGuard>
  )
}
