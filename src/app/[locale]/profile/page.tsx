import { AuthGuard } from '@/components/auth/auth-guard'
import { ProfilePageClient } from '@/components/profile/pages/profile-page-client'
import type { JSX } from 'react'

interface ProfilePageProps {
  params: Promise<{
    locale: 'en' | 'it'
  }>
}

export default async function ProfilePage({ params }: ProfilePageProps): Promise<JSX.Element> {
  const { locale } = await params
  
  return (
    <AuthGuard>
      <ProfilePageClient locale={locale} />
    </AuthGuard>
  )
}

