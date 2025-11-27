-- Storage RLS Policies for bunnybox file uploads
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/puqcpwznfkpchfxhiglh/sql

-- Allow public access to read files from the 'files' bucket
CREATE POLICY IF NOT EXISTS "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'files' );

-- Allow service role to insert files into the 'files' bucket
CREATE POLICY IF NOT EXISTS "Service Role Upload"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'files' );

-- Allow service role to delete files from the 'files' bucket
CREATE POLICY IF NOT EXISTS "Service Role Delete"
ON storage.objects FOR DELETE
USING ( bucket_id = 'files' );

-- Allow service role to update files (for metadata updates)
CREATE POLICY IF NOT EXISTS "Service Role Update"
ON storage.objects FOR UPDATE
USING ( bucket_id = 'files' );

-- Add storage_path column to files table to track Supabase Storage location
ALTER TABLE files
ADD COLUMN IF NOT EXISTS storage_path TEXT,
ADD COLUMN IF NOT EXISTS uses_storage BOOLEAN DEFAULT FALSE;

-- Add comments
COMMENT ON COLUMN files.storage_path IS 'Path to file in Supabase Storage bucket';
COMMENT ON COLUMN files.uses_storage IS 'TRUE if file is stored in Supabase Storage, FALSE if stored as base64 in file_data';

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_files_storage_path ON files(storage_path);
CREATE INDEX IF NOT EXISTS idx_files_uses_storage ON files(uses_storage);
