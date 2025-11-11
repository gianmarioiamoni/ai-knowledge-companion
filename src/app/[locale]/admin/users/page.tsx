import { JSX } from 'react'
import { redirect } from 'next/navigation'
import { AdminUsersPageClient } from '@/components/admin/pages/admin-users-page-client'
import { getUserServer } from '@/lib/auth'

export default async function AdminUsersPage(): Promise<JSX.Element> {
  // Server-side authentication check
  const { user } = await getUserServer()
  
  if (!user) {
    redirect('/auth/login')
  }
  
  return <AdminUsersPageClient />
}

