/**
 * Marketplace Error State
 */

'use client'

import { JSX } from 'react'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'

interface MarketplaceErrorProps {
  error: string
  onRetry: () => void
}

export function MarketplaceError({ error, onRetry }: MarketplaceErrorProps): JSX.Element {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <AlertCircle className="h-16 w-16 text-destructive mb-4" />
      <h3 className="text-xl font-semibold mb-2">Something went wrong</h3>
      <p className="text-muted-foreground mb-6 max-w-md">{error}</p>
      <Button onClick={onRetry}>
        Try Again
      </Button>
    </div>
  )
}

