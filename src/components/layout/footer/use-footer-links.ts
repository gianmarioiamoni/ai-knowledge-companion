/**
 * Footer Links Hook
 * Provides organized footer links based on locale
 */

import { useTranslations } from 'next-intl'

interface FooterLink {
  label: string
  href: string
  isExternal?: boolean
}

interface FooterLinks {
  product: FooterLink[]
  support: FooterLink[]
  legal: FooterLink[]
}

export function useFooterLinks(locale: string): FooterLinks {
  const t = useTranslations('footer')

  return {
    product: [
      { label: t('product.dashboard'), href: `/${locale}/dashboard` },
      { label: t('product.tutors'), href: `/${locale}/tutors` },
      { label: t('product.documents'), href: `/${locale}/documents` },
      { label: t('product.plans'), href: `/${locale}/plans` },
    ],
    support: [
      { label: t('support.profile'), href: `/${locale}/profile` },
      { label: t('support.contact'), href: 'mailto:support@aiknowledgecompanion.com', isExternal: true },
    ],
    legal: [
      { label: t('legal.privacy'), href: `/${locale}/privacy-policy` },
      { label: t('legal.terms'), href: `/${locale}/terms-of-service` },
      { label: t('legal.cookies'), href: `/${locale}/cookie-policy` },
    ],
  }
}

