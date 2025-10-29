-- Create tutor_documents table if it doesn't exist
CREATE TABLE IF NOT EXISTS tutor_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tutor_id UUID NOT NULL REFERENCES tutors(id) ON DELETE CASCADE,
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(tutor_id, document_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_tutor_documents_tutor_id ON tutor_documents(tutor_id);
CREATE INDEX IF NOT EXISTS idx_tutor_documents_document_id ON tutor_documents(document_id);

-- Enable RLS
ALTER TABLE tutor_documents ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view tutor documents for their tutors" ON tutor_documents
  FOR SELECT USING (
    tutor_id IN (
      SELECT id FROM tutors WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert tutor documents for their tutors" ON tutor_documents
  FOR INSERT WITH CHECK (
    tutor_id IN (
      SELECT id FROM tutors WHERE owner_id = auth.uid()
    ) AND
    document_id IN (
      SELECT id FROM documents WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete tutor documents for their tutors" ON tutor_documents
  FOR DELETE USING (
    tutor_id IN (
      SELECT id FROM tutors WHERE owner_id = auth.uid()
    )
  );
