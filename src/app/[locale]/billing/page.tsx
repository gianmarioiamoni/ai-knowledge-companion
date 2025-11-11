import { JSX } from 'react'
import { redirect } from 'next/navigation'
import { BillingPageClient } from '@/components/billing/pages/billing-page-client'
import { getUserServer } from '@/lib/auth'

interface BillingPageProps {
  params: Promise<{ locale: string }>
}

export default async function BillingPage({ params }: BillingPageProps): Promise<JSX.Element> {
  const { locale } = await params
  
  // Server-side authentication check
  const { user } = await getUserServer()
  
  if (!user) {
    redirect(`/${locale}/auth/login`)
  }
  
  return <BillingPageClient />
}

