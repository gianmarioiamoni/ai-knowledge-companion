import { createLocalizedPathnamesNavigation } from 'next-intl/navigation'

export const locales = ['en', 'it'] as const
export type Locale = (typeof locales)[number]

// The `pathnames` object holds pairs of internal and
// external paths. Based on the locale, the external
// paths are rewritten to the shared, internal ones.
export const pathnames = {
  '/': '/',
  '/dashboard': {
    en: '/dashboard',
    it: '/dashboard'
  },
  '/tutors': {
    en: '/tutors',
    it: '/tutor'
  },
  '/documents': {
    en: '/documents',
    it: '/documenti'
  },
  '/marketplace': {
    en: '/marketplace',
    it: '/marketplace'
  },
  '/settings': {
    en: '/settings',
    it: '/impostazioni'
  },
  '/auth/login': {
    en: '/auth/login',
    it: '/auth/accedi'
  },
  '/auth/signup': {
    en: '/auth/signup',
    it: '/auth/registrati'
  }
} as const

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createLocalizedPathnamesNavigation({ locales, pathnames })

export const defaultLocale: Locale = 'en'
