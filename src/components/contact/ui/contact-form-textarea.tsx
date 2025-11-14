'use client';

import { UseFormRegisterReturn } from 'react-hook-form';

export interface ContactFormTextareaProps {
  label: string;
  placeholder?: string;
  error?: string;
  registration: UseFormRegisterReturn;
  rows?: number;
  disabled?: boolean;
  required?: boolean;
}

/**
 * Reusable textarea component for contact form
 * Follows SRP: Only responsible for rendering a textarea field
 */
export function ContactFormTextarea({
  label,
  placeholder,
  error,
  registration,
  rows = 6,
  disabled = false,
  required = false,
}: ContactFormTextareaProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-foreground">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </label>
      <textarea
        rows={rows}
        placeholder={placeholder}
        disabled={disabled}
        className={`
          w-full px-4 py-2 rounded-lg border transition-all resize-none
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

