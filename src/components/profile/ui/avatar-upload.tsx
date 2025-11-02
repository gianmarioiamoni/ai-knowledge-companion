'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Camera, Upload } from 'lucide-react'
import { useTranslations } from 'next-intl'
import type { JSX } from 'react'

interface AvatarUploadProps {
  currentUrl?: string
  userName?: string
  onUpload: (file: File) => Promise<void>
  uploading?: boolean
}

export function AvatarUpload({ 
  currentUrl, 
  userName, 
  onUpload,
  uploading = false 
}: AvatarUploadProps): JSX.Element {
  const t = useTranslations('profile')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | undefined>(currentUrl)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert(t('avatar.invalidType'))
      return
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert(t('avatar.tooLarge'))
      return
    }

    // Show preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreview(reader.result as string)
    }
    reader.readAsDataURL(file)

    // Upload
    await onUpload(file)
  }

  const getInitials = (name?: string) => {
    if (!name) return 'U'
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="flex flex-col items-center space-y-3 sm:space-y-4">
      <div className="relative group">
        <Avatar className="h-24 w-24 sm:h-32 sm:w-32 border-4 border-white dark:border-gray-800 shadow-lg">
          <AvatarImage src={preview} alt={userName} />
          <AvatarFallback className="text-xl sm:text-2xl bg-gradient-to-br from-blue-500 to-purple-600 text-white">
            {getInitials(userName)}
          </AvatarFallback>
        </Avatar>
        
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer disabled:cursor-not-allowed"
          aria-label={t('avatar.change')}
        >
          <Camera className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      <div className="text-center space-y-1">
        <Label className="text-xs sm:text-sm font-medium">{t('avatar.label')}</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="text-xs sm:text-sm"
        >
          <Upload className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
          {uploading ? t('avatar.uploading') : t('avatar.upload')}
        </Button>
        <p className="text-[10px] sm:text-xs text-muted-foreground">
          {t('avatar.hint')}
        </p>
      </div>
    </div>
  )
}

