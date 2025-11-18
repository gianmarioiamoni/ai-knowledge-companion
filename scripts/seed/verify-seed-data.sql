/* ============================================
   Seed Data Verification Queries
   ============================================
   Run these queries to verify the seed data was created correctly
   
   IMPORTANT: Replace 'YOUR_USER_ID' with the actual user ID 
   from the seed script output (shown as "User ID: ...")
   
   Example: '05237d7e-320d-45ba-9499-94ef49e3be89'
*/

/* Query 1: Check documents created */
SELECT 
  d.id,
  d.title,
  d.status,
  d.media_type,
  d.created_at
FROM documents d
WHERE d.owner_id = 'YOUR_USER_ID'
ORDER BY d.created_at DESC;

/* Query 2: Check document chunks with embeddings */
SELECT 
  d.title,
  COUNT(dc.id) as total_chunks,
  SUM(CASE WHEN dc.embedding IS NOT NULL THEN 1 ELSE 0 END) as chunks_with_embeddings,
  SUM(dc.tokens) as total_tokens
FROM documents d
LEFT JOIN document_chunks dc ON dc.document_id = d.id
WHERE d.owner_id = 'YOUR_USER_ID'
GROUP BY d.id, d.title
ORDER BY d.title;

/* Query 3: Check tutors created */
SELECT 
  t.id,
  t.name,
  t.visibility,
  t.use_rag,
  t.model,
  t.created_at
FROM tutors t
WHERE t.owner_id = 'YOUR_USER_ID'
ORDER BY t.created_at DESC;

/* Query 4: Check tutor-document links */
SELECT 
  t.name as tutor_name,
  d.title as document_title,
  td.created_at
FROM tutor_documents td
JOIN tutors t ON t.id = td.tutor_id
JOIN documents d ON d.id = td.document_id
WHERE t.owner_id = 'YOUR_USER_ID'
ORDER BY t.name, d.title;

/* Query 5: Check conversations */
SELECT 
  c.id,
  c.title,
  t.name as tutor_name,
  c.message_count,
  c.created_at
FROM conversations c
JOIN tutors t ON t.id = c.tutor_id
WHERE c.user_id = 'YOUR_USER_ID'
ORDER BY c.created_at DESC;

/* Query 6: Check messages */
SELECT 
  c.title as conversation_title,
  m.role,
  LEFT(m.content, 100) as content_preview,
  m.tokens_used,
  m.created_at
FROM messages m
JOIN conversations c ON c.id = m.conversation_id
WHERE c.user_id = 'YOUR_USER_ID'
ORDER BY c.title, m.created_at;

/* Query 7: Summary statistics */
SELECT 
  (SELECT COUNT(*) FROM documents WHERE owner_id = 'YOUR_USER_ID') as total_documents,
  (SELECT COUNT(*) FROM document_chunks WHERE document_id IN (SELECT id FROM documents WHERE owner_id = 'YOUR_USER_ID')) as total_chunks,
  (SELECT COUNT(*) FROM tutors WHERE owner_id = 'YOUR_USER_ID') as total_tutors,
  (SELECT COUNT(*) FROM tutor_documents WHERE tutor_id IN (SELECT id FROM tutors WHERE owner_id = 'YOUR_USER_ID')) as total_tutor_links,
  (SELECT COUNT(*) FROM conversations WHERE user_id = 'YOUR_USER_ID') as total_conversations,
  (SELECT COUNT(*) FROM messages WHERE conversation_id IN (SELECT id FROM conversations WHERE user_id = 'YOUR_USER_ID')) as total_messages;

/* Query 8: Check for any processing errors */
SELECT 
  d.id,
  d.title,
  d.status,
  d.updated_at
FROM documents d
WHERE d.owner_id = 'YOUR_USER_ID'
  AND d.status = 'failed'
ORDER BY d.updated_at DESC;

/* Query 9: Verify embeddings are valid (sample check) */
SELECT 
  d.title,
  dc.chunk_index,
  dc.tokens,
  array_length(dc.embedding::float[], 1) as embedding_dimensions,
  CASE 
    WHEN dc.embedding IS NULL THEN 'NULL'
    WHEN array_length(dc.embedding::float[], 1) = 1536 THEN 'Valid (1536-dim)'
    ELSE 'Invalid dimension'
  END as embedding_status
FROM document_chunks dc
JOIN documents d ON d.id = dc.document_id
WHERE d.owner_id = 'YOUR_USER_ID'
ORDER BY d.title, dc.chunk_index;

/* Query 10: Test similarity search (sample query)
   This will find chunks similar to the first calculus chunk */
SELECT 
  d.title,
  dc.chunk_index,
  LEFT(dc.text, 200) as text_preview,
  1 - (dc.embedding <=> (
    SELECT embedding 
    FROM document_chunks 
    WHERE document_id IN (
      SELECT id FROM documents 
      WHERE title = 'Introduction to Calculus' 
        AND owner_id = 'YOUR_USER_ID'
    )
    LIMIT 1
  )) as similarity
FROM document_chunks dc
JOIN documents d ON d.id = dc.document_id
WHERE d.owner_id = 'YOUR_USER_ID'
ORDER BY similarity DESC
LIMIT 5;

