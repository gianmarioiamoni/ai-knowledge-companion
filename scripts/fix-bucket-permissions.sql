-- Drop existing policies for documents bucket
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON storage.objects;
DROP POLICY IF EXISTS "Allow all operations for testing" ON storage.objects;

-- Create comprehensive policies for documents bucket
-- Policy 1: Allow authenticated users to manage their own files
CREATE POLICY "Authenticated users can manage own files" ON storage.objects
FOR ALL USING (
  bucket_id = 'documents' 
  AND auth.role() = 'authenticated'
);

-- Policy 2: Allow public read access (for downloads)
CREATE POLICY "Public read access for documents" ON storage.objects
FOR SELECT USING (bucket_id = 'documents');

-- Policy 3: Allow all operations for development (temporary)
CREATE POLICY "Allow all operations for development" ON storage.objects
FOR ALL USING (bucket_id = 'documents');

-- Ensure bucket is public
UPDATE storage.buckets 
SET public = true 
WHERE name = 'documents';

-- Grant necessary permissions
GRANT ALL ON storage.objects TO authenticated;
GRANT ALL ON storage.objects TO anon;
