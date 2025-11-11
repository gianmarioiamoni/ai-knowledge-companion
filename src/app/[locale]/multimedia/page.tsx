/**
 * Multimedia Page - Audio/Video/Image Management
 * Sprint 5: Audio support (active), Video/Image (coming soon)
 */

import { redirect } from 'next/navigation'
import { MultimediaPageClient } from "@/components/multimedia/pages/multimedia-page-client";
import { getUserServer } from '@/lib/auth'

interface MultimediaPageProps {
  params: Promise<{ locale: string }>
}

export default async function MultimediaPage({ params }: MultimediaPageProps) {
  const { locale } = await params
  
  // Server-side authentication check
  const { user } = await getUserServer()
  
  if (!user) {
    redirect(`/${locale}/auth/login`)
  }
  
  return <MultimediaPageClient />
}

