import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// Check if user is admin (only koishi for now)
function isAdmin(username: string | null): boolean {
  return username === 'koishi';
}

export async function POST(request: NextRequest) {
  try {
    const username = request.headers.get('x-username');

    if (!isAdmin(username)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const { userId, duration, reason, isPermanent } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      );
    }

    // Get user's most recent upload IP
    const { data: files } = await supabaseAdmin
      .from('files')
      .select('id')
      .eq('uploader_id', userId)
      .limit(1);

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'Cannot ban user: no uploads found to determine IP address' },
        { status: 400 }
      );
    }

    // We need to get the IP from rate_limits table
    // Find the IP that uploaded files for this user
    const { data: rateLimits } = await supabaseAdmin
      .from('rate_limits')
      .select('ip, uploads')
      .limit(100);

    const userIp: string | null = null;

    // This is a simplified approach - in production, you'd want to store IP with each file
    // For now, we'll require manual IP input
    return NextResponse.json(
      { error: 'This feature requires IP address to be stored with files. Please provide IP address manually.' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Error banning user:', error);
    return NextResponse.json(
      { error: 'Failed to ban user' },
      { status: 500 }
    );
  }
}

// Alternative: Ban by IP directly
export async function PUT(request: NextRequest) {
  try {
    const username = request.headers.get('x-username');

    if (!isAdmin(username)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const { ipAddress, durationHours, reason, isPermanent } = await request.json();

    if (!ipAddress) {
      return NextResponse.json(
        { error: 'IP address required' },
        { status: 400 }
      );
    }

    let bannedUntil: string | null = null;

    if (!isPermanent && durationHours) {
      const now = new Date();
      bannedUntil = new Date(now.getTime() + durationHours * 60 * 60 * 1000).toISOString();
    }

    // Upsert ban record
    const { error } = await supabaseAdmin
      .from('ip_bans')
      .upsert({
        ip_address: ipAddress,
        banned_until: isPermanent ? null : bannedUntil,
        is_permanent: isPermanent || false,
        reason: reason || 'No reason provided',
        banned_by: username,
      });

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      message: isPermanent
        ? 'IP permanently banned'
        : `IP banned for ${durationHours} hours`
    });
  } catch (error) {
    console.error('Error banning IP:', error);
    return NextResponse.json(
      { error: 'Failed to ban IP' },
      { status: 500 }
    );
  }
}
