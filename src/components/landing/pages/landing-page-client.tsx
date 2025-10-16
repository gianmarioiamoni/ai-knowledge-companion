'use client'

import { useTranslations } from '@/hooks/use-translations'
import { HeroSection } from '../sections/hero-section'
import { FeaturesSection } from '../sections/features-section'

interface LandingPageClientProps {
  locale: 'en' | 'it'
}

export function LandingPageClient({ locale }: LandingPageClientProps): JSX.Element {
  const { t } = useTranslations(locale)

  const heroProps = {
    title: t('landing.title'),
    subtitle: t('landing.subtitle'),
    description: t('landing.description'),
    ctaPrimary: t('landing.cta.primary'),
    ctaSecondary: t('landing.cta.secondary'),
    locale
  }

  const featuresProps = {
    features: {
      upload: {
        title: t('landing.features.upload.title'),
        description: t('landing.features.upload.description')
      },
      customize: {
        title: t('landing.features.customize.title'),
        description: t('landing.features.customize.description')
      },
      learn: {
        title: t('landing.features.learn.title'),
        description: t('landing.features.learn.description')
      },
      share: {
        title: t('landing.features.share.title'),
        description: t('landing.features.share.description')
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <HeroSection {...heroProps} />
      <FeaturesSection {...featuresProps} />
    </div>
  )
}
