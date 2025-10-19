'use client'

import { JSX } from 'react'
import { Card, CardContent } from '@/components/ui/card'

interface ErrorDisplayProps {
  error: string | null
}

export function ErrorDisplay({ error }: ErrorDisplayProps): JSX.Element | null {
  if (!error) return null

  return (
    <Card className="mb-8 border-red-200 bg-red-50 dark:bg-red-950">
      <CardContent className="p-4">
        <p className="text-red-600 dark:text-red-400 text-sm">
          {error}
        </p>
      </CardContent>
    </Card>
  )
}
