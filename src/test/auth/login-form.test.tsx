import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'
import { LoginForm } from '@/components/auth/login-form'

// Mock Supabase
const mockSignInWithPassword = jest.fn()
const mockSignInWithOtp = jest.fn()

jest.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      signInWithPassword: mockSignInWithPassword,
      signInWithOtp: mockSignInWithOtp,
    },
  }),
}))

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}))

// Mock next-intl navigation
jest.mock('@/lib/navigation', () => ({
  Link: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}))

const messages = {
  auth: {
    login: 'Login',
    loginWithEmail: 'Login with your email',
    email: 'Email',
    password: 'Password',
    magicLink: 'Send Magic Link',
    dontHaveAccount: "Don't have an account?",
    signup: 'Sign up',
    loading: 'Loading...',
    checkEmail: 'Check your email',
  },
  common: {
    loading: 'Loading...',
  },
}

function renderWithIntl(component: React.ReactElement) {
  return render(
    <NextIntlClientProvider locale="en" messages={messages}>
      {component}
    </NextIntlClientProvider>
  )
}

describe('LoginForm', () => {
  beforeEach(() => {
    mockSignInWithPassword.mockClear()
    mockSignInWithOtp.mockClear()
  })

  it('should render login form with email and password fields', () => {
    renderWithIntl(<LoginForm />)

    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Login' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Send Magic Link' })).toBeInTheDocument()
  })

  it('should show validation errors for empty fields', async () => {
    renderWithIntl(<LoginForm />)

    const submitButton = screen.getByRole('button', { name: 'Login' })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Invalid email address')).toBeInTheDocument()
      expect(screen.getByText('Password must be at least 6 characters')).toBeInTheDocument()
    })
  })

  it('should call signInWithPassword on form submit', async () => {
    mockSignInWithPassword.mockResolvedValue({ error: null })
    
    renderWithIntl(<LoginForm />)

    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'test@example.com' },
    })
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'password123' },
    })

    fireEvent.click(screen.getByRole('button', { name: 'Login' }))

    await waitFor(() => {
      expect(mockSignInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      })
    })
  })

  it('should display error message on login failure', async () => {
    mockSignInWithPassword.mockResolvedValue({
      error: { message: 'Invalid credentials' },
    })

    renderWithIntl(<LoginForm />)

    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'test@example.com' },
    })
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'wrongpassword' },
    })

    fireEvent.click(screen.getByRole('button', { name: 'Login' }))

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument()
    })
  })

  it('should handle magic link request', async () => {
    mockSignInWithOtp.mockResolvedValue({ error: null })
    
    renderWithIntl(<LoginForm />)

    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'test@example.com' },
    })

    fireEvent.click(screen.getByRole('button', { name: 'Send Magic Link' }))

    await waitFor(() => {
      expect(mockSignInWithOtp).toHaveBeenCalledWith({
        email: 'test@example.com',
        options: {
          emailRedirectTo: expect.stringContaining('/dashboard'),
        },
      })
    })
  })
})
