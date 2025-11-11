/**
 * Structured Data Wrapper Component
 * Injects JSON-LD structured data into pages
 * Server-side rendered for SEO
 */

import { JSX } from 'react'

interface StructuredDataWrapperProps {
  data: object | object[]
}

export function StructuredDataWrapper({ data }: StructuredDataWrapperProps): JSX.Element {
  const dataArray = Array.isArray(data) ? data : [data]

  return (
    <>
      {dataArray.map((schema, index) => (
        <script
          key={`structured-data-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </>
  )
}

