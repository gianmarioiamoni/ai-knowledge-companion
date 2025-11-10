-- ============================================================================
-- FULL IMAGE SUPPORT MIGRATION
-- This script includes ALL prerequisites for image support
-- Run this if you haven't run scripts 19-21, 25, 27 yet
-- ============================================================================

-- ============================================================================
-- PART 1: Check Prerequisites
-- ============================================================================

-- Check if multimedia_documents table exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_name = 'multimedia_documents'
  ) THEN
    RAISE NOTICE 'multimedia_documents table does not exist. Creating it now...';
  ELSE
    RAISE NOTICE 'multimedia_documents table already exists. Skipping creation.';
  END IF;
END $$;

-- ============================================================================
-- PART 2: Create multimedia_documents table (from script 19)
-- ============================================================================

CREATE TABLE IF NOT EXISTS multimedia_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_size BIGINT NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  media_type VARCHAR(50) NOT NULL CHECK (media_type IN ('audio', 'video', 'image')),
  status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  processing_metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_multimedia_documents_user_id ON multimedia_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_multimedia_documents_status ON multimedia_documents(status);
CREATE INDEX IF NOT EXISTS idx_multimedia_documents_media_type ON multimedia_documents(media_type);
CREATE INDEX IF NOT EXISTS idx_multimedia_documents_user_media_type ON multimedia_documents(user_id, media_type);

-- Enable RLS
ALTER TABLE multimedia_documents ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can view own multimedia" ON multimedia_documents;
CREATE POLICY "Users can view own multimedia"
ON multimedia_documents FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own multimedia" ON multimedia_documents;
CREATE POLICY "Users can insert own multimedia"
ON multimedia_documents FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own multimedia" ON multimedia_documents;
CREATE POLICY "Users can update own multimedia"
ON multimedia_documents FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own multimedia" ON multimedia_documents;
CREATE POLICY "Users can delete own multimedia"
ON multimedia_documents FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- ============================================================================
-- PART 3: Create tutor_multimedia_documents table (from script 19)
-- ============================================================================

CREATE TABLE IF NOT EXISTS tutor_multimedia_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tutor_id UUID NOT NULL REFERENCES tutors(id) ON DELETE CASCADE,
  document_id UUID NOT NULL REFERENCES multimedia_documents(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(tutor_id, document_id)
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_tutor_multimedia_tutor_id ON tutor_multimedia_documents(tutor_id);
CREATE INDEX IF NOT EXISTS idx_tutor_multimedia_document_id ON tutor_multimedia_documents(document_id);

-- Enable RLS
ALTER TABLE tutor_multimedia_documents ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can view tutor multimedia" ON tutor_multimedia_documents;
CREATE POLICY "Users can view tutor multimedia"
ON tutor_multimedia_documents FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM tutors
    WHERE tutors.id = tutor_multimedia_documents.tutor_id
    AND tutors.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can manage tutor multimedia" ON tutor_multimedia_documents;
CREATE POLICY "Users can manage tutor multimedia"
ON tutor_multimedia_documents FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM tutors
    WHERE tutors.id = tutor_multimedia_documents.tutor_id
    AND tutors.user_id = auth.uid()
  )
);

-- ============================================================================
-- PART 4: Create multimedia_processing_queue table (from script 19)
-- ============================================================================

CREATE TABLE IF NOT EXISTS multimedia_processing_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES multimedia_documents(id) ON DELETE CASCADE,
  status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  attempts INTEGER NOT NULL DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(document_id)
);

CREATE INDEX IF NOT EXISTS idx_queue_status ON multimedia_processing_queue(status);
CREATE INDEX IF NOT EXISTS idx_queue_created_at ON multimedia_processing_queue(created_at);

-- ============================================================================
-- PART 5: Storage policies for audio bucket (from script 20)
-- ============================================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own audio files" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload own audio files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own audio files" ON storage.objects;

-- Create policies for audio bucket
CREATE POLICY "Users can view own audio files"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'audio' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can upload own audio files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'audio' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete own audio files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'audio' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- ============================================================================
-- PART 6: Add max_image_files to subscription_plans (from script 27)
-- ============================================================================

-- Add column if it doesn't exist
ALTER TABLE subscription_plans 
ADD COLUMN IF NOT EXISTS max_image_files INTEGER NOT NULL DEFAULT 0;

-- Update existing plans with image limits (only if column was just added)
UPDATE subscription_plans
SET max_image_files = CASE name
  WHEN 'trial' THEN 5
  WHEN 'pro' THEN 50
  WHEN 'enterprise' THEN 200
  ELSE 0
END,
updated_at = NOW()
WHERE max_image_files = 0;

-- ============================================================================
-- PART 7: Storage policies for images bucket (NEW - script 31)
-- ============================================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own images" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload own images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own images" ON storage.objects;

-- Enable read access for authenticated users (images they own)
CREATE POLICY "Users can view own images"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Enable upload for authenticated users (to their own folder)
CREATE POLICY "Users can upload own images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Enable delete for authenticated users (their own images)
CREATE POLICY "Users can delete own images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- ============================================================================
-- PART 8: Update MIME type constraints (from script 31)
-- ============================================================================

ALTER TABLE multimedia_documents DROP CONSTRAINT IF EXISTS multimedia_documents_mime_type_check;

ALTER TABLE multimedia_documents
ADD CONSTRAINT multimedia_documents_mime_type_check
CHECK (
  mime_type IN (
    -- Audio formats
    'audio/mpeg',
    'audio/mp3',
    'audio/wav',
    'audio/ogg',
    'audio/m4a',
    'audio/x-m4a',
    'audio/aac',
    'audio/flac',
    -- Video formats (for future)
    'video/mp4',
    'video/mpeg',
    'video/quicktime',
    'video/x-msvideo',
    'video/webm',
    -- Image formats
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml'
  )
);

-- ============================================================================
-- PART 9: Helper function to get user images (from script 31)
-- ============================================================================

CREATE OR REPLACE FUNCTION get_user_images(p_user_id UUID)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  file_name VARCHAR,
  file_path VARCHAR,
  file_size BIGINT,
  mime_type VARCHAR,
  media_type VARCHAR,
  status VARCHAR,
  processing_metadata JSONB,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    md.id,
    md.user_id,
    md.file_name,
    md.file_path,
    md.file_size,
    md.mime_type,
    md.media_type,
    md.status,
    md.processing_metadata,
    md.created_at,
    md.updated_at
  FROM multimedia_documents md
  WHERE md.user_id = p_user_id
    AND md.media_type = 'image'
  ORDER BY md.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_user_images IS 'Retrieves all image files for a specific user';

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Check tables exist
DO $$
BEGIN
  RAISE NOTICE '=== VERIFICATION ===';
  
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'multimedia_documents') THEN
    RAISE NOTICE '✓ multimedia_documents table exists';
  ELSE
    RAISE WARNING '✗ multimedia_documents table missing';
  END IF;
  
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'tutor_multimedia_documents') THEN
    RAISE NOTICE '✓ tutor_multimedia_documents table exists';
  ELSE
    RAISE WARNING '✗ tutor_multimedia_documents table missing';
  END IF;
  
  IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'subscription_plans' AND column_name = 'max_image_files') THEN
    RAISE NOTICE '✓ max_image_files column exists';
  ELSE
    RAISE WARNING '✗ max_image_files column missing';
  END IF;
  
  RAISE NOTICE '===================';
  RAISE NOTICE 'Migration completed. Now create the "images" storage bucket manually in Supabase UI.';
END $$;

