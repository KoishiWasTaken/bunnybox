-- Verify Database Schema for bunnybox
-- Run this in Supabase SQL Editor to check if all required columns exist

-- 1. Check if storage_path and uses_storage columns exist in files table
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'files'
AND column_name IN ('storage_path', 'uses_storage', 'file_data', 'mime_type', 'filename', 'filesize', 'delete_duration', 'delete_at')
ORDER BY column_name;

-- Expected results:
-- Should see 8 rows including storage_path (text) and uses_storage (boolean)

-- 2. Check indexes on storage columns
SELECT
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'files'
AND (indexname LIKE '%storage%' OR indexname = 'files_pkey')
ORDER BY indexname;

-- Expected results:
-- Should see idx_files_storage_path and idx_files_uses_storage

-- 3. Check storage bucket policies
SELECT
  policyname,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'objects'
AND schemaname = 'storage'
ORDER BY policyname;

-- Expected results:
-- Should see "Public Access", "Service Role Upload", "Service Role Delete", "Service Role Update"

-- 4. Sample query to see current files structure
SELECT
  id,
  filename,
  filesize,
  uses_storage,
  storage_path IS NOT NULL as has_storage_path,
  file_data IS NOT NULL as has_file_data,
  created_at
FROM files
ORDER BY created_at DESC
LIMIT 5;

-- This shows recent files and whether they're using storage or base64

-- 5. Check if there are any files with uses_storage=true but no storage_path
SELECT
  id,
  filename,
  uses_storage,
  storage_path
FROM files
WHERE uses_storage = true AND storage_path IS NULL
LIMIT 10;

-- Expected results: Should be empty (no files)
