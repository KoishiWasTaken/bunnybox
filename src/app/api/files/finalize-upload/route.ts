import { NextRequest, NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/supabase';
import { getDeleteDuration, sanitizeFilename } from '@/lib/validation';
import { logError } from '@/lib/error-logger';

export const dynamic = 'force-dynamic';

async function recordUpload(ip: string) {
  const { data: rateLimit } = await supabase
    .from('rate_limits')
    .select('uploads')
    .eq('ip', ip)
    .single();

  const uploads = [...(rateLimit?.uploads || []), new Date().toISOString()];

  await supabase
    .from('rate_limits')
    .update({ uploads })
    .eq('ip', ip);
}

export async function POST(request: NextRequest) {
  try {
    const { fileId, storagePath, filename, filesize, mimeType, userId, deleteDuration } = await request.json();

    if (!fileId || !storagePath || !filename || !filesize) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get IP for rate limiting
    const ip = request.headers.get('x-forwarded-for') ||
                request.headers.get('x-real-ip') ||
                'unknown';

    // Get user info
    let uploaderUsername = null;
    if (userId) {
      const { data: user } = await supabase
        .from('users')
        .select('username, is_verified, email')
        .eq('id', userId)
        .single();
      uploaderUsername = user?.username || null;

      if (user) {
        if (user.email && !user.is_verified) {
          return NextResponse.json(
            { error: 'Please verify your email address before uploading files.' },
            { status: 403 }
          );
        }

        await supabase
          .from('users')
          .update({ last_activity: new Date().toISOString() })
          .eq('id', userId);
      }
    }

    // Verify file exists in storage
    const { data: fileExists, error: checkError } = await supabaseAdmin.storage
      .from('files')
      .list(fileId);

    if (checkError || !fileExists || fileExists.length === 0) {
      console.error('File not found in storage:', {
        error: checkError,
        fileExists,
        fileId,
        storagePath,
        filename,
        filesize,
      });

      logError({
        error: new Error(`File not found in storage: ${checkError?.message || 'File does not exist'}`),
        severity: 'error',
        route: '/api/files/finalize-upload',
        method: 'POST',
        userId,
        request,
        context: {
          fileId,
          storagePath,
          filename,
          fileSize: filesize,
          checkError: checkError?.message,
          filesInFolder: fileExists?.length || 0,
        },
      }).catch(err => console.error('Logging failed:', err));

      return NextResponse.json(
        { error: 'File upload was not completed. The file may not have finished uploading to storage. Please try again.' },
        { status: 400 }
      );
    }

    // Create database record
    const { data: uploadedFile, error } = await supabaseAdmin
      .from('files')
      .insert([{
        id: fileId,
        filename: sanitizeFilename(filename),
        filesize: filesize,
        uploader_id: userId,
        uploader_username: uploaderUsername,
        delete_at: getDeleteDuration(deleteDuration || '30days')?.toISOString() || null,
        delete_duration: deleteDuration || '30days',
        file_data: null,
        mime_type: mimeType || 'application/octet-stream',
        unique_visitors: [],
        download_count: 0,
        storage_path: storagePath,
        uses_storage: true,
      }])
      .select()
      .single();

    if (error) {
      console.error('Database insert error:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
        fileId,
        filename: sanitizeFilename(filename),
        filesize,
        userId,
        deleteDuration,
        storagePath,
      });

      // Rollback: Delete file from storage
      await supabaseAdmin.storage
        .from('files')
        .remove([storagePath]);

      logError({
        error: new Error(`Database insert error: ${error.message}`),
        severity: 'error',
        route: '/api/files/finalize-upload',
        method: 'POST',
        userId,
        request,
        context: {
          fileId,
          filename: sanitizeFilename(filename),
          fileSize: filesize,
          errorCode: error.code,
          errorDetails: error.details,
          errorHint: error.hint,
        },
      }).catch(err => console.error('Logging failed:', err));

      return NextResponse.json(
        { error: `Failed to save file metadata: ${error.message || 'Unknown database error'}` },
        { status: 500 }
      );
    }

    // Record upload for rate limiting
    await recordUpload(ip);

    console.log(`✅ Upload finalized: ${fileId}`);
    return NextResponse.json({
      success: true,
      fileId: fileId,
      url: `/f/${fileId}`,
    });
  } catch (error) {
    console.error('Finalize upload error:', error);
    return NextResponse.json(
      { error: 'Failed to finalize upload' },
      { status: 500 }
    );
  }
}
