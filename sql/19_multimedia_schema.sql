-- =====================================================
-- Multimedia Support Schema
-- Sprint 5: Audio/Video/Image support for tutors
-- =====================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. Extend documents table for multimedia
-- =====================================================

-- Add multimedia columns to documents table
ALTER TABLE documents
  ADD COLUMN IF NOT EXISTS media_type TEXT DEFAULT 'document'
    CHECK (media_type IN ('document', 'audio', 'video', 'image')),
  ADD COLUMN IF NOT EXISTS duration_seconds INTEGER,  -- For audio/video
  ADD COLUMN IF NOT EXISTS width INTEGER,              -- For images/video
  ADD COLUMN IF NOT EXISTS height INTEGER,             -- For images/video
  ADD COLUMN IF NOT EXISTS thumbnail_url TEXT,         -- Preview thumbnail
  ADD COLUMN IF NOT EXISTS transcription_status TEXT DEFAULT 'pending'
    CHECK (transcription_status IN ('pending', 'processing', 'completed', 'failed', 'not_required')),
  ADD COLUMN IF NOT EXISTS transcription_text TEXT,    -- Cached transcription
  ADD COLUMN IF NOT EXISTS transcription_cost DECIMAL(10, 4); -- Track API costs

-- Add indexes for multimedia queries
CREATE INDEX IF NOT EXISTS idx_documents_media_type ON documents(media_type);
CREATE INDEX IF NOT EXISTS idx_documents_transcription_status ON documents(transcription_status);

-- Update default for existing documents
UPDATE documents 
SET media_type = 'document', 
    transcription_status = 'not_required'
WHERE media_type IS NULL;

-- =====================================================
-- 2. Media Processing Queue
-- =====================================================

CREATE TABLE IF NOT EXISTS media_processing_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  media_type TEXT NOT NULL CHECK (media_type IN ('audio', 'video', 'image')),
  status TEXT DEFAULT 'queued' 
    CHECK (status IN ('queued', 'processing', 'completed', 'failed', 'cancelled')),
  progress_percent INTEGER DEFAULT 0 CHECK (progress_percent >= 0 AND progress_percent <= 100),
  
  -- Processing metadata
  processing_started_at TIMESTAMPTZ,
  processing_completed_at TIMESTAMPTZ,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  
  -- Result metadata
  chunks_created INTEGER DEFAULT 0,
  embeddings_generated INTEGER DEFAULT 0,
  processing_cost DECIMAL(10, 4) DEFAULT 0,
  
  -- Additional data
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for queue management
CREATE INDEX IF NOT EXISTS idx_media_queue_status ON media_processing_queue(status);
CREATE INDEX IF NOT EXISTS idx_media_queue_user_id ON media_processing_queue(user_id);
CREATE INDEX IF NOT EXISTS idx_media_queue_document_id ON media_processing_queue(document_id);
CREATE INDEX IF NOT EXISTS idx_media_queue_created_at ON media_processing_queue(created_at DESC);

-- =====================================================
-- 3. Tutor Multimedia Junction Table
-- =====================================================

CREATE TABLE IF NOT EXISTS tutor_multimedia (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tutor_id UUID NOT NULL REFERENCES tutors(id) ON DELETE CASCADE,
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  
  -- Display order
  display_order INTEGER DEFAULT 0,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure unique tutor-document pairs
  UNIQUE(tutor_id, document_id)
);

-- Indexes for queries
CREATE INDEX IF NOT EXISTS idx_tutor_multimedia_tutor_id ON tutor_multimedia(tutor_id);
CREATE INDEX IF NOT EXISTS idx_tutor_multimedia_document_id ON tutor_multimedia(document_id);
CREATE INDEX IF NOT EXISTS idx_tutor_multimedia_display_order ON tutor_multimedia(tutor_id, display_order);

-- =====================================================
-- 4. Functions for Queue Management
-- =====================================================

-- Function to queue multimedia processing
CREATE OR REPLACE FUNCTION queue_multimedia_processing(
  p_document_id UUID,
  p_user_id UUID,
  p_media_type TEXT
)
RETURNS UUID AS $$
DECLARE
  v_queue_id UUID;
BEGIN
  -- Insert into processing queue
  INSERT INTO media_processing_queue (
    document_id,
    user_id,
    media_type,
    status,
    created_at
  ) VALUES (
    p_document_id,
    p_user_id,
    p_media_type,
    'queued',
    NOW()
  )
  RETURNING id INTO v_queue_id;
  
  RETURN v_queue_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update processing status
