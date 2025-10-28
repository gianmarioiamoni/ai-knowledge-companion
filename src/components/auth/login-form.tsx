'use client'

import { JSX } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useLoginForm } from '@/hooks/use-login-form'
import { 
  FormField, 
  FormDivider, 
  GoogleButton, 
  ErrorMessage, 
  AuthLink 
} from './ui'

export function LoginForm(): JSX.Element {
  const {
    isLoading,
    error,
    form,
    handleEmailPasswordLogin,
    handleMagicLinkLogin,
    handleGoogleLogin,
    t,
  } = useLoginForm()

  const { register, handleSubmit, formState: { errors } } = form

  const onSubmit = async (data: any) => {
    await handleEmailPasswordLogin(data)
  }

  const handleMagicLink = async () => {
    const email = (document.getElementById('email') as HTMLInputElement)?.value
    await handleMagicLinkLogin(email)
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">
          {t('login')}
        </CardTitle>
        <CardDescription className="text-center">
          {t('loginWithEmail')}
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
            id="password"
            type="password"
            label={t('password')}
            disabled={isLoading}
            error={errors.password?.message}
            register={register('password')}
          />

          <ErrorMessage error={error} />

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? t('loading') : t('login')}
          </Button>

          <FormDivider />

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleMagicLink}
            disabled={isLoading}
          >
            {t('magicLink')}
          </Button>

          <GoogleButton
            onClick={handleGoogleLogin}
            disabled={isLoading}
          />
        </form>

        <div className="mt-4 text-center text-sm">
          {t('dontHaveAccount')}{' '}
          <AuthLink href="/auth/signup">
            {t('signup')}
          </AuthLink>
        </div>
      </CardContent>
    </Card>
  )
}
