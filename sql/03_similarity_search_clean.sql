-- Similarity Search Functions for pgvector
-- Sprint 2: RAG Implementation

-- Funzione per cercare chunk simili usando cosine similarity
CREATE OR REPLACE FUNCTION match_document_chunks(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 10
)
RETURNS TABLE (
  id uuid,
  document_id uuid,
  chunk_index int,
  text text,
  tokens int,
  similarity float,
  created_at timestamptz
)
LANGUAGE SQL
STABLE
AS $$
  SELECT
    dc.id,
    dc.document_id,
    dc.chunk_index,
    dc.text,
    dc.tokens,
    1 - (dc.embedding <=> query_embedding) AS similarity,
    dc.created_at
  FROM document_chunks dc
  JOIN documents d ON dc.document_id = d.id
  WHERE dc.embedding IS NOT NULL
    AND 1 - (dc.embedding <=> query_embedding) > match_threshold
  ORDER BY dc.embedding <=> query_embedding
  LIMIT match_count;
$$;

-- Funzione per cercare chunk simili con filtri aggiuntivi
CREATE OR REPLACE FUNCTION match_document_chunks_filtered(
  query_embedding vector(1536),
  document_ids uuid[] DEFAULT NULL,
  user_id uuid DEFAULT NULL,
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 10
)
RETURNS TABLE (
  id uuid,
  document_id uuid,
  chunk_index int,
  text text,
  tokens int,
  similarity float,
  created_at timestamptz,
  document_title text,
  document_owner_id uuid
)
LANGUAGE SQL
STABLE
AS $$
  SELECT
    dc.id,
    dc.document_id,
    dc.chunk_index,
    dc.text,
    dc.tokens,
    1 - (dc.embedding <=> query_embedding) AS similarity,
    dc.created_at,
    d.title AS document_title,
    d.owner_id AS document_owner_id
  FROM document_chunks dc
  JOIN documents d ON dc.document_id = d.id
  WHERE dc.embedding IS NOT NULL
    AND 1 - (dc.embedding <=> query_embedding) > match_threshold
    AND (document_ids IS NULL OR dc.document_id = ANY(document_ids))
    AND (user_id IS NULL OR d.owner_id = user_id OR d.visibility = 'public')
  ORDER BY dc.embedding <=> query_embedding
  LIMIT match_count;
$$;

-- Indice per ottimizzare le query di similarità
CREATE INDEX IF NOT EXISTS idx_document_chunks_embedding_cosine 
ON document_chunks USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Indice per filtri comuni
CREATE INDEX IF NOT EXISTS idx_document_chunks_document_embedding 
ON document_chunks(document_id) 
WHERE embedding IS NOT NULL;

-- Funzione per ottenere statistiche embeddings
CREATE OR REPLACE FUNCTION get_embedding_stats(user_id uuid DEFAULT NULL)
RETURNS TABLE (
  total_chunks bigint,
  total_tokens bigint,
  documents_with_embeddings bigint,
  avg_similarity_threshold float
)
LANGUAGE SQL
STABLE
AS $$
  SELECT
    COUNT(dc.id) AS total_chunks,
    COALESCE(SUM(dc.tokens), 0) AS total_tokens,
    COUNT(DISTINCT dc.document_id) AS documents_with_embeddings,
    0.7 AS avg_similarity_threshold
  FROM document_chunks dc
  JOIN documents d ON dc.document_id = d.id
  WHERE dc.embedding IS NOT NULL
    AND (user_id IS NULL OR d.owner_id = user_id);
$$;
