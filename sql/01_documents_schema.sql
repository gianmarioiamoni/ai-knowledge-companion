-- Documents and Document Chunks Schema
-- Based on AI Knowledge Companion specifications

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector"; -- For future embeddings support

-- Documents table
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  source_url TEXT,
  storage_path TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  length_tokens INTEGER,
  visibility TEXT NOT NULL DEFAULT 'private' CHECK (visibility IN ('private', 'public')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Document chunks table
CREATE TABLE IF NOT EXISTS document_chunks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  chunk_index INTEGER NOT NULL,
  text TEXT NOT NULL,
  tokens INTEGER NOT NULL,
  embedding VECTOR(1536), -- OpenAI text-embedding-3-large dimensions (for Sprint 2)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure unique chunk index per document
  UNIQUE(document_id, chunk_index)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_documents_owner_id ON documents(owner_id);
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON documents(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_documents_visibility ON documents(visibility);

CREATE INDEX IF NOT EXISTS idx_document_chunks_document_id ON document_chunks(document_id);
CREATE INDEX IF NOT EXISTS idx_document_chunks_chunk_index ON document_chunks(document_id, chunk_index);

-- For future similarity search (Sprint 2)
-- CREATE INDEX IF NOT EXISTS idx_document_chunks_embedding ON document_chunks USING ivfflat (embedding vector_cosine_ops);

-- Row Level Security (RLS)
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_chunks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for documents
CREATE POLICY "Users can view their own documents" ON documents
  FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "Users can view public documents" ON documents
  FOR SELECT USING (visibility = 'public');

CREATE POLICY "Users can insert their own documents" ON documents
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own documents" ON documents
  FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own documents" ON documents
  FOR DELETE USING (auth.uid() = owner_id);

-- RLS Policies for document_chunks
CREATE POLICY "Users can view chunks of their own documents" ON document_chunks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM documents 
      WHERE documents.id = document_chunks.document_id 
      AND documents.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can view chunks of public documents" ON document_chunks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM documents 
      WHERE documents.id = document_chunks.document_id 
      AND documents.visibility = 'public'
    )
  );

CREATE POLICY "Users can insert chunks for their own documents" ON document_chunks
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM documents 
      WHERE documents.id = document_chunks.document_id 
      AND documents.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can update chunks of their own documents" ON document_chunks
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM documents 
      WHERE documents.id = document_chunks.document_id 
      AND documents.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete chunks of their own documents" ON document_chunks
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM documents 
      WHERE documents.id = document_chunks.document_id 
      AND documents.owner_id = auth.uid()
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_documents_updated_at 
  BEFORE UPDATE ON documents 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
