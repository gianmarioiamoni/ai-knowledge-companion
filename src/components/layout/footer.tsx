'use client'

import { JSX } from 'react'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import { FooterBrand, FooterLinkSection, FooterBottomBar, useFooterLinks } from './footer/'

export function Footer(): JSX.Element {
  const t = useTranslations('footer')
  const params = useParams()
  const locale = params.locale as string

  const currentYear = new Date().getFullYear()
  const links = useFooterLinks(locale)

  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 md:px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <FooterBrand />

          <FooterLinkSection 
            title={t('product.title')} 
            links={links.product} 
          />

          <FooterLinkSection 
            title={t('support.title')} 
            links={links.support} 
          />

          <FooterLinkSection 
            title={t('legal.title')} 
            links={links.legal} 
          />
        </div>

        <FooterBottomBar currentYear={currentYear} />
      </div>
    </footer>
  )
}

