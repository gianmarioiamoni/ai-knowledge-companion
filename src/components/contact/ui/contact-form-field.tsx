'use client';

import { UseFormRegisterReturn } from 'react-hook-form';

export interface ContactFormFieldProps {
  label: string;
  placeholder?: string;
  error?: string;
  registration: UseFormRegisterReturn;
  type?: 'text' | 'email';
  disabled?: boolean;
  required?: boolean;
}

/**
 * Reusable form field component for contact form
 * Follows SRP: Only responsible for rendering a single input field
 */
export function ContactFormField({
  label,
  placeholder,
  error,
  registration,
  type = 'text',
  disabled = false,
  required = false,
}: ContactFormFieldProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-foreground">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </label>
      <input
        type={type}
        placeholder={placeholder}
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
          text-foreground placeholder:text-muted-foreground
        `}
        {...registration}
      />
      {error && (
        <p className="text-sm text-destructive mt-1">{error}</p>
      )}
    </div>
  );
}

