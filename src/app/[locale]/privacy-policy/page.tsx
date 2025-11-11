import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'legal.privacy' })
  
  return {
    title: t('pageTitle'),
    description: t('pageDescription'),
  }
}

export default async function PrivacyPolicyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'legal.privacy' })

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

        {/* Data We Collect */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">{t('dataCollected.title')}</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-medium mb-2">{t('dataCollected.account.title')}</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>{t('dataCollected.account.email')}</li>
                <li>{t('dataCollected.account.name')}</li>
                <li>{t('dataCollected.account.password')}</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-medium mb-2">{t('dataCollected.usage.title')}</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>{t('dataCollected.usage.documents')}</li>
                <li>{t('dataCollected.usage.tutors')}</li>
                <li>{t('dataCollected.usage.conversations')}</li>
                <li>{t('dataCollected.usage.multimedia')}</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-medium mb-2">{t('dataCollected.technical.title')}</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>{t('dataCollected.technical.ip')}</li>
                <li>{t('dataCollected.technical.browser')}</li>
                <li>{t('dataCollected.technical.cookies')}</li>
              </ul>
            </div>
          </div>
        </section>

        {/* How We Use Data */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">{t('howWeUse.title')}</h2>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
            <li>{t('howWeUse.provide')}</li>
            <li>{t('howWeUse.improve')}</li>
            <li>{t('howWeUse.communicate')}</li>
            <li>{t('howWeUse.security')}</li>
            <li>{t('howWeUse.legal')}</li>
          </ul>
        </section>

        {/* Legal Basis (GDPR) */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">{t('legalBasis.title')}</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-medium mb-2">{t('legalBasis.contract.title')}</h3>
              <p className="text-muted-foreground">{t('legalBasis.contract.content')}</p>
            </div>
            <div>
              <h3 className="text-xl font-medium mb-2">{t('legalBasis.consent.title')}</h3>
              <p className="text-muted-foreground">{t('legalBasis.consent.content')}</p>
            </div>
            <div>
              <h3 className="text-xl font-medium mb-2">{t('legalBasis.legitimate.title')}</h3>
              <p className="text-muted-foreground">{t('legalBasis.legitimate.content')}</p>
            </div>
          </div>
        </section>

        {/* Data Sharing */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">{t('dataSharing.title')}</h2>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
            <li>{t('dataSharing.openai')}</li>
            <li>{t('dataSharing.supabase')}</li>
            <li>{t('dataSharing.stripe')}</li>
            <li>{t('dataSharing.hosting')}</li>
          </ul>
        </section>

        {/* Your Rights (GDPR) */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">{t('yourRights.title')}</h2>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
            <li><strong>{t('yourRights.access.title')}:</strong> {t('yourRights.access.content')}</li>
            <li><strong>{t('yourRights.rectification.title')}:</strong> {t('yourRights.rectification.content')}</li>
            <li><strong>{t('yourRights.erasure.title')}:</strong> {t('yourRights.erasure.content')}</li>
            <li><strong>{t('yourRights.portability.title')}:</strong> {t('yourRights.portability.content')}</li>
            <li><strong>{t('yourRights.restriction.title')}:</strong> {t('yourRights.restriction.content')}</li>
            <li><strong>{t('yourRights.objection.title')}:</strong> {t('yourRights.objection.content')}</li>
            <li><strong>{t('yourRights.withdraw.title')}:</strong> {t('yourRights.withdraw.content')}</li>
          </ul>
        </section>

        {/* Data Retention */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">{t('dataRetention.title')}</h2>
          <p className="text-muted-foreground">{t('dataRetention.content')}</p>
        </section>

        {/* Security */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">{t('security.title')}</h2>
          <p className="text-muted-foreground">{t('security.content')}</p>
        </section>

        {/* Cookies */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">{t('cookies.title')}</h2>
          <p className="text-muted-foreground">{t('cookies.content')}</p>
        </section>

        {/* Children's Privacy */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">{t('children.title')}</h2>
          <p className="text-muted-foreground">{t('children.content')}</p>
        </section>

        {/* Changes */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">{t('changes.title')}</h2>
          <p className="text-muted-foreground">{t('changes.content')}</p>
        </section>

        {/* Contact */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">{t('contact.title')}</h2>
          <p className="text-muted-foreground">{t('contact.content')}</p>
          <div className="bg-muted p-4 rounded-lg">
            <p className="font-medium">AI Knowledge Companion</p>
            <p className="text-sm text-muted-foreground">Email: privacy@aiknowledgecompanion.com</p>
          </div>
        </section>
      </div>
    </div>
  )
}

