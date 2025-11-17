import { JSX } from 'react'
import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { HeroSection, FeaturesSection, MarketplaceSection } from '@/components/landing/sections'
import { StructuredDataWrapper } from '@/components/seo'
import { getUserServer } from '@/lib/auth'
import { 
  generateLandingMetadata,
  generateOrganizationSchema,
  generateWebSiteSchema,
  generateSoftwareApplicationSchema,
} from '@/lib/seo'

// Force dynamic rendering for authentication check
export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  return generateLandingMetadata(locale)
}

export default async function LandingPage({ params }: { params: Promise<{ locale: string }> }): Promise<JSX.Element> {
  const { locale } = await params
  
  // Check if user is authenticated
  const { user } = await getUserServer()
  const isAuthenticated = !!user
  
  // Server-side translations
  const t = await getTranslations({ locale, namespace: 'landing' })
  const tNav = await getTranslations({ locale, namespace: 'navigation' })

  // Generate structured data for SEO
  const structuredData = [
    generateOrganizationSchema(locale),
    generateWebSiteSchema(locale),
    generateSoftwareApplicationSchema(locale),
  ]

  return (
    <>
      <StructuredDataWrapper data={structuredData} />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <HeroSection
          title={t('title')}
          subtitle={t('subtitle')}
          description={t('description')}
          ctaPrimary={isAuthenticated ? tNav('dashboard') : t('cta.primary')}
          ctaSecondary={t('cta.secondary')}
          isAuthenticated={isAuthenticated}
          helpCenterText={tNav('help')}
        />
        <FeaturesSection
          features={{
            upload: {
              title: t('features.upload.title'),
              description: t('features.upload.description')
            },
            customize: {
              title: t('features.customize.title'),
              description: t('features.customize.description')
            },
            learn: {
              title: t('features.learn.title'),
              description: t('features.learn.description')
            },
            share: {
              title: t('features.share.title'),
              description: t('features.share.description')
            }
          }}
        />
        <MarketplaceSection
          title={t('marketplace.title')}
          description={t('marketplace.description')}
          cta={t('marketplace.cta')}
          noAccountRequired={t('marketplace.noAccountRequired')}
          stats={{
            tutors: t('marketplace.stats.tutors'),
            downloads: t('marketplace.stats.downloads'),
            users: t('marketplace.stats.users')
          }}
        />
      </div>
    </>
  )
}
