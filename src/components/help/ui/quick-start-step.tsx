import { JSX } from 'react'

interface QuickStartStepProps {
  stepNumber: number
  title: string
  description: string
}

/**
 * Quick Start Step Component
 * Displays a single numbered step with title and description
 */
export function QuickStartStep({ stepNumber, title, description }: QuickStartStepProps): JSX.Element {
  return (
    <div className="space-y-2">
      <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold mb-3">
        {stepNumber}
      </div>
      <h3 className="font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  )
}

