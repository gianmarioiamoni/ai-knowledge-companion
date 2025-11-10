import { JSX } from 'react'
import type { Metadata } from 'next'
import { LandingPageClient } from '@/components/landing'
import { StructuredDataWrapper } from '@/components/seo'
import { 
  generateLandingMetadata,
  generateOrganizationSchema,
  generateWebSiteSchema,
  generateSoftwareApplicationSchema,
} from '@/lib/seo'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  return generateLandingMetadata(locale)
}

export default async function LandingPage({ params }: { params: Promise<{ locale: string }> }): Promise<JSX.Element> {
  const { locale } = await params

  // Generate structured data for SEO
  const structuredData = [
    generateOrganizationSchema(locale),
    generateWebSiteSchema(locale),
    generateSoftwareApplicationSchema(locale),
  ]

  return (
    <>
      <StructuredDataWrapper data={structuredData} />
      <LandingPageClient />
    </>
  )
}
