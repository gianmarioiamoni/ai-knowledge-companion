import { render, screen, fireEvent } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'
import { LanguageSwitcher } from '@/components/language-switcher'

const messages = {
  // Empty messages object for testing
}

function renderWithIntl(component: React.ReactElement) {
  return render(
    <NextIntlClientProvider locale="en" messages={messages}>
      {component}
    </NextIntlClientProvider>
  )
}

// Mock the navigation hooks
jest.mock('next-intl/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
  usePathname: () => '/en/dashboard',
}))

jest.mock('next-intl', () => ({
  useLocale: () => 'en',
}))

describe('LanguageSwitcher', () => {
  it('renders the language switcher button', () => {
    renderWithIntl(<LanguageSwitcher />)
    
    const button = screen.getByRole('button')
    expect(button).toBeInTheDocument()
    expect(button).toHaveTextContent('🇺🇸 English')
  })

  it('opens dropdown when clicked', () => {
    renderWithIntl(<LanguageSwitcher />)
    
    const button = screen.getByRole('button')
    fireEvent.click(button)
    
    // Check if dropdown items are visible
    expect(screen.getByText('🇺🇸')).toBeInTheDocument()
    expect(screen.getByText('🇮🇹')).toBeInTheDocument()
  })

  it('shows both language options', () => {
    renderWithIntl(<LanguageSwitcher />)
    
    const button = screen.getByRole('button')
    fireEvent.click(button)
    
    expect(screen.getByText('English')).toBeInTheDocument()
    expect(screen.getByText('Italiano')).toBeInTheDocument()
  })

  it('has proper accessibility attributes', () => {
    renderWithIntl(<LanguageSwitcher />)
    
    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('type', 'button')
  })
})
