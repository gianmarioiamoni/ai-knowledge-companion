/**
 * Plan Header Component - Display plan name and description
 */

import { JSX } from 'react'
import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

interface PlanHeaderProps {
  displayName: string
  description: string | null
}

export function PlanHeader({ displayName, description }: PlanHeaderProps): JSX.Element {
  return (
    <CardHeader className="text-center pb-6">
      <CardTitle className="text-2xl font-bold">{displayName}</CardTitle>
      <CardDescription className="mt-2">{description}</CardDescription>
    </CardHeader>
  )
}

