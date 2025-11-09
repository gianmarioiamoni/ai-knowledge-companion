'use client'

import { JSX } from 'react'
import { useProfile } from '@/hooks/use-profile'
import { useTranslations } from 'next-intl'
import { AvatarUpload, ProfileForm, PasswordChange, DeleteAccount } from '../ui'
import { SubscriptionCard } from '@/components/plans/ui/subscription-card'
import { Card, CardContent } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { AlertCircle } from 'lucide-react'
import { useState } from 'react'

interface ProfilePageClientProps {
  locale: 'en' | 'it'
}

export function ProfilePageClient({ locale }: ProfilePageClientProps): JSX.Element {
  const t = useTranslations('profile')
  const {
    profile,
    loading,
    error,
    updateProfile,
    uploadAvatar,
    changePassword,
    deleteAccount,
  } = useProfile()

  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [changing, setChanging] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const handleAvatarUpload = async (file: File) => {
    setUploading(true)
    setSuccessMessage(null)
    
    const result = await uploadAvatar(file)
    
    setUploading(false)
    
    if (result.success) {
      setSuccessMessage(t('messages.avatarUpdated'))
      setTimeout(() => setSuccessMessage(null), 3000)
    }
  }

  const handleProfileSave = async (updates: any) => {
    setSaving(true)
    setSuccessMessage(null)
    
    const result = await updateProfile(updates)
    
    setSaving(false)
    
    if (result.success) {
      setSuccessMessage(t('messages.profileUpdated'))
      setTimeout(() => setSuccessMessage(null), 3000)
    }
  }

  const handlePasswordChange = async (newPassword: string) => {
    setChanging(true)
    setSuccessMessage(null)
    
    const result = await changePassword(newPassword)
    
    setChanging(false)
    
    if (result.success) {
      setSuccessMessage(t('messages.passwordChanged'))
      setTimeout(() => setSuccessMessage(null), 3000)
    }
  }

  const handleAccountDelete = async (password: string) => {
    setDeleting(true)
    await deleteAccount(password)
    // Note: User will be redirected, so no need to handle state
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  // Error state
  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-4 sm:py-6 lg:py-8">
        <div className="max-w-3xl mx-auto px-3 sm:px-4 lg:px-6">
          <Card className="border-red-200 dark:border-red-900">
            <CardContent className="p-6 sm:p-8">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-red-600 dark:text-red-400 mb-1">
                    {t('error.title')}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {error || t('error.notFound')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-4 sm:py-6 lg:py-8">
      <div className="max-w-3xl mx-auto px-3 sm:px-4 lg:px-6">
        <div className="space-y-4 sm:space-y-6">
          {/* Header */}
          <div className="text-center sm:text-left">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
              {t('title')}
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1 sm:mt-2">
              {t('subtitle')}
            </p>
          </div>

          {/* Success Message */}
          {successMessage && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md p-3 sm:p-4">
              <p className="text-xs sm:text-sm text-green-600 dark:text-green-400">
                {successMessage}
              </p>
            </div>
          )}

          {/* Avatar Section */}
          <Card>
            <CardContent className="p-6 sm:p-8">
              <AvatarUpload
                currentUrl={profile.avatar_url}
                userName={profile.full_name || profile.display_name || profile.email}
                onUpload={handleAvatarUpload}
                uploading={uploading}
              />
            </CardContent>
          </Card>

          {/* Profile Form */}
          <ProfileForm
            profile={profile}
            onSave={handleProfileSave}
            saving={saving}
          />

          {/* Subscription Card */}
          <SubscriptionCard />

          {/* Password Change */}
          <PasswordChange
            onChangePassword={handlePasswordChange}
            changing={changing}
          />

          {/* Delete Account */}
          <DeleteAccount
            onDeleteAccount={handleAccountDelete}
            deleting={deleting}
          />
        </div>
      </div>
    </div>
  )
}

