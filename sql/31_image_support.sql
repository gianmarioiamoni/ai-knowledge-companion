-- Migration: Add support for image files
-- This script adds image bucket, updates schema, and processing logic

-- 1. Create storage bucket for images (run in Supabase Dashboard -> Storage)
-- Bucket name: images
-- Public: false
-- File size limit: 10MB
-- Allowed MIME types: image/jpeg, image/jpg, image/png, image/gif, image/webp

-- Note: Bucket creation SQL (for reference, run manually in Storage UI)
-- INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
-- VALUES (
--   'images',
--   'images',
--   false,
--   10485760, -- 10MB
--   ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
-- );

-- 2. Storage policies for images bucket
-- Drop existing policies if they exist (to allow re-running this script)
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

-- 3. Update allowed MIME types for multimedia_documents table
-- Add image-specific MIME types to the check constraint
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

-- 4. Add index on media_type for faster queries
CREATE INDEX IF NOT EXISTS idx_multimedia_documents_media_type 
ON multimedia_documents(media_type);

CREATE INDEX IF NOT EXISTS idx_multimedia_documents_user_media_type 
ON multimedia_documents(user_id, media_type);

-- 5. Update RLS policies to include images
-- (They already work with media_type filter, no changes needed)

-- 6. Add helper function to get image files for a user
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

-- 7. Update the worker function to handle images
-- Images don't need transcription, but we can extract text via OCR if needed
-- For now, images will just be stored and associated with tutors

COMMENT ON FUNCTION get_user_images IS 'Retrieves all image files for a specific user';

-- 8. Add processing metadata structure for images
-- Images can have optional OCR text extraction
-- Structure: 
-- {
--   "ocr_text": "extracted text from image",
--   "vision_analysis": "AI-generated description of image content",
--   "dimensions": {"width": 1920, "height": 1080},
--   "format": "jpeg",
--   "has_transparency": false
-- }

