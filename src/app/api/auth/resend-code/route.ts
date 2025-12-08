import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { generateVerificationCode, sendVerificationEmail, isEmailConfigured } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const { username } = await request.json();

    if (!username) {
      return NextResponse.json(
        { error: 'Username required' },
        { status: 400 }
      );
    }

    if (!isEmailConfigured()) {
      return NextResponse.json(
        { error: 'Email service not configured. Please contact support.' },
        { status: 500 }
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

    if (!user.email) {
      return NextResponse.json(
        { error: 'No email address on file. Please add one in your settings.' },
        { status: 400 }
      );
    }

    // Check rate limiting - hard limit of 5 emails ever
    const verificationEmailCount = user.verification_email_count || 0;
    if (verificationEmailCount >= 5) {
      return NextResponse.json(
        { error: 'Email limit reached. Please contact @.koishi on Discord to resolve this issue.' },
        { status: 429 }
      );
    }

    // Check 30-second cooldown
    if (user.verification_email_last_sent) {
      const lastSent = new Date(user.verification_email_last_sent);
      const now = new Date();
      const secondsSinceLastSent = (now.getTime() - lastSent.getTime()) / 1000;

      if (secondsSinceLastSent < 30) {
        const remainingSeconds = Math.ceil(30 - secondsSinceLastSent);
        return NextResponse.json(
          { error: `Please wait ${remainingSeconds} seconds before requesting another verification email.` },
          { status: 429 }
        );
      }
    }

    // Generate new verification code
    const verificationCode = generateVerificationCode();

    // Update user with new code and rate limiting info
    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({
        verification_code: verificationCode,
        verification_email_count: verificationEmailCount + 1,
        verification_email_last_sent: new Date().toISOString()
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('Failed to update verification code:', updateError);
      return NextResponse.json(
        { error: 'Failed to generate new code' },
        { status: 500 }
      );
    }

    // Send verification email
    const emailResult = await sendVerificationEmail(user.email, user.username, verificationCode);

    if (!emailResult.success) {
      return NextResponse.json(
        { error: emailResult.error || 'Failed to send email' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'New verification code sent to your email!',
    });
  } catch (error) {
    console.error('Resend code error:', error);
    return NextResponse.json(
      { error: 'Failed to resend code' },
      { status: 500 }
    );
  }
}
