import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { generateResetToken, sendPasswordResetEmail, isEmailConfigured } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const { username } = await request.json();

    if (!username) {
      return NextResponse.json(
        { error: 'Username or email required' },
        { status: 400 }
      );
    }

    // Find user by username or email
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('*')
      .or(`username.eq.${username},email.eq.${username}`)
      .single();

    if (!user) {
      // Don't reveal if user exists or not for security
      return NextResponse.json({
        success: true,
        message: 'If an account with that username/email exists, a password reset link has been sent.',
        hasEmail: false,
      });
    }

    // Check if user has an email
    if (!user.email) {
      return NextResponse.json({
        success: false,
        hasEmail: false,
        error: 'This account has no email address. Please use the dev key recovery method.',
      });
    }

    if (!isEmailConfigured()) {
      return NextResponse.json(
        { error: 'Email service not configured. Please contact support.' },
        { status: 500 }
      );
    }

    // Check rate limiting - hard limit of 5 emails ever
    const resetEmailCount = user.reset_email_count || 0;
    if (resetEmailCount >= 5) {
      return NextResponse.json(
        { error: 'Email limit reached. Please contact @.koishi on Discord to resolve this issue.' },
        { status: 429 }
      );
    }

    // Check 30-second cooldown
    if (user.reset_email_last_sent) {
      const lastSent = new Date(user.reset_email_last_sent);
      const now = new Date();
      const secondsSinceLastSent = (now.getTime() - lastSent.getTime()) / 1000;

      if (secondsSinceLastSent < 30) {
        const remainingSeconds = Math.ceil(30 - secondsSinceLastSent);
        return NextResponse.json(
          { error: `Please wait ${remainingSeconds} seconds before requesting another password reset email.` },
          { status: 429 }
        );
      }
    }

    // Generate reset token
    const resetToken = generateResetToken();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

    // Store reset token and update rate limiting info
    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({
        reset_token: resetToken,
        reset_token_expires: expiresAt.toISOString(),
        reset_email_count: resetEmailCount + 1,
        reset_email_last_sent: new Date().toISOString()
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('Failed to store reset token:', updateError);
      return NextResponse.json(
        { error: 'Failed to generate reset link' },
        { status: 500 }
      );
    }

    // Send password reset email
    const emailResult = await sendPasswordResetEmail(user.email, user.username, resetToken);

    if (!emailResult.success) {
      return NextResponse.json(
        { error: emailResult.error || 'Failed to send reset email' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      hasEmail: true,
      message: 'Password reset link has been sent to your email!',
    });
  } catch (error) {
    console.error('Request reset error:', error);
    return NextResponse.json(
      { error: 'Failed to process reset request' },
      { status: 500 }
    );
  }
}
