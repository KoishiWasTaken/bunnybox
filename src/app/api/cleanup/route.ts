import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { cleanupOldErrors } from '@/lib/error-logger';

export async function POST(request: NextRequest) {
  try {
    // Verify this is a legitimate cleanup request (could add auth token)
    const authHeader = request.headers.get('authorization');
    const expectedToken = process.env.CLEANUP_API_KEY || 'default-cleanup-key';

    if (authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const now = new Date();
    let deletedFiles = 0;
    let deletedAccounts = 0;
    let deletedOrphanedFiles = 0;
    let deletedErrorLogs = 0;

    // 1. Delete expired files
    const { data: expiredFiles, error: fetchError } = await supabaseAdmin
      .from('files')
      .select('id')
      .not('delete_at', 'is', null)
      .lte('delete_at', now.toISOString());

    if (expiredFiles && expiredFiles.length > 0) {
      const { error: deleteFilesError } = await supabaseAdmin
        .from('files')
        .delete()
        .in('id', expiredFiles.map(f => f.id));

      if (!deleteFilesError) {
        deletedFiles = expiredFiles.length;
      } else {
        console.error('Error deleting expired files:', deleteFilesError);
      }
    }

    // 2. Delete orphaned/failed uploads (files with no data AND no chunks AND no storage)
    const { data: potentialOrphans } = await supabaseAdmin
      .from('files')
      .select('id, file_data, storage_path')
      .or('file_data.is.null,file_data.eq.');

    if (potentialOrphans && potentialOrphans.length > 0) {
      // Check each file to see if it has chunks or storage (these are valid files)
      const trueOrphans: string[] = [];

      for (const file of potentialOrphans) {
        // Skip files that have storage_path (these are valid storage-based files)
        if (file.storage_path) {
          continue;
        }

        // Check if this file has chunks
        const { data: chunks } = await supabaseAdmin
          .from('file_chunks')
          .select('id')
          .eq('file_id', file.id)
          .limit(1);

        // If no chunks exist AND no storage_path, this is truly orphaned
        if (!chunks || chunks.length === 0) {
          trueOrphans.push(file.id);
        }
      }

      if (trueOrphans.length > 0) {
        const { error: deleteOrphanedError } = await supabaseAdmin
          .from('files')
          .delete()
          .in('id', trueOrphans);

        if (!deleteOrphanedError) {
          deletedOrphanedFiles = trueOrphans.length;
          console.log(`Deleted ${deletedOrphanedFiles} orphaned/failed uploads`);
        } else {
          console.error('Error deleting orphaned files:', deleteOrphanedError);
        }
      }
    }

    // 3. Delete inactive accounts (6 months)
    const sixMonthsAgo = new Date(now.getTime() - 6 * 30 * 24 * 60 * 60 * 1000);

    const { data: inactiveUsers, error: inactiveError } = await supabaseAdmin
      .from('users')
      .select('id')
      .lte('last_activity', sixMonthsAgo.toISOString());

    if (inactiveUsers && inactiveUsers.length > 0) {
      // Delete files associated with inactive users first
      for (const user of inactiveUsers) {
        await supabaseAdmin
          .from('files')
          .delete()
          .eq('uploader_id', user.id);
      }

      // Delete the users
      const { error: deleteUsersError } = await supabaseAdmin
        .from('users')
        .delete()
        .in('id', inactiveUsers.map(u => u.id));

      if (!deleteUsersError) {
        deletedAccounts = inactiveUsers.length;
      } else {
        console.error('Error deleting inactive users:', deleteUsersError);
      }
    }

    // 4. Clean up old resolved error logs (older than 30 days)
    deletedErrorLogs = await cleanupOldErrors();

    return NextResponse.json({
      success: true,
      deletedFiles,
      deletedOrphanedFiles,
      deletedAccounts,
      deletedErrorLogs,
      timestamp: now.toISOString()
    });

  } catch (error) {
    console.error('Cleanup error:', error);
    return NextResponse.json(
      { error: 'Cleanup failed' },
      { status: 500 }
    );
  }
}
