/**
 * Admin Unlimited Access Card
 * Display card for admin/super_admin users showing unlimited access
 */

import { JSX } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Crown, Infinity } from 'lucide-react'

interface AdminUnlimitedAccessProps {
  title: string
  description: string
  unlimitedText: string
  tutorsLabel: string
  documentsLabel: string
  audioFilesLabel: string
  videoFilesLabel: string
}

export function AdminUnlimitedAccess({
  title,
  description,
  unlimitedText,
  tutorsLabel,
  documentsLabel,
  audioFilesLabel,
  videoFilesLabel
}: AdminUnlimitedAccessProps): JSX.Element {
  const features = [
    { label: tutorsLabel, icon: Infinity },
    { label: documentsLabel, icon: Infinity },
    { label: audioFilesLabel, icon: Infinity },
    { label: videoFilesLabel, icon: Infinity },
  ]

  return (
    <Card className="border-amber-500 bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950 dark:to-yellow-950">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-amber-600" />
              {title}
            </CardTitle>
            <CardDescription className="mt-2">
              {description}
            </CardDescription>
          </div>
          <Badge className="bg-amber-500 hover:bg-amber-600">
            Admin
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="pt-4 border-t border-amber-200 dark:border-amber-800 space-y-3">
          <h4 className="font-semibold text-sm flex items-center gap-2">
            <Infinity className="h-4 w-4 text-amber-600" />
            {unlimitedText}
          </h4>
          
          <div className="grid grid-cols-2 gap-3">
            {features.map((feature) => (
              <div 
                key={feature.label}
                className="flex items-center gap-2 p-3 rounded-lg bg-white dark:bg-gray-900 border border-amber-200 dark:border-amber-800"
              >
                <feature.icon className="h-4 w-4 text-amber-600 flex-shrink-0" />
                <span className="text-sm font-medium">{feature.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-amber-200 dark:border-amber-800">
          <p className="text-sm text-muted-foreground text-center">
            As an administrator, you have unlimited access to all features
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

