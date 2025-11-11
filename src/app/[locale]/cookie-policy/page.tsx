import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'legal.cookiePolicy' })
  
  return {
    title: t('pageTitle'),
    description: t('pageDescription'),
  }
}

export default async function CookiePolicyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'legal.cookiePolicy' })

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

        {/* What are Cookies */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">{t('whatAreCookies.title')}</h2>
          <p className="text-muted-foreground">{t('whatAreCookies.content')}</p>
        </section>

        {/* Cookie Categories */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">{t('categories.title')}</h2>
          
          <div className="space-y-6">
            {/* Necessary Cookies */}
            <div className="border-l-4 border-primary pl-4">
              <h3 className="text-xl font-medium mb-2">{t('categories.necessary.title')}</h3>
              <p className="text-muted-foreground mb-2">{t('categories.necessary.description')}</p>
              <p className="text-sm text-muted-foreground italic">{t('categories.necessary.examples')}</p>
            </div>

            {/* Analytics Cookies */}
            <div className="border-l-4 border-blue-500 pl-4">
              <h3 className="text-xl font-medium mb-2">{t('categories.analytics.title')}</h3>
              <p className="text-muted-foreground mb-2">{t('categories.analytics.description')}</p>
              <p className="text-sm text-muted-foreground italic">{t('categories.analytics.examples')}</p>
            </div>

            {/* Preferences Cookies */}
            <div className="border-l-4 border-purple-500 pl-4">
              <h3 className="text-xl font-medium mb-2">{t('categories.preferences.title')}</h3>
              <p className="text-muted-foreground mb-2">{t('categories.preferences.description')}</p>
              <p className="text-sm text-muted-foreground italic">{t('categories.preferences.examples')}</p>
            </div>

            {/* Marketing Cookies */}
            <div className="border-l-4 border-orange-500 pl-4">
              <h3 className="text-xl font-medium mb-2">{t('categories.marketing.title')}</h3>
              <p className="text-muted-foreground mb-2">{t('categories.marketing.description')}</p>
              <p className="text-sm text-muted-foreground italic">{t('categories.marketing.examples')}</p>
            </div>
          </div>
        </section>

        {/* Third-Party Cookies */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">{t('thirdParty.title')}</h2>
          <p className="text-muted-foreground mb-4">{t('thirdParty.content')}</p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
            <li><strong>Supabase:</strong> {t('thirdParty.supabase')}</li>
            <li><strong>Stripe:</strong> {t('thirdParty.stripe')}</li>
            <li><strong>Vercel:</strong> {t('thirdParty.vercel')}</li>
          </ul>
        </section>

        {/* Managing Cookies */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">{t('managing.title')}</h2>
          <p className="text-muted-foreground mb-4">{t('managing.content')}</p>
          <div className="bg-muted p-4 rounded-lg">
            <p className="font-medium mb-2">{t('managing.banner')}</p>
            <Button variant="outline" size="sm" asChild>
              <Link href="/#cookie-settings">{t('managing.openSettings')}</Link>
            </Button>
          </div>
        </section>

        {/* Browser Settings */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">{t('browser.title')}</h2>
          <p className="text-muted-foreground mb-4">{t('browser.content')}</p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
            <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">Chrome</a></li>
            <li><a href="https://support.mozilla.org/en-US/kb/enhanced-tracking-protection-firefox-desktop" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">Firefox</a></li>
            <li><a href="https://support.apple.com/guide/safari/manage-cookies-and-website-data-sfri11471/mac" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">Safari</a></li>
            <li><a href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">Edge</a></li>
          </ul>
        </section>

        {/* Updates */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">{t('updates.title')}</h2>
          <p className="text-muted-foreground">{t('updates.content')}</p>
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

