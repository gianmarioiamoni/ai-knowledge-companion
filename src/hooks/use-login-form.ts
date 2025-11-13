import { useState } from 'react'
import { useRouter } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAuth } from '@/hooks/use-auth'
import { loginSchema, type LoginFormData } from '@/lib/schemas/auth'
import { createClient } from '@/lib/supabase/client'

export function useLoginForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
    const t = useTranslations('auth')
  const { signIn, signInWithGoogle, signInWithMagicLink } = useAuth()

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const clearError = () => setError(null)

  const handleEmailPasswordLogin = async (data: LoginFormData) => {
    try {
      setIsLoading(true)
      clearError()

      const { error: authError } = await signIn(data.email, data.password)

      if (authError) {
        setError(authError.message)
        return { success: false, error: authError.message }
      }

      // Check user role to determine redirect destination
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()
        
        // Redirect admin/super_admin to admin dashboard
        if (profile && (profile.role === 'admin' || profile.role === 'super_admin')) {
          console.log('Admin login, redirecting to admin dashboard')
          router.push('/admin/dashboard')
        } else {
          console.log('User login, redirecting to user dashboard')
          router.push('/dashboard')
        }
      } else {
        router.push('/dashboard')
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

  const handleMagicLinkLogin = async (email: string) => {
    if (!email) {
      setError('Please enter your email first')
      return { success: false, error: 'Please enter your email first' }
    }

    try {
      setIsLoading(true)
      clearError()

      const { error: authError } = await signInWithMagicLink(email)

      if (authError) {
        setError(authError.message)
        return { success: false, error: authError.message }
      }

      setError(t('checkEmail'))
      return { success: true }
    } catch (_err) {
      const errorMessage = 'An unexpected error occurred'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
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

  return {
    // State
    isLoading,
    error,
    
    // Form
    form,
    
    // Actions
    handleEmailPasswordLogin,
    handleMagicLinkLogin,
    handleGoogleLogin,
    clearError,
    
    // Translations
    t,
  }
}
