import { render, screen } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'
import LandingPage from '@/app/[locale]/page'

// Mock messages for testing
const messages = {
  landing: {
    title: 'AI Knowledge Companion',
    subtitle: 'Build your personal AI tutor for any subject',
    description: 'Upload documents, create custom AI tutors, and get personalized learning assistance powered by your own knowledge base.',
    features: {
      upload: {
        title: 'Upload Your Materials',
        description: 'Upload PDFs, documents, and links to build your knowledge base'
      },
      customize: {
        title: 'Customize Your Tutor',
        description: 'Configure tone, language, and teaching style to match your preferences'
      },
      learn: {
        title: 'Learn Interactively',
        description: 'Ask questions and get answers based on your uploaded materials'
      },
      share: {
        title: 'Share & Discover',
        description: 'Share your tutors publicly or discover others in the marketplace'
      }
    },
    cta: {
      primary: 'Get Started for Free',
      secondary: 'Learn More'
    }
  }
}

// Helper function to render components with i18n context
function renderWithIntl(component: React.ReactElement) {
  return render(
    <NextIntlClientProvider locale="en" messages={messages}>
      {component}
    </NextIntlClientProvider>
  )
}

describe('LandingPage', () => {
  it('renders the main title', () => {
    renderWithIntl(<LandingPage />)
    
    expect(screen.getByText('AI Knowledge Companion')).toBeInTheDocument()
  })

  it('renders the subtitle', () => {
    renderWithIntl(<LandingPage />)
    
    expect(screen.getByText('Build your personal AI tutor for any subject')).toBeInTheDocument()
  })

  it('renders all feature cards', () => {
    renderWithIntl(<LandingPage />)
    
    expect(screen.getByText('Upload Your Materials')).toBeInTheDocument()
    expect(screen.getByText('Customize Your Tutor')).toBeInTheDocument()
    expect(screen.getByText('Learn Interactively')).toBeInTheDocument()
    expect(screen.getByText('Share & Discover')).toBeInTheDocument()
  })

  it('renders call-to-action buttons', () => {
    renderWithIntl(<LandingPage />)
    
    expect(screen.getByText('Get Started for Free')).toBeInTheDocument()
    expect(screen.getByText('Learn More')).toBeInTheDocument()
  })

  it('has proper semantic structure', () => {
    renderWithIntl(<LandingPage />)
    
    // Check for proper heading hierarchy
    const mainHeading = screen.getByRole('heading', { level: 1 })
    expect(mainHeading).toHaveTextContent('AI Knowledge Companion')
  })
})
