import { JSX } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AuthLink } from './auth-link'

interface SuccessCardProps {
  title: string
  description: string
  message: string
  buttonText: string
  buttonHref: string
}

export function SuccessCard({
  title,
  description,
  message,
  buttonText,
  buttonHref,
}: SuccessCardProps): JSX.Element {
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center text-green-600">
          {title}
        </CardTitle>
        <CardDescription className="text-center">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-4">
            {message}
          </p>
          <AuthLink href={buttonHref}>
            <Button variant="outline">{buttonText}</Button>
          </AuthLink>
        </div>
      </CardContent>
    </Card>
  )
}
