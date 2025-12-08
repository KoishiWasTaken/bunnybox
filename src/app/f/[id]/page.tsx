'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { formatFileSize, getTimeUntilDeletion } from '@/lib/validation';
import Link from 'next/link';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Footer } from '@/components/Footer';
import { Navigation } from '@/components/Navigation';

interface FileInfo {
  id: string;
  filename: string;
  filesize: number;
  uploaderUsername: string;
  uploadDate: string;
  deleteAt: string | null;
  deleteDuration: string;
  uniqueVisitors: number;
  downloadCount: number;
  mimeType: string;
  fileData?: string; // Legacy: base64 data
  storageUrl?: string; // NEW: Supabase Storage URL
  usesStorage?: boolean; // NEW: Flag indicating storage method
}

export default function FilePage() {
  const params = useParams();
  const id = params.id as string;
  const { t } = useLanguage();
  const [fileInfo, setFileInfo] = useState<FileInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDownloadWarning, setShowDownloadWarning] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const [previewExpanded, setPreviewExpanded] = useState(false);

  useEffect(() => {
    const fetchFileInfo = async () => {
      try {
        const response = await fetch(`/api/files/${id}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'File not found');
        }

        setFileInfo(data);

        // Update page title
        if (data.filename) {
          document.title = `${data.filename} | bunnybox`;
        }

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load file');
      } finally {
        setLoading(false);
      }
    };

    fetchFileInfo();
  }, [id]);

  const handleDownloadClick = () => {
    const skipWarning = localStorage.getItem('skipDownloadWarning') === 'true';
    if (skipWarning) {
      proceedWithDownload();
    } else {
      setShowDownloadWarning(true);
    }
  };

  const proceedWithDownload = () => {
    if (dontShowAgain) {
      localStorage.setItem('skipDownloadWarning', 'true');
    }
    setShowDownloadWarning(false);
    window.location.href = `/api/files/${id}/download`;
    toast.success('Download started!');
  };

  const isImageFile = (mimeType: string, filename: string) => {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg', '.ico'];
    const lowerFilename = filename.toLowerCase();
    return mimeType.startsWith('image/') || imageExtensions.some(ext => lowerFilename.endsWith(ext));
  };

  const isTextFile = (mimeType: string, filename: string) => {
    const textExtensions = ['.txt', '.json', '.xml', '.html', '.css', '.js', '.ts', '.tsx', '.jsx', '.py', '.java', '.c', '.cpp', '.h', '.md', '.yml', '.yaml', '.toml', '.ini', '.cfg', '.conf', '.log', '.csv'];
    const lowerFilename = filename.toLowerCase();
    return mimeType.startsWith('text/') || textExtensions.some(ext => lowerFilename.endsWith(ext));
  };

  const isAudioFile = (mimeType: string, filename: string) => {
    const audioExtensions = ['.mp3', '.wav', '.ogg', '.flac', '.m4a', '.aac', '.wma', '.opus', '.webm'];
    const lowerFilename = filename.toLowerCase();
    return mimeType.startsWith('audio/') || audioExtensions.some(ext => lowerFilename.endsWith(ext));
  };

  const isVideoFile = (mimeType: string, filename: string) => {
    const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.wmv', '.flv', '.mkv', '.m4v', '.3gp'];
    const lowerFilename = filename.toLowerCase();
    return mimeType.startsWith('video/') || videoExtensions.some(ext => lowerFilename.endsWith(ext));
  };

  const decodeFileData = (base64: string) => {
    try {
      return atob(base64);
    } catch (error) {
      console.error('Error decoding file data:', error);
      return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bunny-gradient">
        <Navigation />
        <div className="flex items-center justify-center py-32">
          <div className="text-2xl font-bold text-black dark:text-white">{t.common.loading}</div>
        </div>
      </div>
    );
  }

  if (error || !fileInfo) {
    return (
      <div className="min-h-screen bunny-gradient">
        <Navigation />
        <div className="flex items-center justify-center p-8">
          <Card className="bunny-card p-8 max-w-md w-full text-center">
            <h1 className="text-3xl font-bold text-red-600 dark:text-red-400 mb-4">{t.fileView.fileNotFound}</h1>
            <p className="text-black dark:text-white mb-6">{error || t.fileView.fileDeleted}</p>
            <Link href="/">
              <Button className="bunny-button bg-pink-300 dark:bg-pink-900/50 hover:bg-pink-400 dark:hover:bg-pink-800/50 text-pink-900 dark:text-pink-200">
                {t.fileView.backToHome}
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bunny-gradient">
      <Navigation />

      <div className="max-w-3xl mx-auto p-8">

        <Card className="bunny-card p-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent mb-2">
              {fileInfo.filename}
            </h1>
            <p className="text-black dark:text-white">Ready to download</p>
          </div>

          <div className="flex justify-center mb-8">
            <Button
              onClick={handleDownloadClick}
              className="bunny-button bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 hover:from-pink-500 hover:via-purple-500 hover:to-blue-500 text-white px-12 py-6 text-lg"
            >
              {t.fileView.download}
            </Button>
          </div>

          {/* File Preview */}
          {(fileInfo.storageUrl || fileInfo.fileData) && isImageFile(fileInfo.mimeType, fileInfo.filename) && (
            <div className="bg-white/80 dark:bg-black/30 rounded-2xl p-6 border-2 border-pink-200 dark:border-pink-900/30 mb-6">
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">{t.fileView.filePreview}</h2>
              <div className="flex justify-center">
                <img
                  src={fileInfo.storageUrl || `data:${fileInfo.mimeType};base64,${fileInfo.fileData}`}
                  alt={fileInfo.filename}
                  className="max-w-full max-h-96 rounded-xl border border-pink-200 dark:border-pink-900/30"
                />
              </div>
            </div>
          )}

          {fileInfo.fileData && isTextFile(fileInfo.mimeType, fileInfo.filename) && (
            <div className="bg-white/80 dark:bg-black/30 rounded-2xl p-6 border-2 border-pink-200 dark:border-pink-900/30 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">Text Preview</h2>
                <button
                  onClick={() => setPreviewExpanded(!previewExpanded)}
                  className="text-sm text-pink-600 dark:text-pink-400 hover:text-pink-800 dark:hover:text-pink-300 font-semibold"
                >
                  {previewExpanded ? 'Collapse' : 'Expand'}
                </button>
              </div>
              <div className={`font-mono text-sm bg-gray-100 dark:bg-gray-900 p-4 rounded-xl overflow-auto ${previewExpanded ? 'max-h-none' : 'max-h-64'}`}>
                <pre className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap break-words">
                  {(() => {
                    const decodedText = decodeFileData(fileInfo.fileData);
                    if (!decodedText) return 'Unable to preview file';
                    if (!previewExpanded && decodedText.length > 1000) {
                      return decodedText.substring(0, 1000) + '\n\n... (truncated, click Expand to view full content)';
                    }
                    return decodedText;
                  })()}
                </pre>
              </div>
            </div>
          )}

          {(fileInfo.storageUrl || fileInfo.fileData) && isAudioFile(fileInfo.mimeType, fileInfo.filename) && (
            <div className="bg-white/80 dark:bg-black/30 rounded-2xl p-6 border-2 border-pink-200 dark:border-pink-900/30 mb-6">
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">Audio Preview</h2>
              <div className="flex justify-center">
                <audio
                  controls
                  className="w-full max-w-lg"
                  preload="metadata"
                  src={fileInfo.storageUrl || `data:${fileInfo.mimeType};base64,${fileInfo.fileData}`}
                >
                  Your browser does not support the audio element.
                </audio>
              </div>
            </div>
          )}

          {(fileInfo.storageUrl || fileInfo.fileData) && isVideoFile(fileInfo.mimeType, fileInfo.filename) && (
            <div className="bg-white/80 dark:bg-black/30 rounded-2xl p-6 border-2 border-pink-200 dark:border-pink-900/30 mb-6">
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">Video Preview</h2>
              <div className="flex justify-center">
                <video
                  controls
                  className="w-full max-w-3xl rounded-xl border border-pink-200 dark:border-pink-900/30"
                  preload="metadata"
                  src={fileInfo.storageUrl || `data:${fileInfo.mimeType};base64,${fileInfo.fileData}`}
                >
                  Your browser does not support the video element.
                </video>
              </div>
            </div>
          )}

          <div className="bg-white/80 dark:bg-black/30 rounded-2xl p-6 border-2 border-pink-200 dark:border-pink-900/30">
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">{t.fileView.filePreview}</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-pink-50 to-purple-50 dark:from-pink-950/20 dark:to-purple-950/20 rounded-xl p-4 border border-pink-200 dark:border-pink-900/30">
                <p className="text-sm text-black dark:text-white font-semibold">{t.fileView.uploadDate}</p>
                <p className="text-lg text-gray-800 dark:text-gray-200 mt-1">
                  {new Date(fileInfo.uploadDate).toLocaleString()}
                </p>
              </div>

              <div className="bg-gradient-to-br from-pink-50 to-purple-50 dark:from-pink-950/20 dark:to-purple-950/20 rounded-xl p-4 border border-pink-200 dark:border-pink-900/30">
                <p className="text-sm text-black dark:text-white font-semibold">{t.fileView.uploadedBy}</p>
                <p className="text-lg text-gray-800 dark:text-gray-200 mt-1">{fileInfo.uploaderUsername || t.fileView.anonymous}</p>
              </div>

              <div className="bg-gradient-to-br from-pink-50 to-purple-50 dark:from-pink-950/20 dark:to-purple-950/20 rounded-xl p-4 border border-pink-200 dark:border-pink-900/30">
                <p className="text-sm text-black dark:text-white font-semibold">{t.fileView.fileSize}</p>
                <p className="text-lg text-gray-800 dark:text-gray-200 mt-1">{formatFileSize(fileInfo.filesize)}</p>
              </div>

              <div className="bg-gradient-to-br from-pink-50 to-purple-50 dark:from-pink-950/20 dark:to-purple-950/20 rounded-xl p-4 border border-pink-200 dark:border-pink-900/30">
                <p className="text-sm text-black dark:text-white font-semibold">{t.fileView.views}</p>
                <p className="text-lg text-gray-800 dark:text-gray-200 mt-1">{fileInfo.uniqueVisitors}</p>
              </div>

              <div className="bg-gradient-to-br from-pink-50 to-purple-50 dark:from-pink-950/20 dark:to-purple-950/20 rounded-xl p-4 border border-pink-200 dark:border-pink-900/30">
                <p className="text-sm text-black dark:text-white font-semibold">{t.fileView.downloads}</p>
                <p className="text-lg text-gray-800 dark:text-gray-200 mt-1">{fileInfo.downloadCount}</p>
              </div>

              <div className="bg-gradient-to-br from-pink-50 to-purple-50 dark:from-pink-950/20 dark:to-purple-950/20 rounded-xl p-4 border border-pink-200 dark:border-pink-900/30">
                <p className="text-sm text-black dark:text-white font-semibold">{t.fileView.deleteAt}</p>
                <p className="text-lg text-gray-800 dark:text-gray-200 mt-1">
                  {getTimeUntilDeletion(fileInfo.deleteAt ? new Date(fileInfo.deleteAt) : null)}
                </p>
              </div>
            </div>
          </div>
        </Card>

        <Footer />
      </div>

      {/* Download Warning Dialog */}
      <Dialog open={showDownloadWarning} onOpenChange={setShowDownloadWarning}>
        <DialogContent className="bunny-card">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-800 dark:text-gray-200">
              Download Warning
            </DialogTitle>
            <DialogDescription className="text-black dark:text-white">
              Be careful when downloading files from strangers or unknown sources
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <p className="text-black dark:text-white">
              This file was uploaded by an external user. Please ensure you trust the source before downloading and opening the file.
            </p>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="dontShowAgain"
                checked={dontShowAgain}
                onChange={(e) => setDontShowAgain(e.target.checked)}
                className="w-4 h-4 text-pink-500 border-gray-300 dark:border-gray-600 rounded focus:ring-pink-500"
              />
              <label htmlFor="dontShowAgain" className="text-sm text-black dark:text-white cursor-pointer">
                Don't show this warning again
              </label>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                onClick={() => setShowDownloadWarning(false)}
                variant="outline"
                className="flex-1 bunny-button border-pink-300 dark:border-pink-900/30"
              >
                Cancel
              </Button>
              <Button
                onClick={proceedWithDownload}
                className="flex-1 bunny-button bg-gradient-to-r from-pink-400 to-purple-400 hover:from-pink-500 hover:to-purple-500 text-white"
              >
                I Understand, Download
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
