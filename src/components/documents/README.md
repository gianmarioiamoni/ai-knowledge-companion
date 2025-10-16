# Documents Components

This folder contains all components related to document management functionality.

## Structure

```
src/components/documents/
├── pages/                    # Main page-level components
│   └── documents-page-client.tsx
├── sections/                 # Page sections and complex components
│   ├── documents-header.tsx
│   ├── upload-section.tsx
│   └── documents-list.tsx
├── ui/                      # Reusable UI components
│   ├── document-item.tsx
│   ├── file-upload.tsx
│   └── error-display.tsx
├── index.ts                 # Barrel exports
└── README.md               # This file
```

## Component Hierarchy

### Pages (`/pages`)
- **DocumentsPageClient**: Main page component that orchestrates all sections
- Handles state management and business logic
- Composes sections and UI components

### Sections (`/sections`)
- **DocumentsHeader**: Page header with title and upload toggle
- **UploadSection**: File upload area with conditional rendering
- **DocumentsList**: Documents list with loading/empty states
- Complex components that combine multiple UI elements

### UI (`/ui`)
- **DocumentItem**: Individual document card with actions
- **FileUpload**: Drag & drop file upload component
- **ErrorDisplay**: Error message display component
- Pure UI components, highly reusable

## Usage

```typescript
// Import main page component
import { DocumentsPageClient } from '@/components/documents'

// Import specific components (if needed)
import { FileUpload, DocumentItem } from '@/components/documents'

// Import from specific folders (if needed)
import { DocumentsHeader } from '@/components/documents/sections/documents-header'
```

## Principles

- **Single Responsibility**: Each component has one clear purpose
- **Composition over Inheritance**: Components are composed together
- **Reusability**: UI components can be reused across the application
- **Clear Hierarchy**: Pages > Sections > UI components
- **Barrel Exports**: Easy importing through index.ts
