/**
 * Support Options Data Module
 * Responsible for preparing support options data
 */

interface SupportOptionsData {
  title: string
  description: string
  fullManual: {
    title: string
    description: string
    url: string
  }
  contactSupport: {
    title: string
    description: string
  }
}

interface TranslationFunction {
  (key: string): string
}

/**
 * Builds GitHub User Manual URL based on locale
 * @param locale - Current locale (e.g., 'en', 'it')
 * @returns Full GitHub URL to the user manual
 */
export function buildUserManualUrl(locale: string): string {
  return `https://github.com/gianmarioiamoni/ai-knowledge-companion/blob/main/docs/user/USER_MANUAL.${locale}.md`
}

/**
 * Builds support options data from translations
 * @param t - Translation function
 * @param locale - Current locale
 * @returns Support options configuration
 */
export function buildSupportOptionsData(
  t: TranslationFunction,
  locale: string
): SupportOptionsData {
  return {
    title: t('support.title'),
    description: t('support.description'),
    fullManual: {
      title: t('support.fullManual'),
      description: t('support.fullManualDesc'),
      url: buildUserManualUrl(locale)
    },
    contactSupport: {
      title: t('support.contactSupport'),
      description: t('support.contactSupportDesc')
    }
  }
}

