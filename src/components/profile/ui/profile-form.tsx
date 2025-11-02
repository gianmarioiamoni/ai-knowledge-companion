'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { User, Save } from 'lucide-react'
import { useTranslations } from 'next-intl'
import type { Profile, ProfileUpdate } from '@/types/profile'
import type { JSX } from 'react'

interface ProfileFormProps {
  profile: Profile
  onSave: (updates: ProfileUpdate) => Promise<void>
  saving?: boolean
}

export function ProfileForm({ profile, onSave, saving = false }: ProfileFormProps): JSX.Element {
  const t = useTranslations('profile')
  const [formData, setFormData] = useState({
    full_name: profile.full_name || '',
    bio: profile.bio || '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSave(formData)
  }

  const hasChanges = 
    formData.full_name !== (profile.full_name || '') ||
    formData.bio !== (profile.bio || '')

  return (
    <Card>
      <CardHeader className="p-4 sm:p-6">
        <div className="flex items-center space-x-2">
          <User className="h-5 w-5 text-blue-600 flex-shrink-0" />
          <div className="min-w-0">
            <CardTitle className="text-base sm:text-lg truncate">{t('form.title')}</CardTitle>
            <CardDescription className="text-xs sm:text-sm line-clamp-1">
              {t('form.description')}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-4 sm:p-6 pt-0">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email (read-only) */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-xs sm:text-sm">
              {t('form.email')}
            </Label>
            <Input
              id="email"
              type="email"
              value={profile.email || ''}
              disabled
              className="text-xs sm:text-sm bg-muted"
            />
            <p className="text-[10px] sm:text-xs text-muted-foreground">
              {t('form.emailHint')}
            </p>
          </div>

          {/* Full Name */}
          <div className="space-y-2">
            <Label htmlFor="full_name" className="text-xs sm:text-sm">
              {t('form.fullName')}
            </Label>
            <Input
              id="full_name"
              type="text"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              placeholder={t('form.fullNamePlaceholder')}
              maxLength={100}
              className="text-xs sm:text-sm"
            />
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <Label htmlFor="bio" className="text-xs sm:text-sm">
              {t('form.bio')}
            </Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder={t('form.bioPlaceholder')}
              rows={3}
              maxLength={500}
              className="text-xs sm:text-sm resize-none"
            />
            <p className="text-[10px] sm:text-xs text-muted-foreground text-right">
              {formData.bio.length}/500
            </p>
          </div>

          {/* Save Button */}
          <Button
            type="submit"
            disabled={!hasChanges || saving}
            className="w-full sm:w-auto text-xs sm:text-sm"
          >
            <Save className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            {saving ? t('form.saving') : t('form.save')}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

