/**
 * Storage Files Recovery Script
 *
 * This script recovers files that exist in Supabase Storage but are missing
 * from the database (e.g., deleted by cleanup bug).
 *
 * Usage: bun run scripts/recover-storage-files.ts
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing environment variables!');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

interface StorageFileMetadata {
  size?: number;
  mimetype?: string;
  cacheControl?: string;
  [key: string]: any;
}

interface StorageFile {
  name: string;
  id: string;
  updated_at: string;
  created_at: string;
  last_accessed_at: string;
  metadata: StorageFileMetadata;
}

async function recoverStorageFiles() {
  console.log('🔍 Scanning Supabase Storage for orphaned files...\n');

  try {
    // 1. Get all files from storage
    const { data: storageFiles, error: storageError } = await supabase
      .storage
      .from('bunnybox-files')
      .list();

    if (storageError) {
      throw new Error(`Failed to list storage files: ${storageError.message}`);
    }

    console.log(`📦 Found ${storageFiles?.length || 0} files in storage\n`);

    if (!storageFiles || storageFiles.length === 0) {
      console.log('No files found in storage.');
      return;
    }

    // 2. Get all files from database
    const { data: dbFiles, error: dbError } = await supabase
      .from('files')
      .select('id, storage_path')
      .not('storage_path', 'is', null);

    if (dbError) {
      throw new Error(`Failed to query database: ${dbError.message}`);
    }

    const dbStoragePaths = new Set(dbFiles?.map(f => f.storage_path) || []);
    console.log(`💾 Found ${dbFiles?.length || 0} files in database with storage_path\n`);

    // 3. Find orphaned files
    const orphanedFiles: StorageFile[] = [];

    for (const file of storageFiles as unknown as StorageFile[]) {
      const storagePath = file.name;
      if (!dbStoragePaths.has(storagePath)) {
        orphanedFiles.push(file);
      }
    }

    console.log(`🔎 Found ${orphanedFiles.length} orphaned files in storage\n`);

    if (orphanedFiles.length === 0) {
      console.log('✅ No orphaned files found. All storage files have database records.');
      return;
    }

    // 4. Display orphaned files
    console.log('📋 Orphaned files:\n');
    orphanedFiles.forEach((file, index) => {
      console.log(`${index + 1}. ${file.name}`);
      console.log(`   Size: ${file.metadata.size ? (file.metadata.size / 1024 / 1024).toFixed(2) + ' MB' : 'Unknown'}`);
      console.log(`   Type: ${file.metadata.mimetype || 'Unknown'}`);
      console.log(`   Created: ${new Date(file.created_at).toLocaleString()}`);
      console.log('');
    });

    // 5. Ask for confirmation (in a real scenario, you'd prompt the user)
    console.log('⚠️  Recovery Process:');
    console.log('These files exist in storage but are missing database records.');
    console.log('To recover them, you need to manually re-create their database entries.\n');

    console.log('📝 Recovery Options:\n');
    console.log('Option 1: Re-upload the files through the UI');
    console.log('   - Sign in to your account');
    console.log('   - Upload the files again with "Never" expiry');
    console.log('   - The system will detect duplicates and link to existing storage files\n');

    console.log('Option 2: Manual database recovery (requires SQL access)');
    console.log('   - You need to know the original uploader_id and file details');
    console.log('   - Contact support with this list of orphaned files\n');

    // 6. Generate recovery SQL (optional - for advanced users)
    console.log('🔧 Advanced: SQL Recovery Template\n');
    console.log('-- WARNING: Only use this if you know the original file details');
    console.log('-- Replace placeholders with actual values\n');

    const exampleFile = orphanedFiles[0];
    console.log(`
-- Example for file: ${exampleFile.name}
INSERT INTO files (
  id,
  filename,
  filesize,
  mime_type,
  storage_path,
  uses_storage,
  uploader_id,
  delete_at,
  created_at
) VALUES (
  gen_random_uuid(),
  'your-original-filename.ext',  -- Replace with original filename
  ${exampleFile.metadata.size || 0},
  '${exampleFile.metadata.mimetype || 'application/octet-stream'}',
  '${exampleFile.name}',
  true,
  'your-user-id-here',  -- Replace with your user ID
  NULL,  -- Or set expiry date
  '${exampleFile.created_at}'
);
`);

    console.log('\n✅ Recovery scan complete!');
    console.log(`\n📊 Summary:`);
    console.log(`   Total storage files: ${storageFiles.length}`);
    console.log(`   Files in database: ${dbFiles?.length || 0}`);
    console.log(`   Orphaned files: ${orphanedFiles.length}`);

  } catch (error) {
    console.error('❌ Recovery failed:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

// Run the recovery
recoverStorageFiles();
