'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
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

interface Stats {
  totalFiles: number;
  totalUsers: number;
  totalStorageBytes: number;
}

export default function Home() {
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [deleteDuration, setDeleteDuration] = useState('30days');
  const [uploading, setUploading] = useState(false);
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
      toast.error('Please select a file');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (user) {
        formData.append('userId', user.id);
      }
      formData.append('deleteDuration', deleteDuration);

      const response = await fetch('/api/files/upload', {
        method: 'POST',
        body: formData,
      });

      // Handle JSON parsing errors
      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        console.error('JSON parsing error:', jsonError);
        console.error('Response status:', response.status);
        console.error('Response statusText:', response.statusText);

        // Provide more specific error messages based on response status
        if (response.status === 502 || response.status === 504) {
          const fileSizeInMB = (file.size / (1024 * 1024)).toFixed(2);
          throw new Error(
            `Upload timed out. Your file (${fileSizeInMB}MB) may be too large for the server to process. ` +
            `Try compressing the file to under 30MB, or contact support at support@bunnybox.moe for help with larger files.`
          );
        } else if (response.status === 413) {
          throw new Error('File is too large for the server to accept. Please try a smaller file.');
        } else {
          throw new Error(
            'Server error during upload. This may be due to file size or server timeout. ' +
            'Please try a smaller file or contact support@bunnybox.moe if the issue persists.'
          );
        }
      }

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      const fullUrl = `${window.location.origin}${data.url}`;
      setUploadedUrl(fullUrl);
      toast.success('File uploaded successfully!');
      setFile(null);

      // Reset file input
      const fileInput = document.getElementById('file-input') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setUploading(false);
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

      {/* Show dialog for users without email */}
      {user && !user.email && !user.is_verified && (
        <Dialog open={true} onOpenChange={() => {}}>
          <DialogContent className="bunny-card">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                Email Required
              </DialogTitle>
              <DialogDescription className="text-black dark:text-white">
                You need to add an email address to upload files
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 mt-4">
              <div className="bg-blue-100 dark:bg-blue-950/30 border-2 border-blue-300 dark:border-blue-900/30 rounded-2xl p-4">
                <p className="text-sm text-blue-900 dark:text-blue-200 mb-2">
                  To upload files, you need to add and verify an email address.
                </p>
                <p className="text-sm text-blue-900 dark:text-blue-200">
                  Go to Settings → Change Email to add your email address.
                </p>
              </div>

              <Link href="/settings">
                <Button className="w-full bunny-button bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 hover:from-pink-500 hover:via-purple-500 hover:to-blue-500 text-white">
                  Go to Settings
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
            bunnybox
          </h1>
          <p className="text-lg text-black dark:text-white">Filehosting for bunnies :3</p>
        </div>

        {/* Upload Card */}
        <Card className="bunny-card p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-6">Upload a File</h2>

          <div className="space-y-6">
            <div>
              <Label htmlFor="file-input" className="text-black dark:text-white font-semibold mb-2 block">
                Choose File (Max 100MB)
              </Label>
              <Input
                id="file-input"
                type="file"
                onChange={handleFileChange}
                className="bunny-input"
              />
              {file && (
                <p className="mt-2 text-sm text-black dark:text-white">
                  Selected: {file.name} ({formatFileSize(file.size)})
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="duration" className="text-black dark:text-white font-semibold mb-2 block">
                Auto-delete after
              </Label>
              <Select value={deleteDuration} onValueChange={setDeleteDuration}>
                <SelectTrigger className="bunny-input">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1hour">1 Hour</SelectItem>
                  <SelectItem value="6hours">6 Hours</SelectItem>
                  <SelectItem value="12hours">12 Hours</SelectItem>
                  <SelectItem value="1day">1 Day</SelectItem>
                  <SelectItem value="2days">2 Days</SelectItem>
                  <SelectItem value="7days">7 Days</SelectItem>
                  <SelectItem value="30days">30 Days (Default)</SelectItem>
                  {user && <SelectItem value="never">Never</SelectItem>}
                </SelectContent>
              </Select>
              {!user && (
                <p className="mt-2 text-sm text-black dark:text-white">
                  Sign in to enable permanent storage
                </p>
              )}
            </div>

            <Button
              onClick={handleUpload}
              disabled={!file || uploading}
              className="w-full bunny-button bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 hover:from-pink-500 hover:via-purple-500 hover:to-blue-500 text-white py-6 text-lg"
            >
              {uploading ? 'Uploading...' : 'Upload File'}
            </Button>
          </div>
        </Card>

        {/* Upload Success */}
        {uploadedUrl && (
          <Card className="bunny-card p-6 mb-6">
            <h3 className="text-xl font-bold text-green-700 dark:text-green-400 mb-3">File Uploaded Successfully!</h3>
            <div className="bg-white/80 dark:bg-black/30 rounded-2xl p-4 border-2 border-green-300 dark:border-green-900/30">
              <p className="text-sm text-black dark:text-white mb-2">Share this link:</p>
              <div className="flex gap-2">
                <Input
                  value={uploadedUrl}
                  readOnly
                  className="bunny-input"
                />
                <Button
                  onClick={() => {
                    navigator.clipboard.writeText(uploadedUrl);
                    toast.success('Link copied!');
                  }}
                  className="bunny-button bg-green-300 dark:bg-green-900/50 hover:bg-green-400 dark:hover:bg-green-800/50 text-green-900 dark:text-green-200"
                >
                  Copy
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Statistics Section */}
        <Card className="bunny-card p-8">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-6 text-center">
            Platform Statistics
          </h2>

          {loadingStats ? (
            <div className="text-center text-black dark:text-white">
              Loading statistics...
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
