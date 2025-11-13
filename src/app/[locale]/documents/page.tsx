import { JSX } from 'react'
import { redirect } from 'next/navigation'
import { DocumentsPageClient } from '@/components/documents'
import { getUserServer } from '@/lib/auth'

// Force dynamic rendering - this page uses cookies() for auth
export const dynamic = 'force-dynamic'

interface DocumentsPageProps{
  params: Promise<{ locale: string }>
}

export default async function DocumentsPage({ params }: DocumentsPageProps): Promise<JSX.Element> {
  const { locale } = await params
  
  // Server-side authentication check
  const { user } = await getUserServer()
  
  if (!user) {
    redirect(`/${locale}/auth/login`)
  }

  return <DocumentsPageClient />
}
