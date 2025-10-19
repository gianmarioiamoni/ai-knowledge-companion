import { JSX } from 'react'
import { render, screen } from '@testing-library/react'

// Simple test component for demonstration
function SimpleButton({ children }: { children: React.ReactNode }): JSX.Element {
  return <button>{children}</button>
}

describe('Jest Configuration', () => {
  it('should render a simple component', () => {
    render(<SimpleButton>Click me</SimpleButton>)

    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('should handle basic assertions', () => {
    expect(1 + 1).toBe(2)
    expect('hello').toMatch(/ell/)
    expect([1, 2, 3]).toHaveLength(3)
  })

  it('should work with async operations', async () => {
    const promise = Promise.resolve('success')
    await expect(promise).resolves.toBe('success')
  })

  it('should mock functions correctly', () => {
    const mockFn = jest.fn()
    mockFn('test')

    expect(mockFn).toHaveBeenCalledWith('test')
    expect(mockFn).toHaveBeenCalledTimes(1)
  })
})
