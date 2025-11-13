import { useState } from 'react'
import { useRouter } from '@/i18n/navigation'
import { useTranslations, useLocale } from 'next-intl'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAuth } from '@/hooks/use-auth'
import { signupSchema, type SignupFormData } from '@/lib/schemas/auth'

export function useSignupForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const locale = useLocale()
  const t = useTranslations('auth')
  const { signUp, signInWithGoogle } = useAuth()

  const form = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  })

  const clearError = () => setError(null)

  const handleEmailPasswordSignup = async (data: SignupFormData) => {
    try {
      setIsLoading(true)
      clearError()

      const { error: authError, data: authData } = await signUp(data.email, data.password, {
        displayName: data.displayName
      })

      if (authError) {
        setError(authError.message)
        return { success: false, error: authError.message }
      }

      if (authData?.user && !authData?.session) {
        // Email confirmation required
        setSuccess(true)
        return { success: true, requiresConfirmation: true }
      } else {
        // Auto-login successful
        console.log('Signup auto-login success, redirecting with locale:', locale)
        router.push('/dashboard')
        return { success: true, requiresConfirmation: false }
      }
    } catch (_err) {
      const errorMessage = 'An unexpected error occurred'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignup = async () => {
    try {
      setIsLoading(true)
      clearError()

      const { error } = await signInWithGoogle()
      
      if (error) {
        setError(error.message)
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (_err) {
      const errorMessage = 'An unexpected error occurred'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setIsLoading(false)
    }
  }

  const resetSuccess = () => setSuccess(false)

  return {
    // State
    isLoading,
    error,
    success,
    
    // Form
    form,
    
    // Actions
    handleEmailPasswordSignup,
    handleGoogleSignup,
    clearError,
    resetSuccess,
    
    // Translations
    t,
  }
}
