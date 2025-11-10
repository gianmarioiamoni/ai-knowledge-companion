'use client'

import { JSX } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'

export function Footer(): JSX.Element {
  const t = useTranslations('footer')
  const params = useParams()
  const locale = params.locale as string

  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 md:px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">AI Knowledge Companion</h3>
            <p className="text-sm text-muted-foreground">
              {t('tagline')}
            </p>
          </div>

          {/* Product Links */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm">{t('product.title')}</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href={`/${locale}/dashboard`} className="text-muted-foreground hover:text-foreground transition-colors">
                  {t('product.dashboard')}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/tutors`} className="text-muted-foreground hover:text-foreground transition-colors">
                  {t('product.tutors')}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/documents`} className="text-muted-foreground hover:text-foreground transition-colors">
                  {t('product.documents')}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/plans`} className="text-muted-foreground hover:text-foreground transition-colors">
                  {t('product.plans')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Support Links */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm">{t('support.title')}</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href={`/${locale}/profile`} className="text-muted-foreground hover:text-foreground transition-colors">
                  {t('support.profile')}
                </Link>
              </li>
              <li>
                <a href="mailto:support@aiknowledgecompanion.com" className="text-muted-foreground hover:text-foreground transition-colors">
                  {t('support.contact')}
                </a>
              </li>
            </ul>
          </div>

          {/* Legal Links */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm">{t('legal.title')}</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href={`/${locale}/privacy-policy`} className="text-muted-foreground hover:text-foreground transition-colors">
                  {t('legal.privacy')}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/terms-of-service`} className="text-muted-foreground hover:text-foreground transition-colors">
                  {t('legal.terms')}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/cookie-policy`} className="text-muted-foreground hover:text-foreground transition-colors">
                  {t('legal.cookies')}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <p>
              © {currentYear} AI Knowledge Companion. {t('rights')}
            </p>
            <p className="text-xs">
              {t('gdprCompliant')}
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}

