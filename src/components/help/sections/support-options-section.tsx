import { JSX } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BookOpen, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Link } from '@/i18n/navigation'
import { SupportOptionCard } from '../ui/support-option-card'

interface SupportOptionsSectionProps {
  title: string
  description: string
  fullManual: {
    title: string
    description: string
    url: string
  }
  contactSupport: {
    title: string
    description: string
  }
}

/**
 * Support Options Section
 * Displays available support channels
 */
export function SupportOptionsSection({ 
  title, 
  description, 
  fullManual, 
  contactSupport 
}: SupportOptionsSectionProps): JSX.Element {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {/* Full Manual */}
          <SupportOptionCard
            icon={BookOpen}
            title={fullManual.title}
            description={fullManual.description}
          >
            <a href={fullManual.url} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm">
                <BookOpen className="mr-2 h-4 w-4" />
                {fullManual.title}
              </Button>
            </a>
          </SupportOptionCard>

          {/* Contact Support */}
          <SupportOptionCard
            icon={Mail}
            title={contactSupport.title}
            description={contactSupport.description}
          >
            <Link href="/contact">
              <Button variant="outline" size="sm">
                <Mail className="mr-2 h-4 w-4" />
                {contactSupport.title}
              </Button>
            </Link>
          </SupportOptionCard>
        </div>
      </CardContent>
    </Card>
  )
}

