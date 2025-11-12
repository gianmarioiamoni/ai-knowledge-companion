import { JSX } from 'react'
import { redirect } from 'next/navigation'
import { AdminBillingPageClient } from '@/components/admin/pages/admin-billing-page-client'
import { getUserServer } from '@/lib/auth'

// Force dynamic rendering - this page uses cookies() for auth
export const dynamic = 'force-dynamic'

export default async function AdminBillingPage(): Promise<JSX.Element> {
  // Server-side authentication check
  const { user } = await getUserServer()
  
  if (!user) {
    redirect('/auth/login')
  }
  
  return <AdminBillingPageClient />
}

