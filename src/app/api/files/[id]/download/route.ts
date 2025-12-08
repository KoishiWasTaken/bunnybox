import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { retrieveFileChunks } from '@/lib/file-chunks';
import { getStoragePublicUrl } from '@/lib/storage';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const { data: file, error } = await supabase
    .from('files')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !file) {
    return NextResponse.json(
      { error: 'File not found' },
      { status: 404 }
    );
  }

  // Increment download count
  await supabase
    .from('files')
    .update({ download_count: (file.download_count || 0) + 1 })
    .eq('id', id);

  // For files in Supabase Storage, redirect to the public URL
  if (file.uses_storage && file.storage_path) {
    const storageUrl = getStoragePublicUrl(file.storage_path);
    console.log(`Redirecting to storage URL: ${storageUrl}`);

    // Redirect to the storage URL
    return NextResponse.redirect(storageUrl, 302);
  }

  // Legacy: Handle files stored as base64
  let fileData = file.file_data;

  if (!fileData) {
    // File uses chunking, retrieve and reassemble chunks
    console.log(`Retrieving chunks for download of file ${id}`);
    const chunkResult = await retrieveFileChunks(id);

    if (chunkResult.error || !chunkResult.data) {
      console.error(`Failed to retrieve chunks for file ${id}:`, chunkResult.error);
      return NextResponse.json(
        { error: 'Failed to retrieve file data' },
        { status: 500 }
      );
    }

    fileData = chunkResult.data;
  }

  // Convert base64 to buffer
  const buffer = Buffer.from(fileData, 'base64');

  // Determine if file should be inline (for embeds) or attachment (for downloads)
  const isEmbeddable = file.mime_type && (
    file.mime_type.startsWith('image/') ||
    file.mime_type.startsWith('video/') ||
    file.mime_type.startsWith('audio/')
  );

  // Use inline disposition for embeddable files, attachment for others
  const disposition = isEmbeddable
    ? `inline; filename="${file.filename}"`
    : `attachment; filename="${file.filename}"`;

  // Return file with CORS headers for embed support
  return new NextResponse(buffer, {
    headers: {
      'Content-Type': file.mime_type || 'application/octet-stream',
      'Content-Disposition': disposition,
      'Content-Length': buffer.length.toString(),
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}
