'use client'

import { JSX } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useSignupForm } from '@/hooks/use-signup-form'
import { 
  FormField, 
  FormDivider, 
  GoogleButton, 
  ErrorMessage, 
  AuthLink,
  SuccessCard 
} from './ui'

export function SignupForm(): JSX.Element {
  const {
    isLoading,
    error,
    success,
    form,
    handleEmailPasswordSignup,
    handleGoogleSignup,
    t,
  } = useSignupForm()

  const { register, handleSubmit, formState: { errors } } = form

  const onSubmit = async (data: any) => {
    await handleEmailPasswordSignup(data)
  }

  if (success) {
    return (
      <SuccessCard
        title={t('success')}
        description={t('checkEmail')}
        message="Please check your email and click the confirmation link to activate your account."
        buttonText={t('login')}
        buttonHref="/auth/login"
      />
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">
          {t('signup')}
        </CardTitle>
        <CardDescription className="text-center">
          {t('signupWithEmail')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            id="email"
            type="email"
            label={t('email')}
            placeholder="name@example.com"
            disabled={isLoading}
            error={errors.email?.message}
            register={register('email')}
          />

          <FormField
            id="displayName"
            type="text"
            label="Display Name (Optional)"
            placeholder="Your name"
            disabled={isLoading}
            error={errors.displayName?.message}
            register={register('displayName')}
          />

          <FormField
            id="password"
            type="password"
            label={t('password')}
            disabled={isLoading}
            error={errors.password?.message}
            register={register('password')}
          />

          <FormField
            id="confirmPassword"
            type="password"
            label={t('confirmPassword')}
            disabled={isLoading}
            error={errors.confirmPassword?.message}
            register={register('confirmPassword')}
          />

          <ErrorMessage error={error} />

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? t('loading') : t('signup')}
          </Button>

          <FormDivider />

          <GoogleButton
            onClick={handleGoogleSignup}
            disabled={isLoading}
          />
        </form>

        <div className="mt-4 text-center text-sm">
          {t('alreadyHaveAccount')}{' '}
          <AuthLink href="/auth/login">
            {t('login')}
          </AuthLink>
        </div>
      </CardContent>
    </Card>
  )
}
