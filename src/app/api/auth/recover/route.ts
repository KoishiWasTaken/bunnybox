import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const DEV_KEY = 'FEMTANYL';

export async function POST(request: NextRequest) {
  try {
    const { username, devKey } = await request.json();

    // Check dev key
    if (devKey !== DEV_KEY) {
      return NextResponse.json(
        { error: 'Incorrect dev key. Contact @.koishi on Discord for help.' },
        { status: 403 }
      );
    }

    // Find user
    const { data: user, error } = await supabase
      .from('users')
      .select('password')
      .eq('username', username)
      .single();

    if (error || !user) {
      return NextResponse.json(
        { error: 'Username does not exist. Please check the spelling and try again.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      password: user.password,
    });
  } catch (error) {
    console.error('Password recovery error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Password recovery failed. Please try again.' },
      { status: 400 }
    );
  }
}
