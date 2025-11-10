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

-- 3. Update allowed MIME types for documents table
-- The documents table already has media_type support from script 19
-- We just need to ensure indexes exist for image queries

-- 4. Add indexes on media_type for faster image queries (if not already exists)
CREATE INDEX IF NOT EXISTS idx_documents_media_type_images
ON documents(media_type) WHERE media_type = 'image';

CREATE INDEX IF NOT EXISTS idx_documents_owner_media_type 
ON documents(owner_id, media_type);

-- 5. Update RLS policies to include images
-- (They already work with media_type filter, no changes needed)

-- 6. Add helper function to get image files for a user
CREATE OR REPLACE FUNCTION get_user_images(p_user_id UUID)
RETURNS TABLE (
  id UUID,
  owner_id UUID,
  title VARCHAR,
  storage_path VARCHAR,
  file_size BIGINT,
  mime_type VARCHAR,
  media_type TEXT,
  transcription_status TEXT,
  transcription_text TEXT,
  width INTEGER,
  height INTEGER,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    d.id,
    d.owner_id,
    d.title,
    d.storage_path,
    d.file_size,
    d.mime_type,
    d.media_type,
    d.transcription_status,
    d.transcription_text,
    d.width,
    d.height,
    d.created_at,
    d.updated_at
  FROM documents d
  WHERE d.owner_id = p_user_id
    AND d.media_type = 'image'
  ORDER BY d.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_user_images IS 'Retrieves all image files for a specific user from documents table';

-- 7. Note: Images processing
-- Images don't need transcription like audio files
-- Optional future enhancements:
--   - OCR text extraction (can be stored in transcription_text)
--   - Vision AI analysis (can be stored in document metadata)
--   - Automatic thumbnail generation
-- For now, images are stored and can be associated with tutors

-- 8. Verification query (for testing)
-- SELECT id, title, media_type, file_size, created_at
-- FROM documents
-- WHERE media_type = 'image'
-- ORDER BY created_at DESC
-- LIMIT 10;

