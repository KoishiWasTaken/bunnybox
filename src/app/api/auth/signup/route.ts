import { NextRequest, NextResponse } from 'next/server';
import { supabase, supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase';
import { validateUsername, validatePassword } from '@/lib/validation';
import { logError } from '@/lib/error-logger';
import { generateVerificationCode, sendVerificationEmail, isEmailConfigured } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    // Check if Supabase is configured
    if (!isSupabaseConfigured()) {
      console.error('Signup attempt but Supabase is not configured');
      // Fire and forget - don't await
      logError({
        error: new Error('Supabase not configured'),
        severity: 'critical',
        route: '/api/auth/signup',
        method: 'POST',
        request,
      }).catch(err => console.error('Logging failed:', err));

      return NextResponse.json(
        {
          error: 'Server configuration error. Please set up environment variables. See .same/SETUP-ENVIRONMENT.md for instructions.'
        },
        { status: 500 }
      );
    }

    const { username, password, email } = await request.json();

    // Get IP address
    const ip = request.headers.get('x-forwarded-for') ||
                request.headers.get('x-real-ip') ||
                'unknown';

    // Validate username
    const usernameValidation = validateUsername(username);
    if (!usernameValidation.valid) {
      return NextResponse.json(
        { error: usernameValidation.error },
        { status: 400 }
      );
    }

    // Validate password
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { error: passwordValidation.error },
        { status: 400 }
      );
    }

    // Validate email
    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Please provide a valid email address' },
        { status: 400 }
      );
    }

    // Check if username already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('username', username)
      .single();

    if (existingUser) {
      return NextResponse.json(
        { error: 'Username already taken' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const { data: existingEmail } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingEmail) {
      return NextResponse.json(
        { error: 'Email already in use' },
        { status: 400 }
      );
    }

    // Generate verification code
    const verificationCode = generateVerificationCode();

    // Create user with IP address and verification code
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .insert([{
        username,
        password,
        email,
        ip_address: ip,
        verification_code: verificationCode,
        is_verified: false,
        verification_email_count: 1,
        verification_email_last_sent: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      console.error('Signup error details:', JSON.stringify(error, null, 2));

      // Log the error (fire and forget)
      logError({
        error: new Error(`Signup failed: ${error.message}`),
        severity: 'error',
        route: '/api/auth/signup',
        method: 'POST',
        request,
        context: { username },
      }).catch(err => console.error('Logging failed:', err));

      return NextResponse.json(
        { error: `Failed to create account: ${error.message || 'Please try again.'}` },
        { status: 500 }
      );
    }

    // Send verification email (fire and forget - don't block signup)
    if (isEmailConfigured()) {
      sendVerificationEmail(email, username, verificationCode).catch(err => {
        console.error('Failed to send verification email:', err);
        logError({
          error: new Error('Failed to send verification email'),
          severity: 'warning',
          route: '/api/auth/signup',
          method: 'POST',
          request,
          context: { username, email },
        }).catch(() => {});
      });
    } else {
      console.warn('Email not configured - verification email not sent');
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        is_verified: user.is_verified,
      },
    });
  } catch (error) {
    console.error('Signup request error:', error);

    // Log the error (fire and forget)
    logError({
      error,
      severity: 'error',
      route: '/api/auth/signup',
      method: 'POST',
      request,
    }).catch(err => console.error('Logging failed:', err));

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Invalid request. Please check your input.' },
      { status: 400 }
    );
  }
}
