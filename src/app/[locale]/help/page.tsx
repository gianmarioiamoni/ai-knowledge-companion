import { JSX } from 'react'
import { getTranslations } from 'next-intl/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BookOpen, Mail, MessageCircle, HelpCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Link } from '@/i18n/navigation'

interface HelpPageProps {
  params: Promise<{ locale: string }>
}

export default async function HelpPage({ params }: HelpPageProps): Promise<JSX.Element> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'help' })

  // User Manual URL based on locale
  const userManualUrl = `https://github.com/gianmarioiamoni/ai-knowledge-companion/blob/main/docs/user/USER_MANUAL.${locale}.md`

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">{t('title')}</h1>
        <p className="text-xl text-muted-foreground">{t('subtitle')}</p>
      </div>

      {/* Quick Start Guide */}
      <Card className="mb-12">
        <CardHeader>
          <CardTitle className="text-2xl">{t('quickStart.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Step 1 */}
            <div className="space-y-2">
              <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold mb-3">
                1
              </div>
              <h3 className="font-semibold">{t('quickStart.step1.title')}</h3>
              <p className="text-sm text-muted-foreground">{t('quickStart.step1.description')}</p>
            </div>

            {/* Step 2 */}
            <div className="space-y-2">
              <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold mb-3">
                2
              </div>
              <h3 className="font-semibold">{t('quickStart.step2.title')}</h3>
              <p className="text-sm text-muted-foreground">{t('quickStart.step2.description')}</p>
            </div>

            {/* Step 3 */}
            <div className="space-y-2">
              <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold mb-3">
                3
              </div>
              <h3 className="font-semibold">{t('quickStart.step3.title')}</h3>
              <p className="text-sm text-muted-foreground">{t('quickStart.step3.description')}</p>
            </div>

            {/* Step 4 */}
            <div className="space-y-2">
              <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold mb-3">
                4
              </div>
              <h3 className="font-semibold">{t('quickStart.step4.title')}</h3>
              <p className="text-sm text-muted-foreground">{t('quickStart.step4.description')}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* FAQ Sections */}
      <div className="mb-12">
        <h2 className="text-3xl font-bold mb-6">{t('faq.title')}</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Account FAQ */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5" />
                {t('faq.account.title')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-1">{t('faq.account.q1.question')}</h4>
                <p className="text-sm text-muted-foreground">{t('faq.account.q1.answer')}</p>
              </div>
              <div>
                <h4 className="font-semibold mb-1">{t('faq.account.q2.question')}</h4>
                <p className="text-sm text-muted-foreground">{t('faq.account.q2.answer')}</p>
              </div>
              <div>
                <h4 className="font-semibold mb-1">{t('faq.account.q3.question')}</h4>
                <p className="text-sm text-muted-foreground">{t('faq.account.q3.answer')}</p>
              </div>
            </CardContent>
          </Card>

          {/* Plans FAQ */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5" />
                {t('faq.plans.title')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-1">{t('faq.plans.q1.question')}</h4>
                <p className="text-sm text-muted-foreground">{t('faq.plans.q1.answer')}</p>
              </div>
              <div>
                <h4 className="font-semibold mb-1">{t('faq.plans.q2.question')}</h4>
                <p className="text-sm text-muted-foreground">{t('faq.plans.q2.answer')}</p>
              </div>
              <div>
                <h4 className="font-semibold mb-1">{t('faq.plans.q3.question')}</h4>
                <p className="text-sm text-muted-foreground">{t('faq.plans.q3.answer')}</p>
              </div>
            </CardContent>
          </Card>

          {/* Usage FAQ */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5" />
                {t('faq.usage.title')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-1">{t('faq.usage.q1.question')}</h4>
                <p className="text-sm text-muted-foreground">{t('faq.usage.q1.answer')}</p>
              </div>
              <div>
                <h4 className="font-semibold mb-1">{t('faq.usage.q2.question')}</h4>
                <p className="text-sm text-muted-foreground">{t('faq.usage.q2.answer')}</p>
              </div>
              <div>
                <h4 className="font-semibold mb-1">{t('faq.usage.q3.question')}</h4>
                <p className="text-sm text-muted-foreground">{t('faq.usage.q3.answer')}</p>
              </div>
            </CardContent>
          </Card>

          {/* Tutors FAQ */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5" />
                {t('faq.tutors.title')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-1">{t('faq.tutors.q1.question')}</h4>
                <p className="text-sm text-muted-foreground">{t('faq.tutors.q1.answer')}</p>
              </div>
              <div>
                <h4 className="font-semibold mb-1">{t('faq.tutors.q2.question')}</h4>
                <p className="text-sm text-muted-foreground">{t('faq.tutors.q2.answer')}</p>
              </div>
              <div>
                <h4 className="font-semibold mb-1">{t('faq.tutors.q3.question')}</h4>
                <p className="text-sm text-muted-foreground">{t('faq.tutors.q3.answer')}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Support Options */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{t('support.title')}</CardTitle>
          <CardDescription>{t('support.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Full Manual */}
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <BookOpen className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">{t('support.fullManual')}</h3>
                <p className="text-sm text-muted-foreground mb-3">{t('support.fullManualDesc')}</p>
              </div>
              <a href={userManualUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm">
                  <BookOpen className="mr-2 h-4 w-4" />
                  {t('support.fullManual')}
                </Button>
              </a>
            </div>

            {/* Contact Support */}
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Mail className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">{t('support.contactSupport')}</h3>
                <p className="text-sm text-muted-foreground mb-3">{t('support.contactSupportDesc')}</p>
              </div>
              <Link href="/contact">
                <Button variant="outline" size="sm">
                  <Mail className="mr-2 h-4 w-4" />
                  {t('support.contactSupport')}
                </Button>
              </Link>
            </div>

            {/* Community */}
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <MessageCircle className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">{t('support.community')}</h3>
                <p className="text-sm text-muted-foreground mb-3">{t('support.communityDesc')}</p>
              </div>
              <a href="https://github.com/gianmarioiamoni/ai-knowledge-companion/discussions" target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm">
                  <MessageCircle className="mr-2 h-4 w-4" />
                  {t('support.community')}
                </Button>
              </a>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

