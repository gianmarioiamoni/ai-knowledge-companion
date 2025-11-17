/**
 * Quick Start Data Module
 * Responsible for preparing Quick Start steps data
 */

interface QuickStartStep {
  title: string
  description: string
}

interface TranslationFunction {
  (key: string): string
}

/**
 * Builds Quick Start steps from translations
 * @param t - Translation function
 * @returns Array of Quick Start steps
 */
export function buildQuickStartSteps(t: TranslationFunction): QuickStartStep[] {
  const steps: QuickStartStep[] = []
  
  for (let i = 1; i <= 4; i++) {
    steps.push({
      title: t(`quickStart.step${i}.title`),
      description: t(`quickStart.step${i}.description`)
    })
  }
  
  return steps
}

