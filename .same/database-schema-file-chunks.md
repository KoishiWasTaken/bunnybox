# File Chunks Table Schema

## Overview

To overcome PostgreSQL row size limits, we store large files in chunks across multiple rows. This allows storing files up to the 100MB upload limit without hitting database constraints.

## Table: file_chunks

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
```

## How It Works

### Upload Process
1. File is converted to base64
2. If base64 size > 10MB, split into chunks
3. Store file metadata in files table (without file_data)
4. Store each chunk in file_chunks table with sequential index

### Retrieval Process
1. Fetch file metadata from files table
2. If file_data exists, use it (legacy/small files)
3. If file_data is null, fetch chunks ordered by chunk_index
4. Concatenate chunks to rebuild the complete base64 string

### Chunk Size: 10MB (base64)
- Safe size well below database limits
- 100MB file = ~133MB base64 = ~14 chunks
- Good balance between performance and reliability

## Migration SQL

Run this in Supabase Dashboard → SQL Editor:

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
