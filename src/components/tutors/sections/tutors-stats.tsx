'use client'

import { JSX } from 'react'
import { Card, CardContent } from '@/components/ui/card'

interface TutorsStatsProps {
  totalTutors: number
  publicTutors: number
  totalConversations: number
  statsLabels: {
    totalTutors: string
    public: string
    conversations: string
  }
}

export function TutorsStats({
  totalTutors,
  publicTutors,
  totalConversations,
  statsLabels
}: TutorsStatsProps): JSX.Element {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {totalTutors}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {statsLabels.totalTutors}
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">
              {publicTutors}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {statsLabels.public}
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
              {totalConversations}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {statsLabels.conversations}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
