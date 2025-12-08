import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// Check if user is admin
function isAdmin(username: string | null): boolean {
  return username === 'koishi';
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

    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      );
    }

    // Get user info
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('username')
      .eq('id', userId)
      .single();

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Delete all files uploaded by this user
    const { error: filesDeleteError } = await supabaseAdmin
      .from('files')
      .delete()
      .eq('uploader_id', userId);

    if (filesDeleteError) {
      console.error('Error deleting user files:', filesDeleteError);
      return NextResponse.json(
        { error: 'Failed to delete user files' },
        { status: 500 }
      );
    }

    // Clear user_id from error_logs (or delete them)
    // We'll set user_id to NULL to preserve error logs for debugging
    const { error: errorLogsUpdateError } = await supabaseAdmin
      .from('error_logs')
      .update({ user_id: null })
      .eq('user_id', userId);

    if (errorLogsUpdateError) {
      console.error('Error updating error logs:', errorLogsUpdateError);
      // Continue anyway - this shouldn't block user deletion
    }

    // Delete the user account
    const { error: userDeleteError } = await supabaseAdmin
      .from('users')
      .delete()
      .eq('id', userId);

    if (userDeleteError) {
      console.error('Error deleting user:', userDeleteError);
      return NextResponse.json(
        { error: 'Failed to delete user account' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `User "${user.username}" and all their files have been deleted`,
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}
