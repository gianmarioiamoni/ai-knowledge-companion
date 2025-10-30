import { JSX } from 'react'
import { TutorsPageClient } from "@/components/tutors/pages/tutors-page-client";
import { AuthGuard } from '@/components/auth/auth-guard'

interface TutorsPageProps {
  params: Promise<{ locale: string }>
}

export default async function TutorsPage({ params }: TutorsPageProps): Promise<JSX.Element> {
  const { locale } = await params

  return (
    <AuthGuard requireAuth={true}>
      <TutorsPageClient locale={locale as 'en' | 'it'} />
    </AuthGuard>
  )
}
