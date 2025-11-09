/**
 * Plans Page Header Component
 */

import { JSX } from 'react'
import { useTranslations } from 'next-intl'

export function PlansHeader(): JSX.Element {
  const t = useTranslations('plans')
  
  return (
    <div className="text-center mb-12">
      <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
        {t('title')}
      </h1>
      <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
        {t('subtitle')}
      </p>
    </div>
  )
}

