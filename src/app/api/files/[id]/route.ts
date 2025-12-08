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

  // Track unique visitor
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  const uniqueVisitors = file.unique_visitors || [];

  if (!uniqueVisitors.includes(ip)) {
    await supabase
      .from('files')
      .update({ unique_visitors: [...uniqueVisitors, ip] })
      .eq('id', id);
  }

  // Handle file data based on storage method
  let fileData = null;
  let storageUrl = null;

  if (file.uses_storage && file.storage_path) {
    // File is in Supabase Storage - return public URL
    storageUrl = getStoragePublicUrl(file.storage_path);
    console.log(`File ${id} is in storage: ${storageUrl}`);
  } else if (file.file_data) {
    // Legacy: File uses base64 storage
    fileData = file.file_data;
    console.log(`File ${id} uses legacy base64 storage`);
  } else {
    // Legacy: File uses chunking
    console.log(`Retrieving chunks for file ${id}`);
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

  return NextResponse.json({
    id: file.id,
    filename: file.filename,
    filesize: file.filesize,
    uploaderUsername: file.uploader_username || 'Anonymous',
    uploadDate: file.upload_date,
    deleteAt: file.delete_at,
    deleteDuration: file.delete_duration,
    uniqueVisitors: (file.unique_visitors || []).length,
    downloadCount: file.download_count,
    mimeType: file.mime_type,
    fileData: fileData, // null for storage files
    storageUrl: storageUrl, // NEW: URL for files in Supabase Storage
    usesStorage: file.uses_storage || false, // NEW: Flag indicating storage method
  });
}
