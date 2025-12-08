'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { X } from 'lucide-react';

interface ActivationPopupProps {
  username: string;
  onActivated: () => void;
}

export function ActivationPopup({ username, onActivated }: ActivationPopupProps) {
  const [showActivateDialog, setShowActivateDialog] = useState(false);
  const [activationCode, setActivationCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const handleActivate = async () => {
    if (!activationCode || activationCode.length !== 8) {
      toast.error('Please enter a valid 8-character code');
      return;
    }

    setVerifying(true);

    try {
      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          code: activationCode,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message);
        setShowActivateDialog(false);

        // Update user in localStorage to mark as verified
        const storedUser = localStorage.getItem('bunnybox_user');
        if (storedUser) {
          const user = JSON.parse(storedUser);
          user.is_verified = true;
          localStorage.setItem('bunnybox_user', JSON.stringify(user));
        }

        onActivated();
      } else {
        toast.error(data.error);
      }
    } catch (error) {
      console.error('Activation error:', error);
      toast.error('Failed to verify code');
    } finally {
      setVerifying(false);
    }
  };

  const handleResendCode = async () => {
    setResending(true);

    try {
      const response = await fetch('/api/auth/resend-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message);
      } else {
        toast.error(data.error);
      }
    } catch (error) {
      console.error('Resend code error:', error);
      toast.error('Failed to resend code');
    } finally {
      setResending(false);
    }
  };

  if (dismissed) {
    return null;
  }

  return (
    <>
      {/* Persistent banner */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-orange-500 dark:bg-orange-600 text-white py-3 px-4 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <p className="text-sm md:text-base font-medium">
            You must first{' '}
            <button
              onClick={() => setShowActivateDialog(true)}
              className="underline font-bold hover:text-orange-100 transition-colors"
            >
              activate
            </button>{' '}
            your account to use our services. Didn't receive an email?{' '}
            <button
              onClick={handleResendCode}
              disabled={resending}
              className="underline font-bold hover:text-orange-100 transition-colors disabled:opacity-50"
            >
              {resending ? 'Sending...' : 'Get a new code'}
            </button>
            .
          </p>
          <button
            onClick={() => setDismissed(true)}
            className="p-1 hover:bg-orange-600 dark:hover:bg-orange-700 rounded transition-colors flex-shrink-0"
            aria-label="Dismiss"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Spacer to prevent content from hiding behind banner */}
      <div className="h-12 md:h-14" />

      {/* Activation dialog */}
      <Dialog open={showActivateDialog} onOpenChange={setShowActivateDialog}>
        <DialogContent className="bunny-card max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-800 dark:text-gray-200">
              Activate Your Account
            </DialogTitle>
            <DialogDescription className="text-black dark:text-white">
              Enter the 8-character verification code sent to your email
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div>
              <Label htmlFor="activationCode" className="text-black dark:text-white font-semibold">
                Verification Code
              </Label>
              <Input
                id="activationCode"
                value={activationCode}
                onChange={(e) => setActivationCode(e.target.value.toLowerCase())}
                placeholder="xxxxxxxx"
                maxLength={8}
                className="bunny-input mt-2 font-mono text-lg tracking-wider"
                autoFocus
              />
              <p className="text-xs text-black dark:text-white mt-1">
                8 lowercase letters and/or numbers
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => setShowActivateDialog(false)}
                variant="outline"
                className="flex-1 border-pink-300 dark:border-pink-900/30"
              >
                Cancel
              </Button>
              <Button
                onClick={handleActivate}
                disabled={verifying || activationCode.length !== 8}
                className="flex-1 bunny-button bg-pink-500 hover:bg-pink-600 text-white disabled:opacity-50"
              >
                {verifying ? 'Verifying...' : 'Activate'}
              </Button>
            </div>

            <div className="text-center">
              <button
                onClick={handleResendCode}
                disabled={resending}
                className="text-sm text-pink-600 dark:text-pink-400 hover:underline disabled:opacity-50"
              >
                {resending ? 'Sending new code...' : 'Resend verification code'}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
