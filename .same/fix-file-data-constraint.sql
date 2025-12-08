-- Fix file_data column to allow NULL for storage-based uploads
-- The column was originally NOT NULL because all files used base64 storage
-- Now with Supabase Storage, we need to allow NULL

ALTER TABLE files
ALTER COLUMN file_data DROP NOT NULL;

-- Verify the change
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'files'
AND column_name = 'file_data';

-- Expected result: is_nullable = 'YES'
