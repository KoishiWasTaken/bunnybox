import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { username, code } = await request.json();

    if (!username || !code) {
      return NextResponse.json(
        { error: 'Username and verification code required' },
        { status: 400 }
      );
    }

    // Get user
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('username', username)
      .single();

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (user.is_verified) {
      return NextResponse.json(
        { error: 'Account already verified' },
        { status: 400 }
      );
    }

    if (!user.verification_code) {
      return NextResponse.json(
        { error: 'No verification code found. Please request a new one.' },
        { status: 400 }
      );
    }

    // Check if code matches (case-insensitive)
    console.log('Verification attempt:', {
      username,
      providedCode: code.toLowerCase(),
      storedCode: user.verification_code.toLowerCase(),
      match: user.verification_code.toLowerCase() === code.toLowerCase()
    });

    if (user.verification_code.toLowerCase() !== code.toLowerCase()) {
      return NextResponse.json(
        { error: 'Invalid verification code' },
        { status: 400 }
      );
    }

    // Mark user as verified
    const { error } = await supabaseAdmin
      .from('users')
      .update({
        is_verified: true,
        verification_code: null // Clear the code
      })
      .eq('id', user.id);

    if (error) {
      console.error('Failed to verify user:', error);
      return NextResponse.json(
        { error: 'Failed to verify account' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Account verified successfully!',
    });
  } catch (error) {
    console.error('Verification error:', error);
    return NextResponse.json(
      { error: 'Verification failed' },
      { status: 500 }
    );
  }
}
