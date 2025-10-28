'use client'

import { JSX } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Plus } from 'lucide-react'

interface TutorsEmptyProps {
  isSearching: boolean
  searchQuery: string
  emptyLabels: {
    noTutors: string
    noTutorsFound: string
    createFirstTutor: string
    tryDifferentSearch: string
    createFirstTutorButton: string
  }
  onCreateTutor: () => void
}

export function TutorsEmpty({
  isSearching,
  searchQuery,
  emptyLabels,
  onCreateTutor
}: TutorsEmptyProps): JSX.Element {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6">
            <Plus className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {isSearching ? emptyLabels.noTutorsFound : emptyLabels.noTutors}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
            {isSearching 
              ? emptyLabels.tryDifferentSearch
              : emptyLabels.createFirstTutor
            }
          </p>
          {!isSearching && (
            <Button onClick={onCreateTutor} className="gap-2">
              <Plus className="h-4 w-4" />
              {emptyLabels.createFirstTutorButton}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
