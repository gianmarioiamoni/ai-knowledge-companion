import { JSX } from 'react'
import { DashboardPageClient } from '@/components/dashboard'
import { AuthGuard } from '@/components/auth/auth-guard'

interface DashboardPageProps {
  params: Promise<{ locale: string }>
}

export default async function DashboardPage({ params }: DashboardPageProps): Promise<JSX.Element> {
  const { locale } = await params
  
  return (
    <AuthGuard requireAuth={true}>
      <DashboardPageClient locale={locale as 'en' | 'it'} />
    </AuthGuard>
  )
}