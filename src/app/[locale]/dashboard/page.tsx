import { JSX } from 'react'
import { redirect } from 'next/navigation'
import { DashboardPageClient } from '@/components/dashboard'
import { getUserServer } from '@/lib/auth'
import { getDashboardStatsServer } from '@/lib/supabase/dashboard-server'

// Force dynamic rendering - this page uses cookies() for auth
export const dynamic = 'force-dynamic'

interface DashboardPageProps {
  params: Promise<{ locale: string }>
}

export default async function DashboardPage({ params }: DashboardPageProps): Promise<JSX.Element> {
  const { locale } = await params
  
  // Server-side authentication check
  const { user } = await getUserServer()
  
  if (!user) {
    redirect(`/${locale}/auth/login`)
  }
  
  // Server-side data fetching
  const { data: initialStats } = await getDashboardStatsServer(user.id)
  
  return <DashboardPageClient locale={locale as 'en' | 'it'} initialStats={initialStats} />
}