import { JSX } from 'react'
import { getTranslations } from 'next-intl/server'
import { QuickStartSection } from '@/components/help/sections/quick-start-section'
import { FaqSection } from '@/components/help/sections/faq-section'
import { SupportOptionsSection } from '@/components/help/sections/support-options-section'
import { 
  buildQuickStartSteps, 
  buildFaqCategories, 
  buildSupportOptionsData 
} from '@/lib/help'

interface HelpPageProps {
  params: Promise<{ locale: string }>
}

/**
 * Help Page
 * Server-side rendered help center with FAQ, Quick Start, and Support options
 * 
 * Responsibilities:
 * - Server-side translation fetching
 * - Data orchestration (delegated to lib/help modules)
 * - Component composition
 */
export default async function HelpPage({ params }: HelpPageProps): Promise<JSX.Element> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'help' })

  // Build data using dedicated business logic modules
  const quickStartSteps = buildQuickStartSteps(t)
  const faqCategories = buildFaqCategories(t)
  const supportOptions = buildSupportOptionsData(t, locale)

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">{t('title')}</h1>
        <p className="text-xl text-muted-foreground">{t('subtitle')}</p>
      </div>

      {/* Quick Start Guide */}
      <QuickStartSection 
        title={t('quickStart.title')}
        steps={quickStartSteps}
      />

      {/* FAQ Sections */}
      <FaqSection 
        title={t('faq.title')}
        categories={faqCategories}
      />

      {/* Support Options */}
      <SupportOptionsSection {...supportOptions} />
    </div>
  )
}
