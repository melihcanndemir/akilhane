-- Migration for user backup system
-- This should be run in Supabase SQL editor

-- Create user backup metadata table
CREATE TABLE IF NOT EXISTS user_backup_metadata (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  last_backup_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Enable RLS for user backup metadata
ALTER TABLE user_backup_metadata ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to manage their own backup metadata
CREATE POLICY "Users can manage their own backup metadata" 
ON user_backup_metadata FOR ALL 
USING (auth.uid() = user_id);

-- Create storage bucket for user backups
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'user-backups',
  'user-backups', 
  false,
  52428800, -- 50MB limit
  ARRAY['application/json']
) ON CONFLICT (id) DO NOTHING;

-- Create storage policy for user backups
CREATE POLICY "Users can upload their own backups" 
ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'user-backups' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own backups" 
ON storage.objects FOR SELECT 
USING (
  bucket_id = 'user-backups' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own backups" 
ON storage.objects FOR UPDATE 
USING (
  bucket_id = 'user-backups' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own backups" 
ON storage.objects FOR DELETE 
USING (
  bucket_id = 'user-backups' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for user_backup_metadata
CREATE TRIGGER update_user_backup_metadata_updated_at 
  BEFORE UPDATE ON user_backup_metadata 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_user_backup_metadata_user_id 
ON user_backup_metadata(user_id);

CREATE INDEX IF NOT EXISTS idx_user_backup_metadata_last_backup_at 
ON user_backup_metadata(last_backup_at); 