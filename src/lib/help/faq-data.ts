/**
 * FAQ Data Module
 * Responsible for preparing FAQ categories and questions
 */

interface FaqQuestion {
  question: string
  answer: string
}

interface FaqCategory {
  title: string
  questions: FaqQuestion[]
}

interface TranslationFunction {
  (key: string): string
}

/**
 * FAQ category types
 */
const FAQ_CATEGORIES = ['account', 'plans', 'usage', 'tutors'] as const

/**
 * Number of questions per category
 */
const QUESTIONS_PER_CATEGORY = 3

/**
 * Builds a single FAQ category from translations
 * @param t - Translation function
 * @param category - Category name
 * @returns FAQ category with questions
 */
function buildFaqCategory(t: TranslationFunction, category: string): FaqCategory {
  const questions: FaqQuestion[] = []
  
  for (let i = 1; i <= QUESTIONS_PER_CATEGORY; i++) {
    questions.push({
      question: t(`faq.${category}.q${i}.question`),
      answer: t(`faq.${category}.q${i}.answer`)
    })
  }
  
  return {
    title: t(`faq.${category}.title`),
    questions
  }
}

/**
 * Builds all FAQ categories from translations
 * @param t - Translation function
 * @returns Array of FAQ categories
 */
export function buildFaqCategories(t: TranslationFunction): FaqCategory[] {
  return FAQ_CATEGORIES.map(category => buildFaqCategory(t, category))
}

