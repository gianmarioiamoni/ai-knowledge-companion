import { useTranslations } from 'next-intl'
import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('legal.terms')
  
  return {
    title: t('pageTitle'),
    description: t('pageDescription'),
  }
}

export default function TermsOfServicePage() {
  const t = useTranslations('legal.terms')

  return (
    <div className="container max-w-4xl py-12 px-4 md:px-6 lg:px-8">
      <div className="space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">
            {t('title')}
          </h1>
          <p className="text-muted-foreground">
            {t('lastUpdated')}: {new Date().toLocaleDateString()}
          </p>
        </div>

        {/* Introduction */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">{t('intro.title')}</h2>
          <p className="text-muted-foreground leading-relaxed">
            {t('intro.content')}
          </p>
        </section>

        {/* Acceptance */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">{t('acceptance.title')}</h2>
          <p className="text-muted-foreground">{t('acceptance.content')}</p>
        </section>

        {/* Service Description */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">{t('service.title')}</h2>
          <p className="text-muted-foreground">{t('service.content')}</p>
        </section>

        {/* Account */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">{t('account.title')}</h2>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
            <li>{t('account.accurate')}</li>
            <li>{t('account.security')}</li>
            <li>{t('account.unauthorized')}</li>
            <li>{t('account.responsibility')}</li>
          </ul>
        </section>

        {/* Use Restrictions */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">{t('restrictions.title')}</h2>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
            <li>{t('restrictions.illegal')}</li>
            <li>{t('restrictions.abuse')}</li>
            <li>{t('restrictions.interference')}</li>
            <li>{t('restrictions.automated')}</li>
            <li>{t('restrictions.rights')}</li>
            <li>{t('restrictions.resell')}</li>
          </ul>
        </section>

        {/* Content Ownership */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">{t('content.title')}</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-medium mb-2">{t('content.yourContent.title')}</h3>
              <p className="text-muted-foreground">{t('content.yourContent.content')}</p>
            </div>
            <div>
              <h3 className="text-xl font-medium mb-2">{t('content.ourContent.title')}</h3>
              <p className="text-muted-foreground">{t('content.ourContent.content')}</p>
            </div>
          </div>
        </section>

        {/* Subscriptions and Payments */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">{t('payments.title')}</h2>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
            <li>{t('payments.billing')}</li>
            <li>{t('payments.cancellation')}</li>
            <li>{t('payments.refunds')}</li>
            <li>{t('payments.changes')}</li>
          </ul>
        </section>

        {/* Termination */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">{t('termination.title')}</h2>
          <p className="text-muted-foreground">{t('termination.content')}</p>
        </section>

        {/* Disclaimer */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">{t('disclaimer.title')}</h2>
          <p className="text-muted-foreground">{t('disclaimer.content')}</p>
        </section>

        {/* Liability */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">{t('liability.title')}</h2>
          <p className="text-muted-foreground">{t('liability.content')}</p>
        </section>

        {/* Changes */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">{t('changes.title')}</h2>
          <p className="text-muted-foreground">{t('changes.content')}</p>
        </section>

        {/* Governing Law */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">{t('law.title')}</h2>
          <p className="text-muted-foreground">{t('law.content')}</p>
        </section>

        {/* Contact */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">{t('contact.title')}</h2>
          <p className="text-muted-foreground">{t('contact.content')}</p>
          <div className="bg-muted p-4 rounded-lg">
            <p className="font-medium">AI Knowledge Companion</p>
            <p className="text-sm text-muted-foreground">Email: legal@aiknowledgecompanion.com</p>
          </div>
        </section>
      </div>
    </div>
  )
}

