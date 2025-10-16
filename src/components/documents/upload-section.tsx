'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FileUpload } from './file-upload'

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
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>
          {title}
        </CardTitle>
        <CardDescription>
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <FileUpload
          onUpload={onUpload}
          loading={loading}
        />
      </CardContent>
    </Card>
  )
}
