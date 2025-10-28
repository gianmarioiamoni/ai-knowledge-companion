import { JSX } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface FormFieldProps {
  id: string
  type: string
  label: string
  placeholder?: string
  disabled?: boolean
  error?: string
  register: any
}

export function FormField({
  id,
  type,
  label,
  placeholder,
  disabled = false,
  error,
  register,
}: FormFieldProps): JSX.Element {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type={type}
        placeholder={placeholder}
        disabled={disabled}
        {...register}
      />
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  )
}
