import { JSX } from 'react'
import { Button } from '@/components/ui/button'
import { GoogleIcon } from '@/components/ui/google-icon'

interface GoogleButtonProps {
  onClick: () => void
  disabled?: boolean
  children?: string
}

export function GoogleButton({ 
  onClick, 
  disabled = false, 
  children = 'Continue with Google' 
}: GoogleButtonProps): JSX.Element {
  return (
    <Button
      type="button"
      variant="outline"
      className="w-full bg-white hover:bg-gray-50 text-gray-700 border-gray-300 font-medium"
      onClick={onClick}
      disabled={disabled}
    >
      <GoogleIcon className="w-5 h-5 mr-3" />
      {children}
    </Button>
  )
}
