import { JSX } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LucideIcon } from 'lucide-react'

interface ActionCardProps {
  title: string
  description: string
  icon: LucideIcon
  buttonText: string
  buttonIcon?: LucideIcon
  onAction: () => void
  disabled?: boolean
}

export function ActionCard({
  title,
  description,
  icon: Icon,
  buttonText,
  buttonIcon: ButtonIcon,
  onAction,
  disabled = false
}: ActionCardProps): JSX.Element {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon className="h-5 w-5" />
          {title}
        </CardTitle>
        <CardDescription>
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button 
          className="w-full" 
          onClick={onAction}
          disabled={disabled}
        >
          {ButtonIcon && <ButtonIcon className="h-4 w-4 mr-2" />}
          {buttonText}
        </Button>
      </CardContent>
    </Card>
  )
}
