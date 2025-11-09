/**
 * FAQ Section Component
 */

import { JSX } from 'react'
import { useTranslations } from 'next-intl'

interface FAQItemProps {
  question: string
  answer: string
}

function FAQItem({ question, answer }: FAQItemProps): JSX.Element {
  return (
    <div className="text-left bg-white dark:bg-gray-800 rounded-lg p-6">
      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
        {question}
      </h3>
      <p className="text-gray-600 dark:text-gray-400">
        {answer}
      </p>
    </div>
  )
}

export function FAQSection(): JSX.Element {
  const t = useTranslations('plans.faq')
  
  const faqs = [
    { question: t('question1'), answer: t('answer1') },
    { question: t('question2'), answer: t('answer2') },
    { question: t('question3'), answer: t('answer3') }
  ]
  
  return (
    <div className="mt-16 text-center">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        {t('title')}
      </h2>
      <div className="max-w-3xl mx-auto space-y-4">
        {faqs.map((faq, index) => (
          <FAQItem key={index} question={faq.question} answer={faq.answer} />
        ))}
      </div>
    </div>
  )
}

