'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { ActivationPopup } from '@/components/ActivationPopup';
import { toast } from 'sonner';

export default function SettingsPage() {
  const { user, signOut, isLoading } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();

  // Change Email state
  const [newEmail, setNewEmail] = useState('');
  const [emailPassword, setEmailPassword] = useState('');
  const [changingEmail, setChangingEmail] = useState(false);

  // Change Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  // Delete Account state
  const [deleteConfirmUsername, setDeleteConfirmUsername] = useState('');
  const [deleteConfirmPassword, setDeleteConfirmPassword] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Show loading state while auth is being checked
  if (isLoading) {
    return (
      <div className="min-h-screen bunny-gradient">
        <Navigation />
        <div className="flex items-center justify-center py-32">
          <div className="text-2xl font-bold text-black dark:text-white">{t.common.loading}</div>
        </div>
      </div>
    );
  }

  // Redirect if not logged in
  if (!user) {
    router.push('/');
    return null;
  }

  const handleChangeEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setChangingEmail(true);

    try {
      const response = await fetch('/api/settings/change-email', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: user.username,
          password: emailPassword,
          newEmail,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(t.settings.emailUpdated);
        setNewEmail('');
        setEmailPassword('');

        // Update user in localStorage with new email and unverified status
        const updatedUser = {
          ...user,
          email: newEmail,
          is_verified: false
        };
        localStorage.setItem('bunnybox_user', JSON.stringify(updatedUser));

        // Reload to show activation popup
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        toast.error(data.error);
      }
    } catch (error) {
      console.error('Change email error:', error);
      toast.error(t.settings.updateFailed);
    } finally {
      setChangingEmail(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error(t.settings.passwordsNotMatch);
      return;
    }

    setChangingPassword(true);

    try {
      const response = await fetch('/api/settings/change-password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: user.username,
          currentPassword,
          newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(t.settings.passwordUpdated);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        toast.error(data.error);
      }
    } catch (error) {
      console.error('Change password error:', error);
      toast.error(t.settings.updateFailed);
    } finally {
      setChangingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmUsername !== user.username) {
      toast.error(t.settings.updateFailed);
      return;
    }

    setDeleting(true);

    try {
      const response = await fetch('/api/account/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: deleteConfirmUsername,
          password: deleteConfirmPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(t.settings.accountDeleted);
        signOut();
        router.push('/');
      } else {
        toast.error(data.error);
        setDeleting(false);
      }
    } catch (error) {
      console.error('Delete account error:', error);
      toast.error(t.settings.updateFailed);
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bunny-gradient">
      <Navigation />

      {/* Show activation popup for unverified users with email */}
      {user && user.email && !user.is_verified && (
        <ActivationPopup
          username={user.username}
          onActivated={() => window.location.reload()}
        />
      )}

      {/* Show info banner for users without email (on settings page, no blocking dialog) */}
      {user && !user.email && !user.is_verified && (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div className="bg-blue-100 dark:bg-blue-950/30 border-2 border-blue-300 dark:border-blue-900/30 rounded-2xl p-3 sm:p-4">
            <p className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-2">
              📧 {t.settings.emailVerificationRequired}
            </p>
            <p className="text-sm text-blue-900 dark:text-blue-200">
              {t.settings.emailNotVerified}
            </p>
          </div>
        </div>
      )}

      <div className="max-w-3xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent mb-2">
            {t.settings.title}
          </h1>
          <p className="text-sm sm:text-base text-black dark:text-white">
            {t.settings.accountSettings}
          </p>
        </div>

        <div className="space-y-4 sm:space-y-6">
          {/* Change Email */}
          <Card className="bunny-card p-4 sm:p-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">
              {t.settings.changeEmail}
            </h2>
            <p className="text-sm text-black dark:text-white mb-4">
              {user.email ? `${t.settings.email}: ${user.email}` : t.settings.notSet}
            </p>
            <form onSubmit={handleChangeEmail} className="space-y-4">
              <div>
                <Label htmlFor="newEmail" className="text-black dark:text-white">
                  {t.settings.newEmail}
                </Label>
                <Input
                  id="newEmail"
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="bunny-input mt-2"
                />
              </div>
              <div>
                <Label htmlFor="emailPassword" className="text-black dark:text-white">
                  {t.settings.password}
                </Label>
                <Input
                  id="emailPassword"
                  type="password"
                  value={emailPassword}
                  onChange={(e) => setEmailPassword(e.target.value)}
                  placeholder={t.settings.password}
                  required
                  className="bunny-input mt-2"
                />
              </div>
              <Button
                type="submit"
                disabled={changingEmail}
                className="bunny-button bg-pink-500 hover:bg-pink-600 text-white w-full min-h-[44px]"
              >
                {changingEmail ? t.common.loading : t.settings.updateEmail}
              </Button>
              <p className="text-xs text-black dark:text-white">
                {t.settings.emailVerificationRequired}
              </p>
            </form>
          </Card>

          {/* Change Password */}
          <Card className="bunny-card p-4 sm:p-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">
              {t.settings.changePassword}
            </h2>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <Label htmlFor="currentPassword" className="text-black dark:text-white">
                  {t.settings.currentPassword}
                </Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder={t.settings.currentPassword}
                  required
                  className="bunny-input mt-2"
                />
              </div>
              <div>
                <Label htmlFor="newPassword" className="text-black dark:text-white">
                  {t.settings.newPassword}
                </Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder={t.settings.newPassword}
                  required
                  className="bunny-input mt-2"
                />
              </div>
              <div>
                <Label htmlFor="confirmPassword" className="text-black dark:text-white">
                  {t.settings.confirmNewPassword}
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={t.settings.confirmNewPassword}
                  required
                  className="bunny-input mt-2"
                />
              </div>
              <Button
                type="submit"
                disabled={changingPassword}
                className="bunny-button bg-pink-500 hover:bg-pink-600 text-white w-full min-h-[44px]"
              >
                {changingPassword ? t.common.loading : t.settings.updatePassword}
              </Button>
            </form>
          </Card>

          {/* Delete Account */}
          <Card className="bunny-card p-4 sm:p-6 border-2 border-red-300 dark:border-red-900/50">
            <h2 className="text-xl sm:text-2xl font-bold text-red-600 dark:text-red-400 mb-4">
              {t.settings.dangerZone}
            </h2>
            <p className="text-black dark:text-white mb-4">
              {t.settings.deleteAccountWarning}
            </p>

            {!showDeleteConfirm ? (
              <Button
                onClick={() => setShowDeleteConfirm(true)}
                className="bg-red-500 hover:bg-red-600 text-white w-full min-h-[44px]"
              >
                {t.settings.deleteAccountButton}
              </Button>
            ) : (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="deleteUsername" className="text-black dark:text-white">
                    {t.settings.username}
                  </Label>
                  <Input
                    id="deleteUsername"
                    type="text"
                    value={deleteConfirmUsername}
                    onChange={(e) => setDeleteConfirmUsername(e.target.value)}
                    placeholder={user.username}
                    className="bunny-input mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="deletePassword" className="text-black dark:text-white">
                    {t.settings.password}
                  </Label>
                  <Input
                    id="deletePassword"
                    type="password"
                    value={deleteConfirmPassword}
                    onChange={(e) => setDeleteConfirmPassword(e.target.value)}
                    placeholder={t.settings.password}
                    className="bunny-input mt-2"
                  />
                </div>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                  <Button
                    onClick={() => {
                      setShowDeleteConfirm(false);
                      setDeleteConfirmUsername('');
                      setDeleteConfirmPassword('');
                    }}
                    variant="outline"
                    className="flex-1 border-gray-300 dark:border-gray-600 min-h-[44px]"
                  >
                    {t.common.cancel}
                  </Button>
                  <Button
                    onClick={handleDeleteAccount}
                    disabled={deleting}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white min-h-[44px]"
                  >
                    {deleting ? t.common.loading : t.settings.deleteAccount}
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
}
