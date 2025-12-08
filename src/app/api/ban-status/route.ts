import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') ||
                request.headers.get('x-real-ip') ||
                'unknown';

    if (ip === 'unknown') {
      return NextResponse.json({ banned: false });
    }

    // Check if IP is banned
    const { data: ban, error } = await supabase
      .from('ip_bans')
      .select('*')
      .eq('ip_address', ip)
      .single();

    if (error || !ban) {
      return NextResponse.json({ banned: false });
    }

    // Check if permanent ban
    if (ban.is_permanent) {
      return NextResponse.json({
        banned: true,
        isPermanent: true,
        reason: ban.reason,
      });
    }

    // Check if temporary ban is still active
    if (ban.banned_until) {
      const now = new Date();
      const bannedUntil = new Date(ban.banned_until);

      if (bannedUntil > now) {
        const hoursRemaining = Math.ceil((bannedUntil.getTime() - now.getTime()) / (1000 * 60 * 60));
        return NextResponse.json({
          banned: true,
          isPermanent: false,
          reason: ban.reason,
          bannedUntil: ban.banned_until,
          hoursRemaining,
        });
      } else {
        // Ban expired, remove it
        await supabase
          .from('ip_bans')
          .delete()
          .eq('ip_address', ip);

        return NextResponse.json({ banned: false });
      }
    }

    return NextResponse.json({ banned: false });
  } catch (error) {
    console.error('Error checking ban status:', error);
    return NextResponse.json({ banned: false });
  }
}
