'use client'

import { JSX, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { GoogleIcon } from '@/components/ui/google-icon'
import { useAuth } from '@/hooks/use-auth'
import { Link } from '@/lib/navigation'

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type LoginFormData = z.infer<typeof loginSchema>

export function LoginForm(): JSX.Element {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const t = useTranslations('auth')
  const { signIn, signInWithGoogle, signInWithMagicLink } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsLoading(true)
      setError(null)

      const { error: authError } = await signIn(data.email, data.password)

      if (authError) {
        setError(authError.message)
        return
      }

      router.push('/dashboard')
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleMagicLink = async () => {
    const email = (document.getElementById('email') as HTMLInputElement)?.value

    if (!email) {
      setError('Please enter your email first')
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      const { error: authError } = await signInWithMagicLink(email)

      if (authError) {
        setError(authError.message)
        return
      }

      setError(t('checkEmail'))
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
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
          <div className="space-y-2">
            <Label htmlFor="email">{t('email')}</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              {...register('email')}
              disabled={isLoading}
            />
            {errors.email && (
              <p className="text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">{t('password')}</Label>
            <Input
              id="password"
              type="password"
              {...register('password')}
              disabled={isLoading}
            />
            {errors.password && (
              <p className="text-sm text-red-600">{errors.password.message}</p>
            )}
          </div>

          {error && (
            <div className="text-sm text-red-600 text-center">{error}</div>
          )}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? t('loading') : t('login')}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or
              </span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleMagicLink}
            disabled={isLoading}
          >
            {t('magicLink')}
          </Button>

          <Button
            type="button"
            variant="outline"
            className="w-full bg-white hover:bg-gray-50 text-gray-700 border-gray-300 font-medium"
            onClick={async () => {
              setIsLoading(true)
              const { error } = await signInWithGoogle()
              if (error) {
                setError(error.message)
              }
              setIsLoading(false)
            }}
            disabled={isLoading}
          >
            <GoogleIcon className="w-5 h-5 mr-3" />
            Continue with Google
          </Button>
        </form>

        <div className="mt-4 text-center text-sm">
          {t('dontHaveAccount')}{' '}
          <Link href="/auth/signup" className="underline">
            {t('signup')}
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
