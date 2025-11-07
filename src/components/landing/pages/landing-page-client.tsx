'use client'

import { JSX } from 'react'
import { useTranslations } from 'next-intl'
import { HeroSection } from '../sections/hero-section'
import { MarketplaceSection } from '../sections/marketplace-section'
import { FeaturesSection } from '../sections/features-section'

export function LandingPageClient(): JSX.Element {
  const t = useTranslations('landing')

  const heroProps = {
    title: t('title'),
    subtitle: t('subtitle'),
    description: t('description'),
    ctaPrimary: t('cta.primary'),
    ctaSecondary: t('cta.secondary')
  }

  const marketplaceProps = {
    title: t('marketplace.title'),
    description: t('marketplace.description'),
    cta: t('marketplace.cta'),
    noAccountRequired: t('marketplace.noAccountRequired'),
    stats: {
      tutors: t('marketplace.stats.tutors'),
      downloads: t('marketplace.stats.downloads'),
      users: t('marketplace.stats.users')
    }
  }

  const featuresProps = {
    features: {
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
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <HeroSection {...heroProps} />
      <FeaturesSection {...featuresProps} />
      <MarketplaceSection {...marketplaceProps} />
    </div>
  )
}
