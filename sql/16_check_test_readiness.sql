-- Check Test Readiness for Billing Tracking
-- Verify you have everything needed to test the billing system

-- 1. Check if you have tutors with RAG enabled
SELECT 
  id,
  name,
  use_rag,
  max_context_chunks,
  similarity_threshold,
  owner_id
FROM tutors
WHERE use_rag = true
ORDER BY created_at DESC
LIMIT 5;

-- 2. Check if those tutors have linked documents
SELECT 
  td.tutor_id,
  t.name as tutor_name,
  COUNT(DISTINCT td.document_id) as linked_documents_count,
  COUNT(DISTINCT c.id) as total_chunks
FROM tutor_documents td
JOIN tutors t ON td.tutor_id = t.id
LEFT JOIN document_chunks c ON c.document_id = td.document_id
WHERE t.use_rag = true
GROUP BY td.tutor_id, t.name
HAVING COUNT(DISTINCT td.document_id) > 0;

-- 3. Check documents that have embeddings ready
SELECT 
  d.id,
  d.name,
  d.status,
  COUNT(c.id) as chunks_count,
  COUNT(c.embedding) as embeddings_count
FROM documents d
LEFT JOIN document_chunks c ON c.document_id = d.id
WHERE d.status = 'ready'
GROUP BY d.id, d.name, d.status
ORDER BY d.created_at DESC
LIMIT 5;

-- 4. Get your user_id (you'll need this)
SELECT 
  id as user_id,
  email
FROM auth.users
ORDER BY created_at DESC
LIMIT 1;

-- Summary: What you need for the test to work
SELECT 
  CASE 
    WHEN (SELECT COUNT(*) FROM tutors WHERE use_rag = true) > 0 
    THEN '✅ You have RAG-enabled tutors'
    ELSE '❌ You need to create a tutor with RAG enabled'
  END as tutor_check,
  
  CASE 
    WHEN (SELECT COUNT(DISTINCT document_id) FROM tutor_documents) > 0 
    THEN '✅ You have documents linked to tutors'
    ELSE '❌ You need to link documents to tutors'
  END as documents_check,
  
  CASE 
    WHEN (SELECT COUNT(*) FROM document_chunks WHERE embedding IS NOT NULL) > 0 
    THEN '✅ You have document embeddings ready'
    ELSE '❌ You need to upload and process documents'
  END as embeddings_check;

