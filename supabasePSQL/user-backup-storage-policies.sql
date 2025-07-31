-- User Backup Storage Policies for 'user-backups' bucket

-- Policy 1: Users can only upload to their own folder
CREATE POLICY "Users can upload to own folder" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'user-backups' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy 2: Users can only view/download their own backup files
CREATE POLICY "Users can view own backup files" ON storage.objects
FOR SELECT USING (
  bucket_id = 'user-backups' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy 3: Users can update their own backup files
CREATE POLICY "Users can update own backup files" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'user-backups' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy 4: Users can delete their own backup files
CREATE POLICY "Users can delete own backup files" ON storage.objects
FOR DELETE USING (
  bucket_id = 'user-backups' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Enable RLS on storage.objects (if not already enabled)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY; 