'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from './ui/button';
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { toast } from 'sonner';
import { LanguageSelector } from './LanguageSelector';

import { useLanguage } from '@/contexts/LanguageContext';

export function Navigation() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const { user, signIn, signUp, signOut } = useAuth();
  const { t } = useLanguage();
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup' | 'recover' | 'devkey'>('signin');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [devKey, setDevKey] = useState('');
  const [recoveredPassword, setRecoveredPassword] = useState('');
  const [showDevKeyTooltip, setShowDevKeyTooltip] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [sendingReset, setSendingReset] = useState(false);

  const isActive = (path: string) => {
    if (path === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(path);
  };

  const handleAuth = async () => {
    try {
      if (authMode === 'recover') {
        setSendingReset(true);
        const response = await fetch('/api/auth/request-reset', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username }),
        });

        const data = await response.json();

        if (!response.ok) {
          // If user has no email, show dev key option
          if (data.hasEmail === false && data.error) {
            toast.error(data.error);
            setAuthMode('devkey');
            setSendingReset(false);
            return;
          }
          throw new Error(data.error);
        }

        if (data.hasEmail === false) {
          // User doesn't exist or has no email, show dev key option
          setAuthMode('devkey');
          toast.info('This account has no email. Please use dev key recovery.');
        } else {
          // Email sent successfully
          toast.success(data.message || 'Password reset link sent to your email!');
          setResetSent(true);
        }

        setSendingReset(false);
        return;
      }

      if (authMode === 'devkey') {
        const response = await fetch('/api/auth/recover', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, devKey }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error);
        }

        setRecoveredPassword(data.password);
        toast.success('Password retrieved!');
        return;
      }

      if (authMode === 'signin') {
        await signIn(username, password);
        toast.success('Signed in successfully!');
      } else {
        if (password !== confirmPassword) {
          toast.error('Passwords do not match');
          return;
        }
        await signUp(username, password, email);
        toast.success('Account created! Check your email for verification code.');
      }

      setShowAuthDialog(false);
      setUsername('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setResetSent(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Authentication failed');
    }
  };

  return (
    <>
      <nav className="border-b-2 border-pink-200 dark:border-pink-900/30 bg-white/50 dark:bg-black/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex gap-6">
              <Link href="/">
                <button
                  className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                    isActive('/')
                      ? 'bg-pink-300 dark:bg-pink-900/50 text-pink-900 dark:text-pink-200'
                      : 'text-black dark:text-white hover:bg-pink-100 dark:hover:bg-pink-950/30'
                  }`}
                >
                  {t.nav.home}
                </button>
              </Link>
              <Link href="/faq">
                <button
                  className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                    isActive('/faq')
                      ? 'bg-pink-300 dark:bg-pink-900/50 text-pink-900 dark:text-pink-200'
                      : 'text-black dark:text-white hover:bg-pink-100 dark:hover:bg-pink-950/30'
                  }`}
                >
                  {t.nav.faq}
                </button>
              </Link>
              <Link href="/legal">
                <button
                  className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                    isActive('/legal')
                      ? 'bg-pink-300 dark:bg-pink-900/50 text-pink-900 dark:text-pink-200'
                      : 'text-black dark:text-white hover:bg-pink-100 dark:hover:bg-pink-950/30'
                  }`}
                >
                  {t.nav.legal}
                </button>
              </Link>
              <a href="https://ko-fi.com/koishiwastaken" target="_blank" rel="noopener noreferrer">
                <button
                  className="px-4 py-2 rounded-xl font-semibold transition-all text-black dark:text-white hover:bg-pink-100 dark:hover:bg-pink-950/30"
                >
                  {t.nav.donate}
                </button>
              </a>
              {user?.username === 'koishi' && (
                <Link href="/admin/panel">
                  <button
                    className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                      isActive('/admin/panel')
                        ? 'bg-orange-400 dark:bg-orange-900/50 text-orange-900 dark:text-orange-200'
                        : 'text-orange-600 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-950/30'
                    }`}
                  >
                    {t.nav.adminPanel}
                  </button>
                </Link>
              )}
            </div>

            <div className="flex items-center gap-3">
              {user ? (
                <>
                  <span className="text-sm text-black dark:text-white">
                    {user.username}
                  </span>
                  <Link href="/settings">
                    <Button className="bunny-button bg-blue-300 dark:bg-blue-900/50 hover:bg-blue-400 dark:hover:bg-blue-800/50 text-blue-900 dark:text-blue-200">
                      {t.nav.settings}
                    </Button>
                  </Link>
                  <Link href="/dashboard">
                    <Button className="bunny-button bg-purple-300 dark:bg-purple-900/50 hover:bg-purple-400 dark:hover:bg-purple-800/50 text-purple-900 dark:text-purple-200">
                      {t.nav.dashboard}
                    </Button>
                  </Link>
                  <Button
                    onClick={signOut}
                    variant="outline"
                    className="bunny-button border-pink-300 dark:border-pink-900/30"
                  >
                    {t.nav.signOut}
                  </Button>
                </>
              ) : (
                <Button
                  onClick={() => {
                    setAuthMode('signin');
                    setShowAuthDialog(true);
                    setRecoveredPassword('');
                  }}
                  className="bunny-button bg-pink-300 dark:bg-pink-900/50 hover:bg-pink-400 dark:hover:bg-pink-800/50 text-pink-900 dark:text-pink-200"
                >
                  {t.nav.signInSignUp}
                </Button>
              )}
              <LanguageSelector />
              <button
                onClick={toggleTheme}
                className="p-2 rounded-xl bg-pink-200 dark:bg-pink-900/50 hover:bg-pink-300 dark:hover:bg-pink-800/50 transition-all"
                aria-label="Toggle theme"
              >
                {theme === 'light' ? (
                  <svg className="w-5 h-5 text-pink-900" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-pink-200" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Auth Dialog */}
      <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
        <DialogContent className="bunny-card">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-800 dark:text-gray-200">
              {authMode === 'signin' && t.auth.signIn}
              {authMode === 'signup' && t.auth.signUp}
              {authMode === 'recover' && t.auth.resetPassword}
              {authMode === 'devkey' && t.auth.devKeyRecovery}
            </DialogTitle>
            <DialogDescription className="text-black dark:text-white">
              {authMode === 'signin' && t.auth.signInDescription}
              {authMode === 'signup' && t.auth.signUpDescription}
              {authMode === 'recover' && t.auth.resetPasswordDescription}
              {authMode === 'devkey' && t.auth.devKeyDescription}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div>
              <Label htmlFor="username" className="text-black dark:text-white font-semibold">
                {authMode === 'signin' || authMode === 'recover' ? t.auth.username : t.auth.username}
              </Label>
              <Input
                id="username"
                value={username}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
                className="bunny-input mt-1"
                placeholder={
                  authMode === 'signup'
                    ? '3-16 characters, letters/numbers/_/-'
                    : authMode === 'recover'
                    ? 'Enter your username or email'
                    : 'Username or email'
                }
              />
            </div>

            {authMode === 'recover' ? (
              resetSent ? (
                <div className="bg-green-100 dark:bg-green-950/30 border-2 border-green-300 dark:border-green-900/30 rounded-2xl p-4">
                  <p className="text-green-800 dark:text-green-400 font-semibold">Email Sent!</p>
                  <p className="text-sm text-green-700 dark:text-green-300 mt-2">
                    Check your email for a password reset link. The link will expire in 1 hour.
                  </p>
                </div>
              ) : null
            ) : authMode === 'devkey' ? (
              <>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Label htmlFor="devkey" className="text-black dark:text-white font-semibold">
                      Dev Key
                    </Label>
                    <div
                      className="relative cursor-help"
                      onMouseEnter={() => setShowDevKeyTooltip(true)}
                      onMouseLeave={() => setShowDevKeyTooltip(false)}
                    >
                      <svg
                        className="w-4 h-4 text-black dark:text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {showDevKeyTooltip && (
                        <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 text-xs text-white bg-gray-800 rounded-lg whitespace-nowrap z-50">
                          Contact @.koishi on Discord for help!
                        </span>
                      )}
                    </div>
                  </div>
                  <Input
                    id="devkey"
                    type="password"
                    value={devKey}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDevKey(e.target.value)}
                    className="bunny-input mt-1"
                    placeholder="Enter dev key"
                  />
                </div>
                {recoveredPassword && (
                  <div className="bg-green-100 dark:bg-green-950/30 border-2 border-green-300 dark:border-green-900/30 rounded-2xl p-4">
                    <p className="text-green-800 dark:text-green-400 font-semibold">Your password is:</p>
                    <p className="text-lg font-mono text-green-900 dark:text-green-200 mt-1">{recoveredPassword}</p>
                  </div>
                )}
              </>
            ) : (
              <>
                {authMode === 'signup' && (
                  <div>
                    <Label htmlFor="email" className="text-black dark:text-white font-semibold">
                      {t.auth.email} ({t.auth.optional})
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                      className="bunny-input mt-1"
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                )}
                <div>
                  <Label htmlFor="password" className="text-black dark:text-white font-semibold">
                    {t.auth.password}
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                    className="bunny-input mt-1"
                    placeholder={authMode === 'signup' ? '8-24 characters' : 'Your password'}
                  />
                </div>
                {authMode === 'signup' && (
                  <div>
                    <Label htmlFor="confirmPassword" className="text-black dark:text-white font-semibold">
                      {t.auth.confirmPassword}
                    </Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
                      className="bunny-input mt-1"
                      placeholder="Confirm your password"
                    />
                  </div>
                )}
              </>
            )}

            <Button
              onClick={handleAuth}
              disabled={authMode === 'recover' && sendingReset}
              className="w-full bunny-button bg-gradient-to-r from-pink-400 to-purple-400 hover:from-pink-500 hover:to-purple-500 text-white disabled:opacity-50"
            >
              {authMode === 'signin' && t.auth.signInButton}
              {authMode === 'signup' && t.auth.signUpButton}
              {authMode === 'recover' && (sendingReset ? t.common.loading : t.auth.sendResetLink)}
              {authMode === 'devkey' && t.auth.recoverPassword}
            </Button>

            <div className="flex justify-between text-sm">
              {authMode === 'signin' && (
                <>
                  <button
                    onClick={() => {
                      setAuthMode('signup');
                      setRecoveredPassword('');
                      setResetSent(false);
                    }}
                    className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 font-semibold"
                  >
                    {t.auth.switchToSignUp}
                  </button>
                  <button
                    onClick={() => {
                      setAuthMode('recover');
                      setRecoveredPassword('');
                      setResetSent(false);
                    }}
                    className="text-pink-600 dark:text-pink-400 hover:text-pink-800 dark:hover:text-pink-300 font-semibold"
                  >
                    {t.auth.forgotPassword}
                  </button>
                </>
              )}
              {authMode === 'recover' && !resetSent && (
                <button
                  onClick={() => {
                    setAuthMode('devkey');
                    setResetSent(false);
                  }}
                  className="text-sm text-black dark:text-white hover:text-gray-800 dark:hover:text-gray-300"
                >
                  {t.auth.devKeyRecovery}
                </button>
              )}
              {(authMode === 'signup' || authMode === 'recover' || authMode === 'devkey') && (
                <button
                  onClick={() => {
                    setAuthMode('signin');
                    setRecoveredPassword('');
                    setResetSent(false);
                  }}
                  className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 font-semibold"
                >
                  {t.auth.backToSignIn}
                </button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
