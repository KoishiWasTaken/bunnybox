import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { generateVerificationCode, sendVerificationEmail, isEmailConfigured } from '@/lib/email';

export async function PUT(request: NextRequest) {
  try {
    const { username, password, newEmail } = await request.json();

    if (!username || !password || !newEmail) {
      return NextResponse.json(
        { error: 'Username, password, and new email required' },
        { status: 400 }
      );
    }

    // Validate email format
    if (!newEmail.includes('@')) {
      return NextResponse.json(
        { error: 'Please provide a valid email address' },
        { status: 400 }
      );
    }

    // Verify password
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('username', username)
      .eq('password', password)
      .single();

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid password' },
        { status: 401 }
      );
    }

    // Check if email already in use
    const { data: existingEmail } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', newEmail)
      .neq('id', user.id)
      .single();

    if (existingEmail) {
      return NextResponse.json(
        { error: 'Email already in use by another account' },
        { status: 400 }
      );
    }

    // Generate new verification code
    const verificationCode = generateVerificationCode();

    // Update user email and mark as unverified
    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({
        email: newEmail,
        is_verified: false,
        verification_code: verificationCode,
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('Failed to update email:', updateError);
      return NextResponse.json(
        { error: 'Failed to update email' },
        { status: 500 }
      );
    }

    // Send verification email to new address
    if (isEmailConfigured()) {
      await sendVerificationEmail(newEmail, user.username, verificationCode).catch(err => {
        console.error('Failed to send verification email:', err);
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Email updated! Please check your inbox for a verification code.',
    });
  } catch (error) {
    console.error('Change email error:', error);
    return NextResponse.json(
      { error: 'Failed to change email' },
      { status: 500 }
    );
  }
}
