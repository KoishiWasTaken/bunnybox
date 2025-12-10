/**
 * Automatic File Restoration Script
 *
 * This script automatically restores database records for files that exist
 * in Supabase Storage but are missing from the database.
 *
 * Usage: bun run scripts/restore-deleted-files.ts <user_id>
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing environment variables!');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const userId = process.argv[2];

if (!userId) {
  console.error('❌ Usage: bun run scripts/restore-deleted-files.ts <user_id>');
  console.error('\nTo find your user ID:');
  console.error('1. Sign in to bunnybox');
  console.error('2. Open browser console (F12)');
  console.error('3. Run: localStorage.getItem("sb-puqcpwznfkpchfxhiglh-auth-token")');
  console.error('4. Look for "user" -> "id" in the JSON\n');
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

async function restoreFiles(userId: string) {
  console.log(`🔧 Starting file restoration for user: ${userId}\n`);

  try {
    // Verify user exists
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, username')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      throw new Error(`User not found: ${userId}`);
    }

    console.log(`✅ User found: ${user.username}\n`);

    // Get all storage files
    const { data: storageFiles, error: storageError } = await supabase
      .storage
      .from('bunnybox-files')
      .list();

    if (storageError) {
      throw new Error(`Failed to list storage files: ${storageError.message}`);
    }

    console.log(`📦 Found ${storageFiles?.length || 0} files in storage\n`);

    // Get existing database files
    const { data: dbFiles, error: dbError } = await supabase
      .from('files')
      .select('storage_path')
      .not('storage_path', 'is', null);

    if (dbError) {
      throw new Error(`Failed to query database: ${dbError.message}`);
    }

    const dbStoragePaths = new Set(dbFiles?.map(f => f.storage_path) || []);

    // Find orphaned files
    const orphanedFiles = (storageFiles as unknown as StorageFile[]).filter(
      file => !dbStoragePaths.has(file.name)
    );

    console.log(`🔎 Found ${orphanedFiles.length} orphaned files\n`);

    if (orphanedFiles.length === 0) {
      console.log('✅ No orphaned files to restore!');
      return;
    }

    // Restore files
    let restored = 0;
    let failed = 0;

    console.log('🚀 Starting restoration...\n');

    for (const file of orphanedFiles) {
      try {
        // Extract filename from storage path
        // Storage path format: "user-id/timestamp-filename"
        const pathParts = file.name.split('/');
        const filename = pathParts.length > 1
          ? pathParts[1].replace(/^\d+-/, '') // Remove timestamp prefix
          : file.name;

        // Create database record
        const { data: newFile, error: insertError } = await supabase
          .from('files')
          .insert({
            filename: filename,
            filesize: file.metadata.size || 0,
            mime_type: file.metadata.mimetype || 'application/octet-stream',
            storage_path: file.name,
            uses_storage: true,
            uploader_id: userId,
            delete_at: null, // Set to never expire
            created_at: file.created_at,
          })
          .select()
          .single();

        if (insertError) {
          console.error(`❌ Failed to restore ${filename}:`, insertError.message);
          failed++;
        } else {
          console.log(`✅ Restored: ${filename} (${file.metadata.size ? (file.metadata.size / 1024 / 1024).toFixed(2) + ' MB' : 'Unknown size'})`);
          restored++;
        }
      } catch (error) {
        console.error(`❌ Error restoring file:`, error);
        failed++;
      }
    }

    console.log('\n📊 Restoration Summary:');
    console.log(`   ✅ Restored: ${restored}`);
    console.log(`   ❌ Failed: ${failed}`);
    console.log(`   📁 Total orphaned: ${orphanedFiles.length}`);

    if (restored > 0) {
      console.log('\n🎉 Files have been restored to your dashboard!');
      console.log('🔗 Visit https://bunnybox.moe/dashboard to view them.');
    }

  } catch (error) {
    console.error('❌ Restoration failed:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

// Run the restoration
restoreFiles(userId);
