import { JSX } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Link } from '@/i18n/navigation'

interface HeroSectionProps {
  title: string
  subtitle: string
  description: string
  ctaPrimary: string
  ctaSecondary: string
}

/**
 * Hero section with background image and overlay
 * Features a visually striking background representing AI and learning
 */
export function HeroSection({
  title,
  subtitle,
  description,
  ctaPrimary,
  ctaSecondary
}: HeroSectionProps): JSX.Element {
  return (
    <div className="relative min-h-[600px] md:min-h-[700px] xl:min-h-[800px] 2xl:min-h-[900px] flex items-center overflow-hidden">
      {/* Background Image with Next.js Image optimization */}
      <Image
        src="https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=2865&auto=format&fit=crop"
        alt="Digital brain and AI - artificial intelligence and knowledge representation"
        fill
        priority
        className="object-cover object-center"
        sizes="100vw"
        quality={90}
      />
      
      {/* Gradient Overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-br from-background/70 via-background/60 to-background/50 dark:from-background/85 dark:via-background/75 dark:to-background/65" />
      
      {/* Additional subtle gradient for depth */}
      <div className="absolute inset-0 bg-gradient-to-t from-background/30 via-transparent to-transparent" />
      
      {/* Content Container */}
      <div className="container relative z-10 mx-auto px-4 py-16 md:py-24">
        <div className="text-center max-w-4xl mx-auto">
          {/* Title with enhanced visibility */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-foreground mb-6 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            {title}
          </h1>
          
          {/* Subtitle */}
          <p className="text-xl sm:text-2xl text-foreground/90 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-150">
            {subtitle}
          </p>
          
          {/* Description */}
          <p className="text-base sm:text-lg text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300">
            {description}
          </p>

          {/* CTA Buttons with enhanced visibility */}
          <div className="flex gap-4 justify-center flex-col sm:flex-row animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-500">
            <Link href="/auth/signup">
              <Button 
                size="lg" 
                className="text-lg px-8 py-3 w-full sm:w-auto shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                {ctaPrimary}
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button 
                variant="outline" 
                size="lg" 
                className="text-lg px-8 py-3 w-full sm:w-auto shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 bg-background/80 backdrop-blur-sm"
              >
                {ctaSecondary}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
