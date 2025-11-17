import { JSX } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { QuickStartStep } from '../ui/quick-start-step'

interface QuickStartSectionProps {
  title: string
  steps: Array<{
    title: string
    description: string
  }>
}

/**
 * Quick Start Section
 * Displays a 4-step guide for getting started
 */
export function QuickStartSection({ title, steps }: QuickStartSectionProps): JSX.Element {
  return (
    <Card className="mb-12">
      <CardHeader>
        <CardTitle className="text-2xl">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <QuickStartStep
              key={index}
              stepNumber={index + 1}
              title={step.title}
              description={step.description}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

