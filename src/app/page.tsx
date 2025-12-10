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
import { X } from 'lucide-react';

interface Stats {
  totalFiles: number;
  totalUsers: number;
  totalStorageBytes: number;
}

interface FileUploadStatus {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  url?: string;
  error?: string;
}

export default function Home() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [files, setFiles] = useState<File[]>([]);
  const [deleteDuration, setDeleteDuration] = useState('30days');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(-1);
  const [fileStatuses, setFileStatuses] = useState<FileUploadStatus[]>([]);
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
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      if (selectedFiles.length > 10) {
        toast.error('You can upload a maximum of 10 files at once');
        return;
      }
      setFiles(selectedFiles);
      setFileStatuses(selectedFiles.map(file => ({
        file,
        progress: 0,
        status: 'pending'
      })));
    }
  };

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
    setFileStatuses(newFiles.map(file => ({
      file,
      progress: 0,
      status: 'pending'
    })));
  };

  const uploadSingleFile = async (file: File, index: number): Promise<string | null> => {
    try {
      // Log upload attempt for debugging
      console.log('Starting upload:', {
        filename: file.name,
        size: file.size,
        sizeMB: (file.size / (1024 * 1024)).toFixed(2) + 'MB',
        type: file.type,
      });

      // Update status to uploading
      setFileStatuses(prev => prev.map((status, i) =>
        i === index ? { ...status, status: 'uploading' as const, progress: 5 } : status
      ));

      // Step 1: Get signed upload URL
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
        console.error('Failed to get upload URL:', {
          status: urlResponse.status,
          error: errorData.error,
          file: file.name,
          size: file.size,
        });
        throw new Error(errorData.error || 'Failed to get upload URL');
      }

      const { fileId, storagePath, signedUrl } = await urlResponse.json();

      setFileStatuses(prev => prev.map((status, i) =>
        i === index ? { ...status, progress: 10 } : status
      ));

      // Step 2: Upload to storage with progress tracking
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const percentComplete = (e.loaded / e.total) * 80 + 10;
            setFileStatuses(prev => prev.map((status, i) =>
              i === index ? { ...status, progress: Math.round(percentComplete) } : status
            ));
          }
        });

        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            setFileStatuses(prev => prev.map((status, i) =>
              i === index ? { ...status, progress: 90 } : status
            ));
            resolve();
          } else {
            console.error('Storage upload failed:', {
              status: xhr.status,
              statusText: xhr.statusText,
              response: xhr.responseText,
              file: file.name,
              size: file.size,
            });
            reject(new Error(`Upload failed (${xhr.status}): ${xhr.statusText || 'Storage error'}`));
          }
        });

        xhr.addEventListener('error', () => {
          console.error('Network error during storage upload:', {
            file: file.name,
            size: file.size,
          });
          reject(new Error('Network error during upload'));
        });

        xhr.addEventListener('timeout', () => {
          console.error('Upload timeout:', {
            file: file.name,
            size: file.size,
          });
          reject(new Error('Upload timeout - file too large or connection too slow'));
        });

        xhr.timeout = 300000; // 5 minute timeout for large files

        xhr.open('PUT', signedUrl);
        xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream');
        xhr.setRequestHeader('x-upsert', 'false');
        xhr.send(file);
      });

      // Step 3: Finalize upload
      setFileStatuses(prev => prev.map((status, i) =>
        i === index ? { ...status, progress: 95 } : status
      ));

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
        console.error('Finalize upload failed:', {
          status: finalizeResponse.status,
          error: data.error,
          file: file.name,
          size: file.size,
          fileId,
          storagePath,
        });
        throw new Error(data.error || 'Failed to finalize upload');
      }

      const fullUrl = `${window.location.origin}${data.url}`;

      setFileStatuses(prev => prev.map((status, i) =>
        i === index ? { ...status, progress: 100, status: 'completed' as const, url: fullUrl } : status
      ));

      return fullUrl;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      setFileStatuses(prev => prev.map((status, i) =>
        i === index ? { ...status, status: 'error' as const, error: errorMessage } : status
      ));
      return null;
    }
  };

  const handleBatchUpload = async () => {
    if (files.length === 0) {
      toast.error(t.home.pleaseSelectFile);
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      // Upload files one by one
      for (let i = 0; i < files.length; i++) {
        await uploadSingleFile(files[i], i);
        // Update overall progress
        setUploadProgress(Math.round(((i + 1) / files.length) * 100));
      }

      const successCount = fileStatuses.filter(s => s.status === 'completed').length;
      const errorCount = fileStatuses.filter(s => s.status === 'error').length;

      if (successCount === files.length) {
        toast.success(`All ${files.length} files uploaded successfully!`);
      } else if (successCount > 0) {
        toast.success(`${successCount} of ${files.length} files uploaded successfully`);
      }

      if (errorCount > 0) {
        toast.error(`${errorCount} file(s) failed to upload`);
      }

    } catch (error) {
      console.error('Batch upload error:', error);
      toast.error('Batch upload failed');
    } finally {
      setUploading(false);
      setTimeout(() => setUploadProgress(-1), 500);
    }
  };

  const resetUpload = () => {
    setFiles([]);
    setFileStatuses([]);
    const fileInput = document.getElementById('file-input') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  const completedUploads = fileStatuses.filter(s => s.status === 'completed');

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

      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent mb-2">
            {t.home.title}
          </h1>
          <p className="text-base sm:text-lg text-black dark:text-white">{t.home.subtitle}</p>
        </div>

        {/* Upload Card */}
        <Card className="bunny-card p-4 sm:p-6 lg:p-8 mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4 sm:mb-6">{t.home.upload}</h2>

          <div className="space-y-6">
            <div>
              <Label htmlFor="file-input" className="text-black dark:text-white font-semibold mb-2 block">
                {t.home.selectFile}
              </Label>
              <div className="relative">
                <input
                  id="file-input"
                  type="file"
                  onChange={handleFileChange}
                  multiple
                  className="hidden"
                />
                <Button
                  type="button"
                  onClick={() => document.getElementById('file-input')?.click()}
                  className="w-full bunny-button bg-pink-200 dark:bg-pink-900/30 hover:bg-pink-300 dark:hover:bg-pink-800/50 text-pink-900 dark:text-pink-200 border-2 border-pink-300 dark:border-pink-900/50 min-h-[44px] justify-center"
                >
                  {files.length === 0
                    ? t.home.chooseFiles
                    : `${files.length} ${t.home.filesSelected}`}
                </Button>
              </div>
              {files.length > 0 && (
                <div className="mt-2 space-y-2">
                  {files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-white/80 dark:bg-black/30 rounded-lg border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-black dark:text-white">{file.name}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">{formatFileSize(file.size)}</span>
                      </div>
                      <Button
                        variant="ghost"
                        onClick={() => removeFile(index)}
                        className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 h-8 w-8 p-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
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

            {/* Individual file upload progress */}
            {uploading && fileStatuses.length > 0 && (
              <div className="space-y-2">
                {fileStatuses.map((status, index) => (
                  <div key={index} className="p-3 bg-white/60 dark:bg-black/20 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-black dark:text-white truncate max-w-[70%]">
                        {status.file.name}
                      </span>
                      <span className={`text-xs font-semibold ${
                        status.status === 'completed' ? 'text-green-600 dark:text-green-400' :
                        status.status === 'error' ? 'text-red-600 dark:text-red-400' :
                        status.status === 'uploading' ? 'text-blue-600 dark:text-blue-400' :
                        'text-gray-600 dark:text-gray-400'
                      }`}>
                        {status.status === 'completed' ? '✓ Complete' :
                         status.status === 'error' ? '✗ Failed' :
                         status.status === 'uploading' ? `${status.progress}%` :
                         'Waiting...'}
                      </span>
                    </div>
                    {status.status === 'uploading' && (
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${status.progress}%` }}
                        />
                      </div>
                    )}
                    {status.status === 'error' && status.error && (
                      <p className="text-xs text-red-600 dark:text-red-400 mt-1">{status.error}</p>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={handleBatchUpload}
                disabled={!files.length || uploading}
                className="flex-1 bunny-button bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 hover:from-pink-500 hover:via-purple-500 hover:to-blue-500 text-white py-4 sm:py-6 text-base sm:text-lg min-h-[44px]"
              >
                {uploading ? t.home.uploading : t.home.upload}
              </Button>
              <Button
                onClick={resetUpload}
                variant="outline"
                className="flex-1 bunny-button border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-950/50 hover:bg-red-100 dark:hover:bg-red-950/70 text-red-700 dark:text-red-400 min-h-[44px]"
              >
                {t.home.clearAll}
              </Button>
            </div>
          </div>
        </Card>

        {/* Upload Success */}
        {completedUploads.length > 0 && (
          <Card className="bunny-card p-4 sm:p-6 mb-6">
            <h3 className="text-lg sm:text-xl font-bold text-green-700 dark:text-green-400 mb-3">
              {completedUploads.length === 1 ? t.home.uploadSuccess : `${completedUploads.length} files uploaded successfully!`}
            </h3>
            <div className="bg-white/80 dark:bg-black/30 rounded-2xl p-3 sm:p-4 border-2 border-green-300 dark:border-green-900/30 space-y-3">
              {completedUploads.map((upload, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-black dark:text-white truncate max-w-[60%]">
                      {upload.file.name}
                    </p>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{formatFileSize(upload.file.size)}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Input
                      value={upload.url || ''}
                      readOnly
                      className="bunny-input flex-1 text-sm"
                    />
                    <Button
                      onClick={() => {
                        navigator.clipboard.writeText(upload.url || '');
                        toast.success(t.home.linkCopied);
                      }}
                      className="bunny-button bg-green-300 dark:bg-green-900/50 hover:bg-green-400 dark:hover:bg-green-800/50 text-green-900 dark:text-green-200 min-h-[44px] sm:w-auto w-full"
                    >
                      {t.home.copyLink}
                    </Button>
                  </div>
                </div>
              ))}
              {completedUploads.length > 1 && (
                <Button
                  onClick={() => {
                    const allUrls = completedUploads.map(u => u.url).join('\n');
                    navigator.clipboard.writeText(allUrls);
                    toast.success(`All ${completedUploads.length} links copied!`);
                  }}
                  className="w-full bunny-button bg-blue-300 dark:bg-blue-900/50 hover:bg-blue-400 dark:hover:bg-blue-800/50 text-blue-900 dark:text-blue-200 min-h-[44px]"
                >
                  Copy All Links
                </Button>
              )}
            </div>
          </Card>
        )}

        {/* Statistics Section */}
        <Card className="bunny-card p-4 sm:p-6 lg:p-8">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4 sm:mb-6 text-center">
            {t.home.statsTitle}
          </h2>

          {loadingStats ? (
            <div className="text-center text-black dark:text-white">
              {t.home.loading}
            </div>
          ) : stats ? (
            <div className="space-y-3 sm:space-y-4">
              <div className="bg-gradient-to-br from-pink-50 to-purple-50 dark:from-pink-950/20 dark:to-purple-950/20 rounded-xl p-4 sm:p-6 border border-pink-200 dark:border-pink-900/30 text-center">
                <p className="text-sm sm:text-base lg:text-lg text-black dark:text-white">
                  {t.home.hostingFiles} <span className="font-bold text-pink-600 dark:text-pink-400">{stats.totalFiles}</span> {t.home.filesFor}{' '}
                  <span className="font-bold text-purple-600 dark:text-purple-400">{stats.totalUsers}</span> {t.home.users}
                </p>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-pink-50 dark:from-blue-950/20 dark:to-pink-950/20 rounded-xl p-4 sm:p-6 border border-blue-200 dark:border-blue-900/30 text-center">
                <p className="text-sm sm:text-base lg:text-lg text-black dark:text-white">
                  {t.home.currentlyStoring}{' '}
                  <span className="font-bold text-blue-600 dark:text-blue-400">
                    {formatStorageSize(stats.totalStorageBytes)}
                  </span>{' '}
                  {t.home.worthOfFiles}
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
