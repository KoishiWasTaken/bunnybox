'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { toast } from 'sonner';
import { formatFileSize, formatStorageSize } from '@/lib/validation';
import Link from 'next/link';
import { Footer } from '@/components/Footer';
import { Navigation } from '@/components/Navigation';
import { ActivationPopup } from '@/components/ActivationPopup';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { UploadProgressBar } from '@/components/UploadProgressBar';

interface Stats {
  totalFiles: number;
  totalUsers: number;
  totalStorageBytes: number;
}

export default function Home() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [file, setFile] = useState<File | null>(null);
  const [deleteDuration, setDeleteDuration] = useState('30days');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(-1); // -1 means not uploading, 0-100 is progress
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [banStatus, setBanStatus] = useState<{
    banned: boolean;
    isPermanent?: boolean;
    reason?: string;
    hoursRemaining?: number;
  } | null>(null);
  const [showBanDialog, setShowBanDialog] = useState(false);

  useEffect(() => {
    fetchStats();
    checkBanStatus();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/stats');
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch stats');
      }
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
      // Don't show error to user, just fail silently
    } finally {
      setLoadingStats(false);
    }
  };

  const checkBanStatus = async () => {
    try {
      const response = await fetch('/api/ban-status');
      const data = await response.json();
      if (data.banned) {
        setBanStatus(data);
        setShowBanDialog(true);
      }
    } catch (error) {
      console.error('Failed to check ban status:', error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setUploadedUrl(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error(t.home.pleaseSelectFile);
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    try {
      // Step 1: Get signed upload URL from our API
      console.log('Step 1: Getting signed upload URL...');
      setUploadProgress(5);
      const urlResponse = await fetch('/api/files/get-upload-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type || 'application/octet-stream',
        }),
      });

      if (!urlResponse.ok) {
        const errorData = await urlResponse.json();
        throw new Error(errorData.error || 'Failed to get upload URL');
      }

      const { fileId, storagePath, signedUrl } = await urlResponse.json();
      console.log(`Step 1 complete: Got upload URL for file ID ${fileId}`);
      setUploadProgress(10);

      // Step 2: Upload file directly to Supabase Storage with progress tracking
      console.log('Step 2: Uploading file directly to Supabase Storage...');
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        // Track upload progress
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            // Progress from 10% to 90% during upload
            const percentComplete = (e.loaded / e.total) * 80 + 10;
            setUploadProgress(Math.round(percentComplete));
          }
        });

        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            console.log('Step 2 complete: File uploaded to storage successfully');
            setUploadProgress(90);
            resolve();
          } else {
            console.error('Storage upload failed:', xhr.responseText);
            reject(new Error('Failed to upload file to storage. Please try again.'));
          }
        });

        xhr.addEventListener('error', () => {
          reject(new Error('Network error during upload. Please try again.'));
        });

        xhr.addEventListener('abort', () => {
          reject(new Error('Upload was cancelled.'));
        });

        xhr.open('PUT', signedUrl);
        xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream');
        xhr.setRequestHeader('x-upsert', 'false');
        xhr.send(file);
      });

      // Step 3: Finalize upload by creating database record
      console.log('Step 3: Finalizing upload (creating database record)...');
      setUploadProgress(95);
      const finalizeResponse = await fetch('/api/files/finalize-upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileId,
          storagePath,
          filename: file.name,
          filesize: file.size,
          mimeType: file.type || 'application/octet-stream',
          userId: user?.id || null,
          deleteDuration,
        }),
      });

      const data = await finalizeResponse.json();

      if (!finalizeResponse.ok) {
        throw new Error(data.error || 'Failed to finalize upload');
      }

      console.log('Step 3 complete: Upload finalized successfully!');
      setUploadProgress(100);

      const fullUrl = `${window.location.origin}${data.url}`;
      setUploadedUrl(fullUrl);
      toast.success(t.home.uploadSuccess);
      setFile(null);

      // Reset file input
      const fileInput = document.getElementById('file-input') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error instanceof Error ? error.message : t.home.uploadFailed);
    } finally {
      setUploading(false);
      // Hide progress bar after a short delay
      setTimeout(() => setUploadProgress(-1), 500);
    }
  };

  return (
    <div className="min-h-screen bunny-gradient">
      <UploadProgressBar progress={uploadProgress} />
      <Navigation />

      {/* Show activation popup for unverified users with email */}
      {user && user.email && !user.is_verified && (
        <ActivationPopup
          username={user.username}
          onActivated={() => window.location.reload()}
        />
      )}

      {/* Show dialog for users without email */}
      {user && !user.email && !user.is_verified && (
        <Dialog open={true} onOpenChange={() => {}}>
          <DialogContent className="bunny-card">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                {t.home.emailRequired}
              </DialogTitle>
              <DialogDescription className="text-black dark:text-white">
                {t.home.emailRequiredDescription}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 mt-4">
              <div className="bg-blue-100 dark:bg-blue-950/30 border-2 border-blue-300 dark:border-blue-900/30 rounded-2xl p-4">
                <p className="text-sm text-blue-900 dark:text-blue-200 mb-2">
                  {t.home.emailRequiredDescription}
                </p>
                <p className="text-sm text-blue-900 dark:text-blue-200">
                  {t.home.goToSettings}
                </p>
              </div>

              <Link href="/settings">
                <Button className="w-full bunny-button bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 hover:from-pink-500 hover:via-purple-500 hover:to-blue-500 text-white">
                  {t.home.goToSettings}
                </Button>
              </Link>
            </div>
          </DialogContent>
        </Dialog>
      )}

      <div className="max-w-4xl mx-auto p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent mb-2">
            {t.home.title}
          </h1>
          <p className="text-lg text-black dark:text-white">{t.home.subtitle}</p>
        </div>

        {/* Upload Card */}
        <Card className="bunny-card p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-6">{t.home.upload}</h2>

          <div className="space-y-6">
            <div>
              <Label htmlFor="file-input" className="text-black dark:text-white font-semibold mb-2 block">
                {t.home.selectFile}
              </Label>
              <Input
                id="file-input"
                type="file"
                onChange={handleFileChange}
                className="bunny-input"
              />
              {file && (
                <p className="mt-2 text-sm text-black dark:text-white">
                  {t.home.selected}: {file.name} ({formatFileSize(file.size)})
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="duration" className="text-black dark:text-white font-semibold mb-2 block">
                {t.home.deleteAfter}
              </Label>
              <Select value={deleteDuration} onValueChange={setDeleteDuration}>
                <SelectTrigger className="bunny-input">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1hour">{t.home.duration1Hour}</SelectItem>
                  <SelectItem value="6hours">{t.home.duration6Hours}</SelectItem>
                  <SelectItem value="12hours">{t.home.duration12Hours}</SelectItem>
                  <SelectItem value="1day">{t.home.duration1Day}</SelectItem>
                  <SelectItem value="2days">{t.home.duration2Days}</SelectItem>
                  <SelectItem value="7days">{t.home.duration7Days}</SelectItem>
                  <SelectItem value="30days">{t.home.duration30Days}</SelectItem>
                  {user && <SelectItem value="never">{t.home.never}</SelectItem>}
                </SelectContent>
              </Select>
              {!user && (
                <p className="mt-2 text-sm text-black dark:text-white">
                  {t.home.signInForPermanent}
                </p>
              )}
            </div>

            <Button
              onClick={handleUpload}
              disabled={!file || uploading}
              className="w-full bunny-button bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 hover:from-pink-500 hover:via-purple-500 hover:to-blue-500 text-white py-6 text-lg"
            >
              {uploading ? t.home.uploading : t.home.upload}
            </Button>
          </div>
        </Card>

        {/* Upload Success */}
        {uploadedUrl && (
          <Card className="bunny-card p-6 mb-6">
            <h3 className="text-xl font-bold text-green-700 dark:text-green-400 mb-3">{t.home.uploadSuccess}</h3>
            <div className="bg-white/80 dark:bg-black/30 rounded-2xl p-4 border-2 border-green-300 dark:border-green-900/30">
              <p className="text-sm text-black dark:text-white mb-2">{t.home.copyLink}:</p>
              <div className="flex gap-2">
                <Input
                  value={uploadedUrl}
                  readOnly
                  className="bunny-input"
                />
                <Button
                  onClick={() => {
                    navigator.clipboard.writeText(uploadedUrl);
                    toast.success(t.home.linkCopied);
                  }}
                  className="bunny-button bg-green-300 dark:bg-green-900/50 hover:bg-green-400 dark:hover:bg-green-800/50 text-green-900 dark:text-green-200"
                >
                  {t.home.copyLink}
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Statistics Section */}
        <Card className="bunny-card p-8">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-6 text-center">
            {t.home.statsTitle}
          </h2>

          {loadingStats ? (
            <div className="text-center text-black dark:text-white">
              {t.home.loading}
            </div>
          ) : stats ? (
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-pink-50 to-purple-50 dark:from-pink-950/20 dark:to-purple-950/20 rounded-xl p-6 border border-pink-200 dark:border-pink-900/30 text-center">
                <p className="text-lg text-black dark:text-white">
                  Hosting <span className="font-bold text-pink-600 dark:text-pink-400">{stats.totalFiles}</span> files for{' '}
                  <span className="font-bold text-purple-600 dark:text-purple-400">{stats.totalUsers}</span> users!
                </p>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-pink-50 dark:from-blue-950/20 dark:to-pink-950/20 rounded-xl p-6 border border-blue-200 dark:border-blue-900/30 text-center">
                <p className="text-lg text-black dark:text-white">
                  Currently storing{' '}
                  <span className="font-bold text-blue-600 dark:text-blue-400">
                    {formatStorageSize(stats.totalStorageBytes)}
                  </span>{' '}
                  worth of files!
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center text-black dark:text-white">
              Statistics unavailable
            </div>
          )}
        </Card>
      </div>

      <Footer />

      {/* Ban Notification Dialog */}
      <Dialog open={showBanDialog} onOpenChange={setShowBanDialog}>
        <DialogContent className="bunny-card">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-red-600 dark:text-red-400">
              Account Banned
            </DialogTitle>
            <DialogDescription className="text-black dark:text-white">
              {banStatus?.isPermanent ? (
                'You have been permanently banned.'
              ) : (
                `You have been temporarily banned for ${banStatus?.hoursRemaining} hours.`
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div className="bg-red-100 dark:bg-red-950/30 border-2 border-red-300 dark:border-red-900/30 rounded-2xl p-4">
              <p className="text-sm font-semibold text-red-800 dark:text-red-400 mb-2">Reason:</p>
              <p className="text-red-900 dark:text-red-200">{banStatus?.reason || 'No reason provided'}</p>
            </div>

            <p className="text-sm text-black dark:text-white">
              You cannot upload files while banned. If you believe this is a mistake, please contact support.
            </p>

            <Button
              onClick={() => setShowBanDialog(false)}
              className="w-full bunny-button bg-red-500 hover:bg-red-600 text-white"
            >
              I Understand
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
