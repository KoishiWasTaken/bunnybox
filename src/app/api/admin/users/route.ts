import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// Check if user is admin (only koishi for now)
function isAdmin(username: string | null): boolean {
  return username === 'koishi';
}

export async function GET(request: NextRequest) {
  try {
    // Get requesting user from header or session
    const username = request.headers.get('x-username');

    if (!isAdmin(username)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Get all users
    const { data: users, error: usersError } = await supabaseAdmin
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (usersError) {
      throw usersError;
    }

    // Get file counts for each user
    const usersWithStats = await Promise.all(
      (users || []).map(async (user) => {
        const { count } = await supabaseAdmin
          .from('files')
          .select('*', { count: 'exact', head: true })
          .eq('uploader_id', user.id);

        return {
          ...user,
          fileCount: count || 0,
        };
      })
    );

    return NextResponse.json({ users: usersWithStats });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}
