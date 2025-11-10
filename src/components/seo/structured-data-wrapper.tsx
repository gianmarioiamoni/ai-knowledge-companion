/**
 * Structured Data Wrapper Component
 * Injects JSON-LD structured data into pages
 */

import { JSX } from 'react'

interface StructuredDataWrapperProps {
  data: string | string[]
}

export function StructuredDataWrapper({ data }: StructuredDataWrapperProps): JSX.Element {
  const dataArray = Array.isArray(data) ? data : [data]

  return (
    <>
      {dataArray.map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: schema }}
        />
      ))}
    </>
  )
}

