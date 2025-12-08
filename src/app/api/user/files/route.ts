import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get('userId');

  if (!userId) {
    return NextResponse.json(
      { error: 'User ID required' },
      { status: 400 }
    );
  }

  const { data: files, error } = await supabase
    .from('files')
    .select('*')
    .eq('uploader_id', userId)
    .order('upload_date', { ascending: false });

  if (error) {
    return NextResponse.json(
      { error: 'Failed to fetch files' },
      { status: 500 }
    );
  }

  return NextResponse.json({
    files: (files || []).map(f => ({
      id: f.id,
      filename: f.filename,
      filesize: f.filesize,
      uploadDate: f.upload_date,
      deleteAt: f.delete_at,
      deleteDuration: f.delete_duration,
      uniqueVisitors: (f.unique_visitors || []).length,
      downloadCount: f.download_count,
    })),
  });
}
