/**
 * Empty Subscription State Component
 */

import { JSX } from 'react'
import { useRouter } from '@/i18n/navigation'
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'

interface EmptySubscriptionStateProps {
  title: string
  upgradePlanText: string
}

export function EmptySubscriptionState({ title, upgradePlanText }: EmptySubscriptionStateProps): JSX.Element {
  const router = useRouter()
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-yellow-500" />
          {title}
        </CardTitle>
        <CardDescription>No active subscription found</CardDescription>
      </CardHeader>
      <CardFooter>
        <Button onClick={() => router.push('/plans')}>
          {upgradePlanText}
        </Button>
      </CardFooter>
    </Card>
  )
}

