import { AuthGuard } from '@/components/auth/auth-guard'
import { ProfilePageClient } from '@/components/profile/pages/profile-page-client'
import type { JSX } from 'react'

interface ProfilePageProps {
  params: {
    locale: 'en' | 'it'
  }
}

export default function ProfilePage({ params }: ProfilePageProps): JSX.Element {
  return (
    <AuthGuard>
      <ProfilePageClient locale={params.locale} />
    </AuthGuard>
  )
}

