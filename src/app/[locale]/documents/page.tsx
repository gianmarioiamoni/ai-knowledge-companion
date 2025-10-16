import { DocumentsPageClient } from '@/components/documents/documents-page-client'

interface DocumentsPageProps {
  params: Promise<{ locale: string }>
}

export default async function DocumentsPage({ params }: DocumentsPageProps): Promise<JSX.Element> {
  const { locale } = await params
  
  return <DocumentsPageClient locale={locale as 'en' | 'it'} />
}
