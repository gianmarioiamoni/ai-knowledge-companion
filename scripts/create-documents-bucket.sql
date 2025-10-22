-- Create documents storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'documents',
  'documents', 
  true,
  10485760, -- 10MB limit
  ARRAY[
    'application/pdf',
    'text/plain',
    'text/markdown',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
);

-- Create policy to allow all operations for authenticated users
CREATE POLICY "Allow all operations for authenticated users" ON storage.objects
FOR ALL USING (bucket_id = 'documents' AND auth.role() = 'authenticated');

-- Create policy to allow all operations for testing (if needed)
CREATE POLICY "Allow all operations for testing" ON storage.objects
FOR ALL USING (bucket_id = 'documents');
