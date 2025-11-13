'use client'

import { JSX } from 'react'
import { Button } from '@/components/ui/button'

interface ScrollToFeaturesButtonProps {
  label: string
}

/**
 * Client component for smooth scrolling to features section
 * Separated from server components to enable onClick handler
 */
export function ScrollToFeaturesButton({ label }: ScrollToFeaturesButtonProps): JSX.Element {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    const featuresSection = document.getElementById('features')
    if (featuresSection) {
      featuresSection.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      })
    }
  }

  return (
    <a 
      href="#features"
      className="scroll-smooth"
      onClick={handleClick}
    >
      <Button 
        variant="outline" 
        size="lg" 
        className="text-lg px-8 py-3 w-full sm:w-auto shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 bg-background/80 backdrop-blur-sm"
      >
        {label}
      </Button>
    </a>
  )
}

