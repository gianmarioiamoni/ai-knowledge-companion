import { JSX } from 'react'
import { redirect } from 'next/navigation'
import { TutorsPageClient } from "@/components/tutors/pages/tutors-page-client";
import { getUserServer } from '@/lib/auth'

// Force dynamic rendering - this page uses cookies() for auth
export const dynamic = 'force-dynamic'

interface TutorsPageProps {
  params: Promise<{ locale: string }>
}

export default async function TutorsPage({ params }: TutorsPageProps): Promise<JSX.Element> {
  const { locale } = await params
  
  // Server-side authentication check
  const { user } = await getUserServer()
  
  if (!user) {
    redirect(`/${locale}/auth/login`)
  }

  return <TutorsPageClient />
}
