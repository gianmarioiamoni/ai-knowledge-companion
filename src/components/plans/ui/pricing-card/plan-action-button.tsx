/**
 * Plan Action Button Component
 */

import { JSX } from 'react'
import { Button } from '@/components/ui/button'
import { CardFooter } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'

interface PlanActionButtonProps {
  isCurrentPlan: boolean
  isMostPopular: boolean
  isSelected: boolean
  loading: boolean
  onSelect: () => void
  t: any
}

export function PlanActionButton({ 
  isCurrentPlan, 
  isMostPopular, 
  isSelected,
  loading, 
  onSelect, 
  t 
}: PlanActionButtonProps): JSX.Element {
  return (
    <CardFooter>
      <Button
        className="w-full"
        size="lg"
        onClick={onSelect}
        disabled={isCurrentPlan || loading}
        variant={isSelected ? 'default' : 'outline'}
      >
        {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
        {isCurrentPlan
          ? t('currentPlan')
          : loading
          ? t('processing')
          : t('selectPlan')
        }
      </Button>
    </CardFooter>
  )
}

