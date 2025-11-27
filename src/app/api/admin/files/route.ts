import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// Check if user is admin (only koishi for now)
function isAdmin(username: string | null): boolean {
  return username === 'koishi';
}

export async function GET(request: NextRequest) {
  try {
    const username = request.headers.get('x-username');

    if (!isAdmin(username)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Get all files
    const { data: files, error: filesError } = await supabaseAdmin
      .from('files')
      .select('*')
      .order('upload_date', { ascending: false });

    if (filesError) {
      throw filesError;
    }

    return NextResponse.json({ files: files || [] });
  } catch (error) {
    console.error('Error fetching files:', error);
    return NextResponse.json(
      { error: 'Failed to fetch files' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const username = request.headers.get('x-username');

    if (!isAdmin(username)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const { fileId } = await request.json();

    if (!fileId) {
      return NextResponse.json(
        { error: 'File ID required' },
        { status: 400 }
      );
    }

    // Delete the file
    const { error } = await supabaseAdmin
      .from('files')
      .delete()
      .eq('id', fileId);

    if (error) {
      throw error;
    }

    // Also delete any chunks
    await supabaseAdmin
      .from('file_chunks')
      .delete()
      .eq('file_id', fileId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting file:', error);
    return NextResponse.json(
      { error: 'Failed to delete file' },
      { status: 500 }
    );
  }
}
