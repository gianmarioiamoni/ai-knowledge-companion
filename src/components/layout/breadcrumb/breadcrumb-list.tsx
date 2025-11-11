import { BreadcrumbItem as BreadcrumbItemType } from './use-breadcrumb-items'
import { BreadcrumbItem } from './breadcrumb-item'
import { BreadcrumbSeparator } from './breadcrumb-separator'

interface BreadcrumbListProps {
  items: BreadcrumbItemType[]
}

/**
 * Breadcrumb list component
 * Renders the list of breadcrumb items with separators
 */
export const BreadcrumbList = ({ items }: BreadcrumbListProps) => {
  return (
    <ol className="flex items-center gap-1.5 py-2 text-xs text-muted-foreground">
      {items.map((item, index) => (
        <li key={item.href} className="flex items-center gap-1.5">
          {index > 0 && <BreadcrumbSeparator />}
          
          <BreadcrumbItem
            label={item.label}
            href={item.href}
            isCurrentPage={item.isCurrentPage}
            isHome={index === 0}
          />
        </li>
      ))}
    </ol>
  )
}

