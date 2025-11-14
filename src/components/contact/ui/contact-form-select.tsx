'use client';

import { UseFormRegisterReturn } from 'react-hook-form';
import { contactCategories } from '@/lib/schemas/contact';

export interface ContactFormSelectProps {
  label: string;
  placeholder?: string;
  error?: string;
  registration: UseFormRegisterReturn;
  options: Array<{ value: string; label: string }>;
  disabled?: boolean;
  required?: boolean;
}

/**
 * Reusable select component for contact form
 * Follows SRP: Only responsible for rendering a select dropdown
 */
export function ContactFormSelect({
  label,
  placeholder,
  error,
  registration,
  options,
  disabled = false,
  required = false,
}: ContactFormSelectProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-foreground">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </label>
      <select
        disabled={disabled}
        className={`
          w-full px-4 py-2 rounded-lg border transition-all
          ${error 
            ? 'border-destructive focus:ring-destructive' 
            : 'border-border focus:ring-primary'
          }
          ${disabled 
            ? 'bg-muted cursor-not-allowed opacity-60' 
            : 'bg-background hover:border-primary/50'
          }
          focus:outline-none focus:ring-2 focus:ring-offset-2
          text-foreground
        `}
        {...registration}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="text-sm text-destructive mt-1">{error}</p>
      )}
    </div>
  );
}

/**
 * Helper function to get category options for the contact form
 */
export function getCategoryOptions(t: (key: string) => string) {
  return contactCategories.map((category) => ({
    value: category,
    label: t(`form.categories.${category}`),
  }));
}

