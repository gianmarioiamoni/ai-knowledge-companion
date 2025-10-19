'use client'

import { JSX } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LucideIcon } from 'lucide-react'

interface FeatureCardProps {
  icon: LucideIcon
  iconColor: string
  title: string
  description: string
}

export function FeatureCard({
  icon: Icon,
  iconColor,
  title,
  description
}: FeatureCardProps): JSX.Element {
  return (
    <Card className="text-center">
      <CardHeader>
        <Icon className={`h-12 w-12 mx-auto ${iconColor} mb-4`} />
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription>
          {description}
        </CardDescription>
      </CardContent>
    </Card>
  )
}
