/**
 * @deprecated Use @/components/error/ErrorDisplay instead
 * This component is kept for backward compatibility
 */

'use client'

import { JSX } from 'react'
import { ErrorCard } from '@/components/error'

interface ErrorDisplayProps {
  error: string | null
}

export function ErrorDisplay({ error }: ErrorDisplayProps): JSX.Element | null {
  if (!error) return null

  return <ErrorCard message={error} severity="error" showIcon />
}
