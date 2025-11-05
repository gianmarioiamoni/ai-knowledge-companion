-- Check Documents Structure
-- Verify what tables exist for document management

-- 1. List all tables related to documents
SELECT 
  table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name LIKE '%document%' OR table_name LIKE '%chunk%'
ORDER BY table_name;

-- 2. Check documents table structure
SELECT 
  column_name, 
  data_type,
  column_default
FROM information_schema.columns
WHERE table_name = 'documents' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Check if we have any documents
SELECT 
  id,
  name,
  status,
  file_path,
  file_size,
  created_at
FROM documents
ORDER BY created_at DESC
LIMIT 5;

-- 4. Check tutor_documents (linking table)
SELECT 
  td.id,
  td.tutor_id,
  t.name as tutor_name,
  td.document_id,
  d.name as document_name,
  d.status as document_status
FROM tutor_documents td
JOIN tutors t ON td.tutor_id = t.id
LEFT JOIN documents d ON d.id = td.document_id
ORDER BY td.created_at DESC
LIMIT 10;

