import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/hooks/use-auth';
import {
  contactSchemaAuthenticated,
  contactSchemaGuest,
  type ContactFormDataAuthenticated,
  type ContactFormDataGuest,
  type ContactCategory,
} from '@/lib/schemas/contact';

export interface ContactFormState {
  isLoading: boolean;
  error: string | null;
  success: boolean;
}

export interface UseContactFormReturn {
  form: ReturnType<typeof useForm<ContactFormDataAuthenticated | ContactFormDataGuest>>;
  state: ContactFormState;
  userEmail: string | null;
  isAuthenticated: boolean;
  clearError: () => void;
  handleSubmit: (data: ContactFormDataAuthenticated | ContactFormDataGuest) => Promise<void>;
}

/**
 * Custom hook for contact form logic
 * - Handles form validation
 * - Manages form state (loading, error, success)
 * - Handles form submission
 * - Auto-fills email for authenticated users
 */
export function useContactForm(): UseContactFormReturn {
  const { user } = useAuth();
  const t = useTranslations('contact');
  
  const [state, setState] = useState<ContactFormState>({
    isLoading: false,
    error: null,
    success: false,
  });

  const isAuthenticated = !!user;
  const userEmail = user?.email || null;

  // Use appropriate schema based on authentication status
  const schema = isAuthenticated ? contactSchemaAuthenticated : contactSchemaGuest;
  
  const form = useForm<ContactFormDataAuthenticated | ContactFormDataGuest>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: user?.user_metadata?.displayName || user?.user_metadata?.full_name || '',
      subject: '',
      category: undefined as unknown as ContactCategory,
      message: '',
      ...(!isAuthenticated && { email: '' }),
    },
  });

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const handleSubmit = useCallback(async (data: ContactFormDataAuthenticated | ContactFormDataGuest) => {
    setState({ isLoading: true, error: null, success: false });

    try {
      // Prepare request data
      const requestData = {
        ...data,
        email: isAuthenticated ? userEmail || '' : (data as ContactFormDataGuest).email,
        isAuthenticated,
      };

      // Send request to API
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || t('error.description'));
      }

      // Success!
      setState({ isLoading: false, error: null, success: true });
      
      // Reset form
      form.reset();

    } catch (error) {
      console.error('Contact form submission error:', error);
      const errorMessage = error instanceof Error ? error.message : t('error.description');
      setState({ isLoading: false, error: errorMessage, success: false });
    }
  }, [isAuthenticated, userEmail, t, form]);

  return {
    form,
    state,
    userEmail,
    isAuthenticated,
    clearError,
    handleSubmit,
  };
}

