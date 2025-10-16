import { JSX } from 'react'

import { LandingPageClient } from '@/components/landing'


interface LandingPageProps {
  params: Promise<{ locale: string }>
}

export default async function LandingPage({ params }: LandingPageProps): Promise<JSX.Element> {
  const { locale } = await params

  return <LandingPageClient locale={locale as 'en' | 'it'} />
}
