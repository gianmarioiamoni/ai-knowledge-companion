CREATE TABLE IF NOT EXISTS tutors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  avatar_url TEXT,
  system_prompt TEXT NOT NULL DEFAULT 'You are a helpful AI tutor. Answer questions based on the provided context and be educational.',
  temperature DECIMAL(3,2) DEFAULT 0.7 CHECK (temperature >= 0 AND temperature <= 2),
  max_tokens INTEGER DEFAULT 2000 CHECK (max_tokens > 0),
  model VARCHAR(100) DEFAULT 'gpt-4o-mini',
  use_rag BOOLEAN DEFAULT true,
  max_context_chunks INTEGER DEFAULT 5 CHECK (max_context_chunks > 0),
  similarity_threshold DECIMAL(3,2) DEFAULT 0.7 CHECK (similarity_threshold >= 0 AND similarity_threshold <= 1),
  allowed_document_types TEXT[] DEFAULT ARRAY['pdf', 'txt', 'md', 'doc', 'docx'],
  max_document_size_mb INTEGER DEFAULT 10 CHECK (max_document_size_mb > 0),
  visibility VARCHAR(20) DEFAULT 'private' CHECK (visibility IN ('private', 'public', 'unlisted')),
  is_shared BOOLEAN DEFAULT false,
  share_token VARCHAR(255) UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_used_at TIMESTAMP WITH TIME ZONE,
  total_conversations INTEGER DEFAULT 0,
  total_messages INTEGER DEFAULT 0,
  total_tokens_used INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_tutors_owner_id ON tutors(owner_id);
CREATE INDEX IF NOT EXISTS idx_tutors_visibility ON tutors(visibility);
CREATE INDEX IF NOT EXISTS idx_tutors_shared ON tutors(is_shared);
CREATE INDEX IF NOT EXISTS idx_tutors_share_token ON tutors(share_token);
CREATE INDEX IF NOT EXISTS idx_tutors_created_at ON tutors(created_at);

CREATE OR REPLACE FUNCTION update_tutors_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_tutors_updated_at
  BEFORE UPDATE ON tutors
  FOR EACH ROW
  EXECUTE FUNCTION update_tutors_updated_at();

ALTER TABLE tutors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tutors and public tutors" ON tutors
  FOR SELECT
  USING (
    owner_id = auth.uid() OR 
    visibility = 'public' OR
    (visibility = 'unlisted' AND share_token IS NOT NULL)
  );

CREATE POLICY "Users can create own tutors" ON tutors
  FOR INSERT
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can update own tutors" ON tutors
  FOR UPDATE
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can delete own tutors" ON tutors
  FOR DELETE
  USING (owner_id = auth.uid());

CREATE TABLE IF NOT EXISTS tutor_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tutor_id UUID NOT NULL REFERENCES tutors(id) ON DELETE CASCADE,
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(tutor_id, document_id)
);

CREATE INDEX IF NOT EXISTS idx_tutor_documents_tutor_id ON tutor_documents(tutor_id);
CREATE INDEX IF NOT EXISTS idx_tutor_documents_document_id ON tutor_documents(document_id);

ALTER TABLE tutor_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage tutor_documents for own tutors" ON tutor_documents
  FOR ALL
  USING (
    tutor_id IN (
      SELECT id FROM tutors WHERE owner_id = auth.uid()
    )
  );

CREATE OR REPLACE FUNCTION generate_share_token()
RETURNS TEXT AS $$
BEGIN
  RETURN encode(gen_random_bytes(32), 'hex');
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_tutor_stats(
  p_tutor_id UUID,
  p_conversations INTEGER DEFAULT 0,
  p_messages INTEGER DEFAULT 0,
  p_tokens INTEGER DEFAULT 0
)
RETURNS VOID AS $$
BEGIN
  UPDATE tutors 
  SET 
    total_conversations = total_conversations + p_conversations,
    total_messages = total_messages + p_messages,
    total_tokens_used = total_tokens_used + p_tokens,
    last_used_at = NOW()
  WHERE id = p_tutor_id;
END;
$$ LANGUAGE plpgsql;
