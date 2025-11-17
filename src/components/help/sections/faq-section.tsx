import { JSX } from 'react'
import { FaqCategoryCard } from '../ui/faq-category-card'
import { FaqQuestion } from '../ui/faq-question'

interface FaqCategory {
  title: string
  questions: Array<{
    question: string
    answer: string
  }>
}

interface FaqSectionProps {
  title: string
  categories: FaqCategory[]
}

/**
 * FAQ Section
 * Displays FAQ categories in a responsive grid
 */
export function FaqSection({ title, categories }: FaqSectionProps): JSX.Element {
  return (
    <div className="mb-12">
      <h2 className="text-3xl font-bold mb-6">{title}</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {categories.map((category, categoryIndex) => (
          <FaqCategoryCard key={categoryIndex} title={category.title}>
            {category.questions.map((qa, qaIndex) => (
              <FaqQuestion 
                key={qaIndex}
                question={qa.question}
                answer={qa.answer}
              />
            ))}
          </FaqCategoryCard>
        ))}
      </div>
    </div>
  )
}

