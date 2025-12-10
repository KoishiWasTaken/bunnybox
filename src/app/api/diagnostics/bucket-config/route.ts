import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Get bucket info
    const { data: buckets, error: bucketsError } = await supabaseAdmin
      .storage
      .listBuckets();

    if (bucketsError) {
      return NextResponse.json({
        error: 'Failed to list buckets',
        details: bucketsError.message,
      }, { status: 500 });
    }

    const filesBucket = buckets?.find(b => b.id === 'files');

    if (!filesBucket) {
      return NextResponse.json({
        error: 'Bucket "files" not found',
        availableBuckets: buckets?.map(b => b.id) || [],
      }, { status: 404 });
    }

    // Check bucket configuration
    const config = {
      bucketId: filesBucket.id,
      bucketName: filesBucket.name,
      isPublic: filesBucket.public,
      fileSizeLimit: filesBucket.file_size_limit,
      allowedMimeTypes: filesBucket.allowed_mime_types,
      created: filesBucket.created_at,
    };

    // Try to create a test signed URL
    let canCreateSignedUrl = false;
    let signedUrlError = null;
    try {
      const { data, error } = await supabaseAdmin.storage
        .from('files')
        .createSignedUploadUrl(`test-${Date.now()}.txt`);

      canCreateSignedUrl = !error;
      if (error) {
        signedUrlError = error.message;
      }
    } catch (e) {
      signedUrlError = e instanceof Error ? e.message : String(e);
    }

    // Check for file size issues
    const warnings = [];

    if (filesBucket.file_size_limit && filesBucket.file_size_limit < 100 * 1024 * 1024) {
      warnings.push(`Bucket file size limit (${filesBucket.file_size_limit} bytes = ${(filesBucket.file_size_limit / 1024 / 1024).toFixed(2)}MB) is less than 100MB`);
    }

    if (!filesBucket.public) {
      warnings.push('Bucket is not public - users cannot access uploaded files');
    }

    if (filesBucket.allowed_mime_types && filesBucket.allowed_mime_types.length > 0) {
      const hasVideoAllowed = filesBucket.allowed_mime_types.some(
        mime => mime.includes('video') || mime === '*'
      );
      if (!hasVideoAllowed) {
        warnings.push('Video files may not be allowed - check allowed_mime_types');
      }
    }

    return NextResponse.json({
      bucket: config,
      tests: {
        canCreateSignedUrl,
        signedUrlError,
      },
      warnings,
      recommendations: warnings.length > 0 ? [
        'Set bucket to public',
        'Set file_size_limit to 100MB (104857600 bytes) or null',
        'Leave allowed_mime_types empty to allow all file types',
      ] : [],
    });
  } catch (error) {
    console.error('Bucket config check error:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : String(error),
    }, { status: 500 });
  }
}
