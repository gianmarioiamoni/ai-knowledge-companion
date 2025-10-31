'use client'

import { JSX } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FileUpload } from '../ui/file-upload'

interface UploadSectionProps {
  title: string
  description: string
  onUpload: (file: File, title: string, description?: string) => Promise<{ success: boolean; error?: string }>
  loading: boolean
  show: boolean
}

export function UploadSection({
  title,
  description,
  onUpload,
  loading,
  show
}: UploadSectionProps): JSX.Element | null {
  if (!show) return null

  return (
    <Card className="mb-6 sm:mb-8">
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="text-base sm:text-lg">
          {title}
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 pt-0">
        <FileUpload
          onUpload={onUpload}
          loading={loading}
        />
      </CardContent>
    </Card>
  )
}
