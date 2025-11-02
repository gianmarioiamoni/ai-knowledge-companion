'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Lock, Eye, EyeOff } from 'lucide-react'
import { useTranslations } from 'next-intl'
import type { JSX } from 'react'

interface PasswordChangeProps {
  onChangePassword: (newPassword: string) => Promise<void>
  changing?: boolean
}

export function PasswordChange({ onChangePassword, changing = false }: PasswordChangeProps): JSX.Element {
  const t = useTranslations('profile')
  const [formData, setFormData] = useState({
    new_password: '',
    confirm_password: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validation
    if (formData.new_password.length < 8) {
      setError(t('password.tooShort'))
      return
    }

    if (formData.new_password !== formData.confirm_password) {
      setError(t('password.noMatch'))
      return
    }

    await onChangePassword(formData.new_password)
    
    // Reset form
    setFormData({
      new_password: '',
      confirm_password: '',
    })
  }

  return (
    <Card>
      <CardHeader className="p-4 sm:p-6">
        <div className="flex items-center space-x-2">
          <Lock className="h-5 w-5 text-orange-600 flex-shrink-0" />
          <div className="min-w-0">
            <CardTitle className="text-base sm:text-lg truncate">{t('password.title')}</CardTitle>
            <CardDescription className="text-xs sm:text-sm line-clamp-1">
              {t('password.description')}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-4 sm:p-6 pt-0">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* New Password */}
          <div className="space-y-2">
            <Label htmlFor="new_password" className="text-xs sm:text-sm">
              {t('password.newPassword')}
            </Label>
            <div className="relative">
              <Input
                id="new_password"
                type={showPassword ? 'text' : 'password'}
                value={formData.new_password}
                onChange={(e) => setFormData({ ...formData, new_password: e.target.value })}
                placeholder={t('password.newPasswordPlaceholder')}
                className="text-xs sm:text-sm pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <Label htmlFor="confirm_password" className="text-xs sm:text-sm">
              {t('password.confirmPassword')}
            </Label>
            <div className="relative">
              <Input
                id="confirm_password"
                type={showConfirm ? 'text' : 'password'}
                value={formData.confirm_password}
                onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })}
                placeholder={t('password.confirmPasswordPlaceholder')}
                className="text-xs sm:text-sm pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showConfirm ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="text-xs sm:text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-2 sm:p-3 rounded-md">
              {error}
            </div>
          )}

          {/* Change Button */}
          <Button
            type="submit"
            disabled={!formData.new_password || !formData.confirm_password || changing}
            className="w-full sm:w-auto text-xs sm:text-sm"
          >
            <Lock className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            {changing ? t('password.changing') : t('password.change')}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

