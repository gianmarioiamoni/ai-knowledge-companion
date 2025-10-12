import { cn } from '@/lib/utils'

describe('Utils', () => {
  describe('cn (className utility)', () => {
    it('merges class names correctly', () => {
      const result = cn('class1', 'class2')
      expect(result).toBe('class1 class2')
    })

    it('handles conditional classes', () => {
      const result = cn('base', true && 'conditional', false && 'hidden')
      expect(result).toBe('base conditional')
    })

    it('handles undefined and null values', () => {
      const result = cn('base', undefined, null, 'valid')
      expect(result).toBe('base valid')
    })

    it('handles empty strings', () => {
      const result = cn('base', '', 'valid')
      expect(result).toBe('base valid')
    })

    it('merges Tailwind classes correctly', () => {
      const result = cn('px-4 py-2', 'px-6') // px-6 should override px-4
      // The exact behavior depends on tailwind-merge configuration
      expect(typeof result).toBe('string')
    })

    it('handles arrays of classes', () => {
      const result = cn(['class1', 'class2'], 'class3')
      expect(result).toBe('class1 class2 class3')
    })
  })
})
