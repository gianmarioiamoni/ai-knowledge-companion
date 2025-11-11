import { ChevronRight } from 'lucide-react'

/**
 * Breadcrumb separator component
 * Displays a chevron icon between breadcrumb items
 */
export const BreadcrumbSeparator = () => {
  return (
    <ChevronRight 
      className="h-3 w-3 flex-shrink-0" 
      aria-hidden="true"
    />
  )
}

