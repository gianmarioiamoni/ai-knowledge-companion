import { JSX } from 'react'
import { redirect } from 'next/navigation'
import { AdminDashboardPageClient } from '@/components/admin/pages/admin-dashboard-page-client'
import { getUserServer } from '@/lib/auth'

export default async function AdminDashboardPage(): Promise<JSX.Element> {
  // Server-side authentication check
  const { user } = await getUserServer()
  
  if (!user) {
    redirect('/auth/login')
  }
  
  return <AdminDashboardPageClient />
}

