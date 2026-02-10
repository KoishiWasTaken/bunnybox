import { NextRequest, NextResponse } from 'next/server';
import { supabase, supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase';
import { validateFileSize, getDeleteDuration, sanitizeFilename, validateFilename } from '@/lib/validation';
import { uploadFileToStorage } from '@/lib/storage';
import { logError, logCritical } from '@/lib/error-logger';

// CRITICAL: Configure route to handle large file uploads
export const maxDuration = 60; // Maximum execution time in seconds (for Pro plan)
export const dynamic = 'force-dynamic'; // Don't cache this route

// NOTE: This route is now LEGACY - new uploads use direct Supabase Storage via
// /api/files/get-upload-url and /api/files/finalize-upload
// Keeping this for backward compatibility testing only

// Helper function to generate unique 8-character file ID
function generateFileId(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Rate limiting helper
async function checkRateLimit(ip: string): Promise<{ allowed: boolean; reason?: string }> {
  const now = new Date();

  // Get or create rate limit record
  const { data: rateLimit } = await supabase
    .from('rate_limits')
    .select('*')
    .eq('ip', ip)
    .single();

  if (!rateLimit) {
    // Create new rate limit record
    await supabase
      .from('rate_limits')
      .insert([{
        ip,
        uploads: [],
        banned_until: null,
        permanent_ban: false,
        ban_count: 0
      }]);
    return { allowed: true };
  }

  // Check if permanently banned
  if (rateLimit.permanent_ban) {
    return { allowed: false, reason: 'This IP address has been permanently banned from using this service.' };
  }

  // Check if temporarily banned
  if (rateLimit.banned_until && new Date(rateLimit.banned_until) > now) {
    return { allowed: false, reason: `Temporarily banned until ${new Date(rateLimit.banned_until).toLocaleString()}` };
  }

  // Filter uploads from last 24 hours (1 day)
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const recentUploads = (rateLimit.uploads || []).filter(
    (upload: string) => new Date(upload) > oneDayAgo
  );

  // Check if too many uploads (100 per day)
  if (recentUploads.length >= 100) {
    const banCount = (rateLimit.ban_count || 0) + 1;

    if (banCount === 1) {
      // First offense: 1 week ban
      const bannedUntil = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      await supabase
        .from('rate_limits')
        .update({
          banned_until: bannedUntil.toISOString(),
          ban_count: banCount
        })
        .eq('ip', ip);
      return { allowed: false, reason: 'Rate limit exceeded (100 uploads per day). Banned for 1 week.' };
    } else {
      // Second offense: Permanent ban + delete associated account and files
      await supabase
        .from('rate_limits')
        .update({
          permanent_ban: true,
          banned_until: null,
          ban_count: banCount
        })
        .eq('ip', ip);

      // Find and delete user account and files associated with this IP
      // Note: This requires tracking IP addresses with user accounts
      // For now, we'll just permanently ban the IP

      return { allowed: false, reason: 'Repeated rate limit violations. This IP address has been permanently banned.' };
    }
  }

  return { allowed: true };
}

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
    console.log('=== Upload Request Started ===');
    console.log('Request method:', request.method);
    console.log('Content-Type:', request.headers.get('content-type'));
    console.log('Content-Length:', request.headers.get('content-length'));

    // Check if Supabase is configured
    if (!isSupabaseConfigured()) {
      console.error('Upload attempt but Supabase is not configured');
      // Fire and forget - don't await
      logCritical(
        new Error('Supabase not configured'),
        {
          route: '/api/files/upload',
          method: 'POST',
          request,
        }
      ).catch(err => console.error('Logging failed:', err));

      return NextResponse.json(
        {
          error: 'Server configuration error. Please set up environment variables. See .same/SETUP-ENVIRONMENT.md for instructions.'
        },
        { status: 500 }
      );
    }

    // Get IP address for rate limiting and ban checking
    const ip = request.headers.get('x-forwarded-for') ||
                request.headers.get('x-real-ip') ||
                'unknown';
    console.log(`IP: ${ip}`);

    // Check if IP is banned
    if (ip !== 'unknown') {
      const { data: ban, error: banError } = await supabase
        .from('ip_bans')
        .select('*')
        .eq('ip_address', ip)
        .single();

      if (ban && !banError) {
        // Check if permanent ban
        if (ban.is_permanent) {
          return NextResponse.json(
            { error: `You have been permanently banned. Reason: ${ban.reason || 'No reason provided'}` },
            { status: 403 }
          );
        }

        // Check if temporary ban is still active
        if (ban.banned_until) {
          const now = new Date();
          const bannedUntil = new Date(ban.banned_until);

          if (bannedUntil > now) {
            const hoursRemaining = Math.ceil((bannedUntil.getTime() - now.getTime()) / (1000 * 60 * 60));
            return NextResponse.json(
              { error: `You have been temporarily banned for ${hoursRemaining} more hours. Reason: ${ban.reason || 'No reason provided'}` },
              { status: 403 }
            );
          }
        }
      }
    }

    // Check rate limit
    const rateLimitCheck = await checkRateLimit(ip);
    if (!rateLimitCheck.allowed) {
      return NextResponse.json(
        { error: rateLimitCheck.reason },
        { status: 429 }
      );
    }

    // Parse form data with error handling
    let formData;
    try {
      console.log('Parsing form data...');
      formData = await request.formData();
      console.log('Form data parsed successfully');
    } catch (formDataError) {
      console.error('Failed to parse form data:', formDataError);
      console.error('Error details:', {
        message: formDataError instanceof Error ? formDataError.message : String(formDataError),
        name: formDataError instanceof Error ? formDataError.name : 'Unknown',
      });

      return NextResponse.json(
        {
          error: 'Failed to parse upload data. The file may be too large or corrupted. Maximum file size is 50MB.'
        },
        { status: 400 }
      );
    }

    const file = formData.get('file') as File;
    const userId = formData.get('userId') as string | null;
    const deleteDuration = formData.get('deleteDuration') as string || '30days';

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    console.log('File extracted from form data:', {
      name: file.name,
      size: file.size,
      type: file.type
    });

    // Validate and sanitize filename
    const filenameValidation = validateFilename(file.name);
    if (!filenameValidation.valid) {
      console.log(`Filename validation failed: ${filenameValidation.error}`);
      return NextResponse.json(
        { error: filenameValidation.error },
        { status: 400 }
      );
    }

    const sanitizedFilename = sanitizeFilename(file.name);
    console.log(`Sanitized filename: ${file.name} -> ${sanitizedFilename}`);

    // Validate file size
    const sizeValidation = validateFileSize(file.size);
    if (!sizeValidation.valid) {
      console.log(`File size validation failed: ${sizeValidation.error}`);
      return NextResponse.json(
        { error: sizeValidation.error },
        { status: 400 }
      );
    }

    // Process file with Supabase Storage
    console.log(`Processing file: ${sanitizedFilename}, Size: ${file.size} bytes, Type: ${file.type || 'unknown'}`);
    const fileSizeInMB = file.size / (1024 * 1024);
    console.log(`File size: ${fileSizeInMB.toFixed(2)}MB`);

    // Get user info and update last activity
    let uploaderUsername = null;
    if (userId) {
      const { data: user } = await supabase
        .from('users')
        .select('username, is_verified, email')
        .eq('id', userId)
        .single();
      uploaderUsername = user?.username || null;

      // Check if user needs verification
      if (user) {
        // If user has an email, they must be verified to upload
        if (user.email && !user.is_verified) {
          return NextResponse.json(
            { error: 'Please verify your email address before uploading files. Check your inbox for the verification code.' },
            { status: 403 }
          );
        }

        // Update last activity timestamp
        await supabase
          .from('users')
          .update({ last_activity: new Date().toISOString() })
          .eq('id', userId);
      }
    }

    // Generate unique file ID
    let fileId = generateFileId();
    let isUnique = false;

    while (!isUnique) {
      const { data: existing } = await supabase
        .from('files')
        .select('id')
        .eq('id', fileId)
        .single();

      if (!existing) {
        isUnique = true;
      } else {
        fileId = generateFileId();
      }
    }

    // Upload file to Supabase Storage
    console.log(`Uploading file to Supabase Storage...`);
    const storageResult = await uploadFileToStorage(fileId, file);

    if (!storageResult.success) {
      console.error('Storage upload failed:', storageResult.error);

      // Log the error
      logError({
        error: new Error(`Storage upload failed: ${storageResult.error}`),
        severity: 'error',
        route: '/api/files/upload',
        method: 'POST',
        userId,
        request,
        context: {
          fileId,
          filename: sanitizedFilename,
          fileSize: file.size,
          operation: 'storage_upload',
        },
      }).catch(err => console.error('Logging failed:', err));

      return NextResponse.json(
        { error: `Failed to upload file: ${storageResult.error}` },
        { status: 500 }
      );
    }

    console.log(`✅ File uploaded to storage: ${storageResult.storagePath}`);

    // Create file record with storage path
    const mimeType = file.type || 'application/octet-stream';
    console.log(`Creating database record with MIME type: ${mimeType}`);

    try {
      const { data: uploadedFile, error } = await supabaseAdmin
        .from('files')
        .insert([{
          id: fileId,
          filename: sanitizedFilename,
          filesize: file.size,
          uploader_id: userId,
          uploader_username: uploaderUsername,
          delete_at: getDeleteDuration(deleteDuration)?.toISOString() || null,
          delete_duration: deleteDuration,
          file_data: null, // No longer storing base64
          mime_type: mimeType,
          unique_visitors: [],
          download_count: 0,
          storage_path: storageResult.storagePath, // NEW: Path in Supabase Storage
          uses_storage: true, // NEW: Flag indicating file is in storage
        }])
        .select()
        .single();

      if (error) {
        console.error('Database insert error:', error);

        // Rollback: Delete file from storage
        console.log('Rolling back storage upload...');
        const { deleteFileFromStorage } = await import('@/lib/storage');
        await deleteFileFromStorage(storageResult.storagePath!);

        // Log the error
        logError({
          error: new Error(`Database insert error: ${error.message}`),
          severity: 'error',
          route: '/api/files/upload',
          method: 'POST',
          userId,
          request,
          context: {
            fileId,
            filename: sanitizedFilename,
            fileSize: file.size,
            errorCode: error.code,
            operation: 'database_insert',
          },
        }).catch(err => console.error('Logging failed:', err));

        return NextResponse.json(
          { error: 'Failed to save file metadata. Upload cancelled.' },
          { status: 500 }
        );
      }

      console.log(`✅ Database record created successfully: ${fileId}`);
    } catch (insertError) {
      console.error('Database insert exception:', insertError);

      // Rollback: Delete file from storage
      console.log('Rolling back storage upload...');
      const { deleteFileFromStorage } = await import('@/lib/storage');
      await deleteFileFromStorage(storageResult.storagePath!);

      // Log the error
      logError({
        error: insertError,
        severity: 'critical',
        route: '/api/files/upload',
        method: 'POST',
        userId,
        request,
        context: {
          fileId,
          filename: sanitizedFilename,
          fileSize: file.size,
          operation: 'database_insert',
        },
      }).catch(err => console.error('Logging failed:', err));

      return NextResponse.json(
        { error: 'Failed to save file metadata. Upload cancelled.' },
        { status: 500 }
      );
    }

    try {
      // Record upload for rate limiting
      await recordUpload(ip);

      const ext = sanitizedFilename.split('.').pop()?.toLowerCase() || '';
      const sharePath = ext ? `/f/${fileId}.${ext}` : `/f/${fileId}`;

      console.log(`=== Upload Successful: ${fileId} ===`);
      return NextResponse.json({
        success: true,
        fileId: fileId,
        url: sharePath,
      });
    } catch (postInsertError) {
      // If anything fails after insert, delete the file to avoid orphaned records
      console.error('Post-insert error, rolling back file:', postInsertError);

      // Delete from storage
      const { deleteFileFromStorage } = await import('@/lib/storage');
      await deleteFileFromStorage(storageResult.storagePath!);

      // Delete from database
      await supabaseAdmin
        .from('files')
        .delete()
        .eq('id', fileId);

      throw postInsertError;
    }
  } catch (error) {
    console.error('=== Upload Failed ===');
    console.error('Upload error:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');

    // Log the error
    logError({
      error,
      severity: 'error',
      route: '/api/files/upload',
      method: 'POST',
      request,
      context: {
        operation: 'upload_general',
      },
    });

    // Ensure we always return a JSON response
    const errorMessage = error instanceof Error
      ? error.message
      : 'Upload failed. Please try again or contact support if the issue persists.';

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
