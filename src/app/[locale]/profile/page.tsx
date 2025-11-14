import { redirect } from 'next/navigation'
import { ProfilePageClient } from '@/components/profile/pages/profile-page-client'
import { getUserServer } from '@/lib/auth'
import type { JSX } from 'react'

// Force dynamic rendering - this page uses cookies() for auth
export const dynamic = 'force-dynamic'

interface ProfilePageProps {
  params: Promise<{
    locale: 'en' | 'it'
  }>
}

export default async function ProfilePage({ params }: ProfilePageProps): Promise<JSX.Element> {
  const { locale } = await params
  
  // Server-side authentication check
  const { user } = await getUserServer()
  
  if (!user) {
    redirect(`/${locale}/auth/login`)
  }
  
  return <ProfilePageClient />
}

