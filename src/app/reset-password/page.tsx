'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { toast } from 'sonner';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetting, setResetting] = useState(false);
  const [tokenValid, setTokenValid] = useState(true);

  useEffect(() => {
    if (!token) {
      setTokenValid(false);
      toast.error('Invalid reset link');
    }
  }, [token]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (newPassword.length < 8 || newPassword.length > 24) {
      toast.error('Password must be 8-24 characters');
      return;
    }

    setResetting(true);

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message || 'Password reset successfully!');
        setTimeout(() => {
          router.push('/');
        }, 2000);
      } else {
        toast.error(data.error || 'Failed to reset password');
        if (data.error?.includes('expired') || data.error?.includes('Invalid')) {
          setTokenValid(false);
        }
      }
    } catch (error) {
      console.error('Reset password error:', error);
      toast.error('Failed to reset password');
    } finally {
      setResetting(false);
    }
  };

  if (!tokenValid) {
    return (
      <div className="min-h-screen bunny-gradient">
        <Navigation />
        <div className="flex items-center justify-center p-8">
          <Card className="bunny-card p-8 max-w-md w-full text-center">
            <h1 className="text-3xl font-bold text-red-600 dark:text-red-400 mb-4">Invalid Reset Link</h1>
            <p className="text-black dark:text-white mb-6">
              This password reset link is invalid or has expired. Please request a new one.
            </p>
            <Button
              onClick={() => router.push('/')}
              className="bunny-button bg-pink-300 dark:bg-pink-900/50 hover:bg-pink-400 dark:hover:bg-pink-800/50 text-pink-900 dark:text-pink-200 w-full"
            >
              Go to Home
            </Button>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bunny-gradient">
      <Navigation />

      <div className="max-w-md mx-auto p-8">
        <Card className="bunny-card p-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent mb-2">
              Reset Your Password
            </h1>
            <p className="text-black dark:text-white">
              Enter your new password below
            </p>
          </div>

          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <Label htmlFor="newPassword" className="text-black dark:text-white font-semibold">
                New Password
              </Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="8-24 characters"
                required
                className="bunny-input mt-2"
              />
            </div>

            <div>
              <Label htmlFor="confirmPassword" className="text-black dark:text-white font-semibold">
                Confirm New Password
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your password"
                required
                className="bunny-input mt-2"
              />
            </div>

            {newPassword && confirmPassword && newPassword !== confirmPassword && (
              <p className="text-sm text-red-600 dark:text-red-400">
                Passwords do not match
              </p>
            )}

            <Button
              type="submit"
              disabled={resetting || !newPassword || !confirmPassword || newPassword !== confirmPassword}
              className="w-full bunny-button bg-gradient-to-r from-pink-400 to-purple-400 hover:from-pink-500 hover:to-purple-500 text-white disabled:opacity-50"
            >
              {resetting ? 'Resetting Password...' : 'Reset Password'}
            </Button>

            <p className="text-sm text-black dark:text-white text-center mt-4">
              After resetting your password, you'll be redirected to the home page to sign in.
            </p>
          </form>
        </Card>
      </div>

      <Footer />
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bunny-gradient">
        <Navigation />
        <div className="flex items-center justify-center p-8">
          <Card className="bunny-card p-8 max-w-md w-full text-center">
            <p className="text-black dark:text-white">Loading...</p>
          </Card>
        </div>
        <Footer />
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
