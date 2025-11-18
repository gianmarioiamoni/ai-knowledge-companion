/* ============================================
   Cleanup Duplicate Seed Documents
   ============================================
   This script removes duplicate seed documents that were created
   during failed processing attempts (without embeddings).
   
   IMPORTANT: This keeps only the documents with embeddings!
   
   Run ONLY if you want to clean up duplicate seed data.
*/

/* 1. Identify documents to DELETE (no chunks = no embeddings) */
SELECT 
  d.id,
  d.title,
  d.status,
  d.created_at,
  COUNT(dc.id) as chunk_count,
  'Will be DELETED' as action
FROM documents d
LEFT JOIN document_chunks dc ON dc.document_id = d.id
WHERE d.owner_id = '05237d7e-320d-45ba-9499-94ef49e3be89'
  AND d.title IN (
    'Introduction to Calculus',
    'Renaissance and Reformation',
    'Modern JavaScript and TypeScript',
    'Cell Biology and Genetics',
    'Advanced English Grammar'
  )
GROUP BY d.id, d.title, d.status, d.created_at
HAVING COUNT(dc.id) = 0
ORDER BY d.title, d.created_at;

/* 2. Identify documents to KEEP (with chunks/embeddings) */
SELECT 
  d.id,
  d.title,
  d.status,
  d.created_at,
  COUNT(dc.id) as chunk_count,
  'Will be KEPT' as action
FROM documents d
LEFT JOIN document_chunks dc ON dc.document_id = d.id
WHERE d.owner_id = '05237d7e-320d-45ba-9499-94ef49e3be89'
  AND d.title IN (
    'Introduction to Calculus',
    'Renaissance and Reformation',
    'Modern JavaScript and TypeScript',
    'Cell Biology and Genetics',
    'Advanced English Grammar'
  )
GROUP BY d.id, d.title, d.status, d.created_at
HAVING COUNT(dc.id) > 0
ORDER BY d.title, d.created_at;

/* 3. DELETE documents without embeddings (CAREFUL!) */
/*
DELETE FROM documents
WHERE id IN (
  SELECT d.id
  FROM documents d
  LEFT JOIN document_chunks dc ON dc.document_id = d.id
  WHERE d.owner_id = '05237d7e-320d-45ba-9499-94ef49e3be89'
    AND d.title IN (
      'Introduction to Calculus',
      'Renaissance and Reformation',
      'Modern JavaScript and TypeScript',
      'Cell Biology and Genetics',
      'Advanced English Grammar'
    )
  GROUP BY d.id
  HAVING COUNT(dc.id) = 0
);
*/

/* NOTE: The DELETE query is commented out for safety.
   Uncomment and run ONLY after verifying the documents to delete
   using queries 1 and 2 above. */

/* 4. Verify cleanup result */
/*
SELECT 
  d.title,
  COUNT(dc.id) as total_chunks,
  SUM(CASE WHEN dc.embedding IS NOT NULL THEN 1 ELSE 0 END) as chunks_with_embeddings,
  d.status,
  d.created_at
FROM documents d
LEFT JOIN document_chunks dc ON dc.document_id = d.id
WHERE d.owner_id = '05237d7e-320d-45ba-9499-94ef49e3be89'
  AND d.title IN (
    'Introduction to Calculus',
    'Renaissance and Reformation',
    'Modern JavaScript and TypeScript',
    'Cell Biology and Genetics',
    'Advanced English Grammar'
  )
GROUP BY d.id, d.title, d.status, d.created_at
ORDER BY d.title, d.created_at;
*/

