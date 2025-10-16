import { render, screen, fireEvent } from '@testing-library/react'
import { SimpleLanguageSwitcher } from '@/components/simple-language-switcher'

// Mock the navigation hooks
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
  usePathname: () => '/en/dashboard',
}))

describe('SimpleLanguageSwitcher', () => {
  it('renders the language switcher button', () => {
    render(<SimpleLanguageSwitcher currentLocale="en" />)
    
    const button = screen.getByRole('button')
    expect(button).toBeInTheDocument()
    expect(button).toHaveTextContent('🇺🇸 English')
  })

  it('opens dropdown when clicked', () => {
    render(<SimpleLanguageSwitcher currentLocale="en" />)
    
    const button = screen.getByRole('button')
    fireEvent.click(button)
    
    // Check if dropdown items are visible
    expect(screen.getByText('🇺🇸')).toBeInTheDocument()
    expect(screen.getByText('🇮🇹')).toBeInTheDocument()
  })

  it('shows both language options', () => {
    render(<SimpleLanguageSwitcher currentLocale="en" />)
    
    const button = screen.getByRole('button')
    fireEvent.click(button)
    
    expect(screen.getByText('English')).toBeInTheDocument()
    expect(screen.getByText('Italiano')).toBeInTheDocument()
  })

  it('has proper accessibility attributes', () => {
    render(<SimpleLanguageSwitcher currentLocale="en" />)
    
    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('type', 'button')
  })
})
