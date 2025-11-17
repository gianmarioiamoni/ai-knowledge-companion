import { JSX } from 'react'

interface FaqQuestionProps {
  question: string
  answer: string
}

/**
 * FAQ Question Component
 * Displays a single Q&A pair
 */
export function FaqQuestion({ question, answer }: FaqQuestionProps): JSX.Element {
  return (
    <div>
      <h4 className="font-semibold mb-1">{question}</h4>
      <p className="text-sm text-muted-foreground">{answer}</p>
    </div>
  )
}

