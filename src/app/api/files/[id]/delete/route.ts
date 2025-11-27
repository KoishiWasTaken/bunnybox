import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { deleteFileFromStorage } from '@/lib/storage';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { userId } = await request.json();

  // Use admin client to bypass RLS and fetch file
  const { data: file, error: fetchError } = await supabaseAdmin
    .from('files')
    .select('*')
    .eq('id', id)
    .single();

  if (fetchError || !file) {
    console.error('File fetch error:', fetchError);
    return NextResponse.json(
      { error: 'File not found' },
      { status: 404 }
    );
  }

  // Check if user owns the file
  if (file.uploader_id !== userId) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 403 }
    );
  }

  // If file is in storage, delete from storage first
  if (file.uses_storage && file.storage_path) {
    console.log(`Deleting file from storage: ${file.storage_path}`);
    const storageResult = await deleteFileFromStorage(file.storage_path);

    if (!storageResult.success) {
      console.error('Failed to delete from storage:', storageResult.error);
      // Continue with database deletion even if storage delete fails
    }
  }

  // Delete database record (bypasses RLS)
  const { error: deleteError } = await supabaseAdmin
    .from('files')
    .delete()
    .eq('id', id);

  if (deleteError) {
    console.error('Delete error:', deleteError);
    return NextResponse.json(
      { error: 'Failed to delete file' },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
