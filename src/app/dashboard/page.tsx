'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatFileSize, getTimeUntilDeletion } from '@/lib/validation';
import Link from 'next/link';
import { toast } from 'sonner';
import { Footer } from '@/components/Footer';
import { Navigation } from '@/components/Navigation';
import { ActivationPopup } from '@/components/ActivationPopup';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface UserFile {
  id: string;
  filename: string;
  filesize: number;
  uploadDate: string;
  deleteAt: string | null;
  deleteDuration: string;
  uniqueVisitors: number;
  downloadCount: number;
}

export default function DashboardPage() {
  const { user, isLoading, signOut } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();
  const [files, setFiles] = useState<UserFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [fileSearch, setFileSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchFiles = useCallback(async () => {
    if (!user) return;

    try {
      const response = await fetch(`/api/user/files?userId=${user.id}`);
      const data = await response.json();

      if (response.ok) {
        setFiles(data.files);
      }
    } catch (error) {
      toast.error(t.dashboard.failedToLoad);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/');
      return;
    }

    if (user) {
      fetchFiles();
    }
  }, [user, isLoading, router, fetchFiles]);

  const handleDelete = async (fileId: string) => {
    if (!user) return;

    if (!confirm('Are you sure you want to delete this file?')) {
      return;
    }

    try {
      const response = await fetch(`/api/files/${fileId}/delete`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      });

      if (response.ok) {
        toast.success(t.dashboard.fileDeleted);
        setFiles(files.filter(f => f.id !== fileId));
      } else {
        const data = await response.json();
        throw new Error(data.error);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t.dashboard.deleteFailed);
    }
  };

  const copyLink = (fileId: string) => {
    const url = `${window.location.origin}/f/${fileId}`;
    navigator.clipboard.writeText(url);
    toast.success(t.home.linkCopied);
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bunny-gradient">
        <Navigation />
        <div className="flex items-center justify-center py-32">
          <div className="text-2xl font-bold text-black dark:text-white">Loading...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

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

      <div className="max-w-6xl mx-auto p-8">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent mb-2">
                {t.dashboard.myFiles}
              </h1>
              <p className="text-lg text-black dark:text-white">Welcome back, {user.username}!</p>
            </div>
            <div className="flex gap-3">
              {user.username === 'koishi' && (
                <Link href="/admin/panel">
                  <Button className="bunny-button bg-orange-400 dark:bg-orange-900/50 hover:bg-orange-500 dark:hover:bg-orange-800/50 text-orange-900 dark:text-orange-200">
                    Admin Panel
                  </Button>
                </Link>
              )}
              <Link href="/">
                <Button className="bunny-button bg-pink-300 dark:bg-pink-900/50 hover:bg-pink-400 dark:hover:bg-pink-800/50 text-pink-900 dark:text-pink-200">
                  Upload New File
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {files.length === 0 ? (
          <Card className="bunny-card p-12 text-center">
            <h2 className="text-2xl font-bold text-black dark:text-white mb-4">{t.dashboard.noFiles}</h2>
            <p className="text-black dark:text-white mb-6">{t.dashboard.uploadFirst}</p>
            <Link href="/">
              <Button className="bunny-button bg-gradient-to-r from-pink-400 to-purple-400 hover:from-pink-500 hover:to-purple-500 text-white">
                {t.home.upload}
              </Button>
            </Link>
          </Card>
        ) : (
          <>
            {/* Search Bar */}
            <div className="mb-4 flex justify-end">
              <div className="w-80">
                <Input
                  type="text"
                  placeholder="Search by filename..."
                  value={fileSearch}
                  onChange={(e) => {
                    setFileSearch(e.target.value);
                    setCurrentPage(1); // Reset to page 1 when searching
                  }}
                  className="bunny-input"
                />
              </div>
            </div>

            <Card className="bunny-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-white/60 dark:bg-black/30 border-b-2 border-pink-200 dark:border-pink-900/30">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-bold text-gray-800 dark:text-gray-200">Filename</th>
                      <th className="px-4 py-3 text-left text-sm font-bold text-gray-800 dark:text-gray-200">Size</th>
                      <th className="px-4 py-3 text-left text-sm font-bold text-gray-800 dark:text-gray-200">Uploaded</th>
                      <th className="px-4 py-3 text-left text-sm font-bold text-gray-800 dark:text-gray-200">Visitors</th>
                      <th className="px-4 py-3 text-left text-sm font-bold text-gray-800 dark:text-gray-200">Downloads</th>
                      <th className="px-4 py-3 text-left text-sm font-bold text-gray-800 dark:text-gray-200">Expires</th>
                      <th className="px-4 py-3 text-left text-sm font-bold text-gray-800 dark:text-gray-200">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      const filteredFiles = files.filter(file =>
                        file.filename.toLowerCase().includes(fileSearch.toLowerCase())
                      );
                      const paginatedFiles = filteredFiles.slice(
                        (currentPage - 1) * itemsPerPage,
                        currentPage * itemsPerPage
                      );
                      return paginatedFiles.map((file, index) => (
                      <tr
                        key={file.id}
                        className={`border-b border-pink-100 dark:border-pink-900/20 hover:bg-white/40 dark:hover:bg-black/20 transition-colors ${
                          index % 2 === 0 ? 'bg-white/20 dark:bg-black/10' : ''
                        }`}
                      >
                        <td className="px-4 py-3">
                          <div className="max-w-xs truncate text-gray-800 dark:text-gray-200 font-medium" title={file.filename}>
                            {file.filename}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-black dark:text-white text-sm whitespace-nowrap">
                          {formatFileSize(file.filesize)}
                        </td>
                        <td className="px-4 py-3 text-black dark:text-white text-sm whitespace-nowrap">
                          {new Date(file.uploadDate).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 text-black dark:text-white text-sm">
                          {file.uniqueVisitors}
                        </td>
                        <td className="px-4 py-3 text-black dark:text-white text-sm">
                          {file.downloadCount}
                        </td>
                        <td className="px-4 py-3 text-black dark:text-white text-sm whitespace-nowrap">
                          {getTimeUntilDeletion(file.deleteAt ? new Date(file.deleteAt) : null)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <Link href={`/f/${file.id}`} target="_blank">
                              <Button
                                className="bunny-button bg-purple-300 dark:bg-purple-900/50 hover:bg-purple-400 dark:hover:bg-purple-800/50 text-purple-900 dark:text-purple-200 px-3 py-1 text-sm h-auto"
                              >
                                View
                              </Button>
                            </Link>
                            <Button
                              onClick={() => copyLink(file.id)}
                              variant="outline"
                              className="bunny-button border-pink-300 dark:border-pink-900/30 text-pink-700 dark:text-pink-400 px-3 py-1 text-sm h-auto"
                            >
                              Copy
                            </Button>
                            <Button
                              onClick={() => handleDelete(file.id)}
                              variant="outline"
                              className="bunny-button border-red-300 dark:border-red-900/30 text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/30 px-3 py-1 text-sm h-auto"
                            >
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ));
                    })()}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Pagination */}
            {(() => {
              const filteredFiles = files.filter(file =>
                file.filename.toLowerCase().includes(fileSearch.toLowerCase())
              );
              const totalPages = Math.ceil(filteredFiles.length / itemsPerPage);

              if (filteredFiles.length <= itemsPerPage) return null;

              return (
                <div className="flex justify-center items-center gap-4 mt-6">
                  <Button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="bunny-button bg-pink-300 dark:bg-pink-900/50 hover:bg-pink-400 dark:hover:bg-pink-800/50 text-pink-900 dark:text-pink-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </Button>
                  <span className="text-gray-800 dark:text-gray-200 font-semibold">
                    Page {currentPage} of {totalPages}
                    {fileSearch && ` (${filteredFiles.length} of ${files.length} files)`}
                  </span>
                  <Button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="bunny-button bg-pink-300 dark:bg-pink-900/50 hover:bg-pink-400 dark:hover:bg-pink-800/50 text-pink-900 dark:text-pink-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </Button>
                </div>
              );
            })()}
          </>
        )}

        <Footer />
      </div>

    </div>
  );
}
