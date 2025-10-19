import { JSX } from 'react'
import { SignupForm } from '@/components/auth/signup-form'
import { useTranslations } from 'next-intl'

export default function SignupPage(): JSX.Element {
  const t = useTranslations('auth')

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            AI Knowledge Companion
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {t('signupWithEmail')}
          </p>
        </div>
        <SignupForm />
      </div>
    </div>
  )
}