CREATE OR REPLACE FUNCTION update_processing_status(
  p_queue_id UUID,
  p_status TEXT,
  p_progress INTEGER DEFAULT NULL,
  p_error_message TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE media_processing_queue
  SET 
    status = p_status,
    progress_percent = COALESCE(p_progress, progress_percent),
    error_message = p_error_message,
    processing_started_at = CASE 
      WHEN p_status = 'processing' AND processing_started_at IS NULL 
      THEN NOW() 
      ELSE processing_started_at 
    END,
    processing_completed_at = CASE 
      WHEN p_status IN ('completed', 'failed', 'cancelled') 
      THEN NOW() 
      ELSE processing_completed_at 
    END,
    updated_at = NOW()
  WHERE id = p_queue_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get next queued job
CREATE OR REPLACE FUNCTION get_next_processing_job()
RETURNS TABLE (
  queue_id UUID,
  document_id UUID,
  user_id UUID,
  media_type TEXT,
  storage_path TEXT,
  retry_count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    mpq.id,
    mpq.document_id,
    mpq.user_id,
    mpq.media_type,
    d.storage_path,
    mpq.retry_count
  FROM media_processing_queue mpq
  JOIN documents d ON d.id = mpq.document_id
  WHERE mpq.status = 'queued'
    AND mpq.retry_count < mpq.max_retries
  ORDER BY mpq.created_at ASC
  LIMIT 1
  FOR UPDATE SKIP LOCKED;
END;
$$ LANGUAGE plpgsql;

-- Function to clean up old completed jobs (older than 7 days)
CREATE OR REPLACE FUNCTION cleanup_old_processing_jobs()
RETURNS INTEGER AS $$
DECLARE
  v_deleted INTEGER;
BEGIN
  DELETE FROM media_processing_queue
  WHERE status IN ('completed', 'failed', 'cancelled')
    AND processing_completed_at < NOW() - INTERVAL '7 days';
  
  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  RETURN v_deleted;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 5. Row Level Security (RLS)
-- =====================================================

-- Enable RLS on new tables
ALTER TABLE media_processing_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE tutor_multimedia ENABLE ROW LEVEL SECURITY;

-- RLS Policies for media_processing_queue

-- Users can view their own processing jobs
CREATE POLICY "Users can view own processing jobs"
  ON media_processing_queue
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own processing jobs
CREATE POLICY "Users can create own processing jobs"
  ON media_processing_queue
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own processing jobs
CREATE POLICY "Users can update own processing jobs"
  ON media_processing_queue
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Service role can manage all jobs (for background workers)
CREATE POLICY "Service role can manage all jobs"
  ON media_processing_queue
  FOR ALL
  USING (auth.role() = 'service_role');

-- RLS Policies for tutor_multimedia

-- Users can view multimedia for their own tutors
CREATE POLICY "Users can view own tutor multimedia"
  ON tutor_multimedia
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM tutors
      WHERE tutors.id = tutor_multimedia.tutor_id
        AND tutors.owner_id = auth.uid()
    )
  );

-- Users can add multimedia to their own tutors
CREATE POLICY "Users can add multimedia to own tutors"
  ON tutor_multimedia
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM tutors
      WHERE tutors.id = tutor_multimedia.tutor_id
        AND tutors.owner_id = auth.uid()
    )
  );

-- Users can update multimedia for their own tutors
CREATE POLICY "Users can update own tutor multimedia"
  ON tutor_multimedia
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM tutors
      WHERE tutors.id = tutor_multimedia.tutor_id
        AND tutors.owner_id = auth.uid()
    )
  );

-- Users can delete multimedia from their own tutors
CREATE POLICY "Users can delete own tutor multimedia"
  ON tutor_multimedia
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM tutors
      WHERE tutors.id = tutor_multimedia.tutor_id
        AND tutors.owner_id = auth.uid()
    )
  );

-- =====================================================
-- 6. Triggers
-- =====================================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_media_queue_updated_at
  BEFORE UPDATE ON media_processing_queue
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tutor_multimedia_updated_at
  BEFORE UPDATE ON tutor_multimedia
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 7. Indexes for Performance
-- =====================================================

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_media_queue_user_status 
  ON media_processing_queue(user_id, status);

CREATE INDEX IF NOT EXISTS idx_tutor_multimedia_tutor_display 
  ON tutor_multimedia(tutor_id, display_order);

-- =====================================================
-- 8. Comments for Documentation
-- =====================================================

COMMENT ON TABLE media_processing_queue IS 
  'Queue for asynchronous processing of multimedia files (transcription, vision API, etc.)';

COMMENT ON TABLE tutor_multimedia IS 
  'Junction table linking tutors to multimedia documents (audio, video, images)';

COMMENT ON COLUMN documents.media_type IS 
  'Type of media: document, audio, video, or image';

COMMENT ON COLUMN documents.transcription_status IS 
  'Status of transcription/processing: pending, processing, completed, failed, not_required';

COMMENT ON COLUMN documents.transcription_text IS 
  'Cached transcription or vision API result';

COMMENT ON FUNCTION queue_multimedia_processing IS 
  'Queue a multimedia file for asynchronous processing';

COMMENT ON FUNCTION update_processing_status IS 
  'Update the status and progress of a processing job';

COMMENT ON FUNCTION get_next_processing_job IS 
  'Get the next queued job for processing (used by background workers)';

-- =====================================================
-- Success Message
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Multimedia schema created successfully!';
  RAISE NOTICE '📋 Tables: documents (extended), media_processing_queue, tutor_multimedia';
  RAISE NOTICE '🔧 Functions: queue_multimedia_processing, update_processing_status, get_next_processing_job';
  RAISE NOTICE '🔒 RLS policies enabled for all tables';
END $$;

