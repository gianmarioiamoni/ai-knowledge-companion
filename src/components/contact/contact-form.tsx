'use client';

import { useTranslations } from 'next-intl';
import { AlertCircle, CheckCircle, Info } from 'lucide-react';
import { useContactForm } from '@/hooks/use-contact-form';
import { ContactFormField } from './ui/contact-form-field';
import { ContactFormSelect, getCategoryOptions } from './ui/contact-form-select';
import { ContactFormTextarea } from './ui/contact-form-textarea';

/**
 * Main contact form component
 * Follows SRP: Assembles UI components and handles form flow
 */
export function ContactForm() {
  const t = useTranslations('contact');
  const { form, state, userEmail, isAuthenticated, handleSubmit } = useContactForm();

  const categoryOptions = getCategoryOptions(t);

  // Show success message
  if (state.success) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-green-900 dark:text-green-100">
                {t('success.title')}
              </h3>
              <p className="mt-2 text-green-700 dark:text-green-300">
                {t('success.description')}
              </p>
            </div>
          </div>
        </div>
        
        <button
          onClick={() => window.location.href = '/'}
          className="w-full py-3 px-6 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
        >
          {t('success.backToHome')}
        </button>
      </div>
    );
  }

  return (
    <form 
      onSubmit={form.handleSubmit(handleSubmit)}
      className="max-w-2xl mx-auto space-y-6"
    >
      {/* Info banner for authenticated users */}
      {isAuthenticated && userEmail && (
        <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-blue-700 dark:text-blue-300">
              {t('info.authenticatedUser', { email: userEmail })}
            </p>
          </div>
        </div>
      )}

      {/* Info banner for guest users */}
      {!isAuthenticated && (
        <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-blue-700 dark:text-blue-300">
              {t('info.guestUser')}
            </p>
          </div>
        </div>
      )}

      {/* Error message */}
      {state.error && (
        <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-sm font-medium text-red-900 dark:text-red-100">
                {t('error.title')}
              </h4>
              <p className="mt-1 text-sm text-red-700 dark:text-red-300">
                {state.error}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Form fields */}
      <div className="space-y-4">
        {/* Name field */}
        <ContactFormField
          label={t('form.name')}
          placeholder={t('form.namePlaceholder')}
          error={form.formState.errors.name?.message}
          registration={form.register('name')}
          disabled={state.isLoading}
          required
        />

        {/* Email field (only for guest users) */}
        {!isAuthenticated && (
          <ContactFormField
            label={t('form.email')}
            placeholder={t('form.emailPlaceholder')}
            error={(form.formState.errors as Record<string, { message?: string }>)?.email?.message}
            registration={form.register('email' as never)}
            type="email"
            disabled={state.isLoading}
            required
          />
        )}

        {/* Subject field */}
        <ContactFormField
          label={t('form.subject')}
          placeholder={t('form.subjectPlaceholder')}
          error={form.formState.errors.subject?.message}
          registration={form.register('subject')}
          disabled={state.isLoading}
          required
        />

        {/* Category select */}
        <ContactFormSelect
          label={t('form.category')}
          placeholder={t('form.categoryPlaceholder')}
          error={form.formState.errors.category?.message}
          registration={form.register('category')}
          options={categoryOptions}
          disabled={state.isLoading}
          required
        />

        {/* Message textarea */}
        <ContactFormTextarea
          label={t('form.message')}
          placeholder={t('form.messagePlaceholder')}
          error={form.formState.errors.message?.message}
          registration={form.register('message')}
          rows={8}
          disabled={state.isLoading}
          required
        />
      </div>

      {/* Info footer */}
      <div className="bg-muted/50 rounded-lg p-4 space-y-2">
        <p className="text-sm text-muted-foreground">
          <strong className="text-foreground">{t('info.responseTime')}</strong>
        </p>
        <p className="text-xs text-muted-foreground">
          {t('info.privacy')}
        </p>
      </div>

      {/* Submit button */}
      <div className="flex gap-4">
        <button
          type="submit"
          disabled={state.isLoading}
          className={`
            flex-1 py-3 px-6 rounded-lg font-medium transition-all
            ${state.isLoading
              ? 'bg-primary/50 cursor-not-allowed'
              : 'bg-primary hover:bg-primary/90'
            }
            text-primary-foreground
          `}
        >
          {state.isLoading ? t('form.submitting') : t('form.submit')}
        </button>
      </div>
    </form>
  );
}

