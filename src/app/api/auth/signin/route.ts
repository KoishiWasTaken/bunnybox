import { NextRequest, NextResponse } from 'next/server';
import { supabase, supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase';
import { logError, logWarning } from '@/lib/error-logger';

export async function POST(request: NextRequest) {
  try {
    // Check if Supabase is configured
    if (!isSupabaseConfigured()) {
      console.error('Signin attempt but Supabase is not configured');
      // Don't await - fire and forget to prevent logging from blocking auth
      logError({
        error: new Error('Supabase not configured'),
        severity: 'critical',
        route: '/api/auth/signin',
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

    const { username, password } = await request.json();

    // Get IP address
    const ip = request.headers.get('x-forwarded-for') ||
                request.headers.get('x-real-ip') ||
                'unknown';

    // Allow sign in with username OR email
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .or(`username.eq.${username},email.eq.${username}`)
      .eq('password', password)
      .single();

    if (error || !user) {
      // Log failed login attempt (fire and forget)
      logWarning('Failed login attempt', {
        route: '/api/auth/signin',
        method: 'POST',
        request,
        context: { username },
      }).catch(err => console.error('Logging failed:', err));

      return NextResponse.json(
        { error: 'Invalid username or password. Please check your credentials and try again.' },
        { status: 401 }
      );
    }

    // Update last activity timestamp and IP address (using admin client to bypass RLS)
    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({
        last_activity: new Date().toISOString(),
        ip_address: ip
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('Failed to update user IP and last activity:', updateError);
      // Log but don't fail the sign-in
      logError({
        error: updateError,
        severity: 'warning',
        route: '/api/auth/signin',
        method: 'POST',
        request,
        context: { userId: user.id },
      }).catch(err => console.error('Logging failed:', err));
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
    console.error('Signin request error:', error);

    // Log the error (fire and forget)
    logError({
      error,
      severity: 'error',
      route: '/api/auth/signin',
      method: 'POST',
      request,
    }).catch(err => console.error('Logging failed:', err));

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Sign in failed. Please try again.' },
      { status: 400 }
    );
  }
}
