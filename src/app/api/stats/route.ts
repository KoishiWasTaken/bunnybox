import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export async function GET() {
  try {
    // Check if Supabase is configured
    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        { error: 'Server not configured' },
        { status: 500 }
      );
    }

    // Get total file count
    const { count: fileCount, error: fileCountError } = await supabase
      .from('files')
      .select('*', { count: 'exact', head: true });

    if (fileCountError) {
      console.error('Error fetching file count:', fileCountError);
    }

    // Get total user count
    const { count: userCount, error: userCountError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    if (userCountError) {
      console.error('Error fetching user count:', userCountError);
    }

    // Get total storage size (sum of all file sizes)
    const { data: files, error: filesError } = await supabase
      .from('files')
      .select('filesize');

    let totalSize = 0;
    if (files && !filesError) {
      totalSize = files.reduce((sum, file) => sum + (file.filesize || 0), 0);
    } else {
      console.error('Error fetching file sizes:', filesError);
    }

    return NextResponse.json({
      totalFiles: fileCount || 0,
      totalUsers: userCount || 0,
      totalStorageBytes: totalSize,
    });
  } catch (error) {
    console.error('Stats fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}
