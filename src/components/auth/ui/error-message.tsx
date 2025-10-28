import { JSX } from 'react'

interface ErrorMessageProps {
  error?: string | null
  className?: string
}

export function ErrorMessage({ 
  error, 
  className = "text-sm text-red-600 text-center" 
}: ErrorMessageProps): JSX.Element {
  if (!error) return <></>
  
  return (
    <div className={className}>
      {error}
    </div>
  )
}
