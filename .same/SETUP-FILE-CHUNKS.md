# File Chunks Setup Guide

## What is File Chunking?

File chunking splits large files into smaller pieces stored across multiple database rows. This overcomes PostgreSQL row size limits and allows storing files up to the full 100MB upload limit.

## Setup Steps

### Step 1: Create the file_chunks Table in Supabase

1. Go to Supabase Dashboard → SQL Editor
2. Click New Query
3. Paste and run this SQL:

```sql
CREATE TABLE file_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_id TEXT NOT NULL REFERENCES files(id) ON DELETE CASCADE,
  chunk_index INTEGER NOT NULL,
  chunk_data TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(file_id, chunk_index)
);

CREATE INDEX idx_file_chunks_file_id ON file_chunks(file_id, chunk_index);

ALTER TABLE file_chunks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage file chunks"
ON file_chunks FOR ALL TO service_role
USING (true) WITH CHECK (true);

CREATE POLICY "No public access to chunks"
ON file_chunks FOR ALL TO anon
USING (false);
```

### Step 2: Verify Setup

Go to Table Editor and verify the file_chunks table exists with:
- id (UUID)
- file_id (TEXT, Foreign Key to files.id)
- chunk_index (INTEGER)
- chunk_data (TEXT)
- created_at (TIMESTAMP)

### Step 3: Test

The code is already updated! Just upload a large video file (> 10MB) and it will automatically use chunking.

Check logs for messages like:
- "Large file detected, will use chunking: X chunks"
- "Successfully stored file with chunking"

## How It Works

- Files < 10MB: Stored in files.file_data (legacy method)
- Files > 10MB: Split into chunks, stored in file_chunks table
- Retrieval: Automatically reassembles chunks
- Deletion: CASCADE automatically deletes chunks with file

## Benefits

 Supports files up to 100MB
 No row size limits
 Automatic cleanup
 Backward compatible
