-- Update storage bucket to support PowerPoint files
-- Add PPTX MIME type to allowed_mime_types

UPDATE storage.buckets
SET allowed_mime_types = ARRAY[
  'application/pdf',
  'text/plain',
  'text/markdown',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation'
]
WHERE id = 'documents';

