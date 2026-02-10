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

  const copyLink = (fileId: string, filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase() || '';
    const path = ext ? `/f/${fileId}.${ext}` : `/f/${fileId}`;
    const url = `${window.location.origin}${path}`;
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

      <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent mb-2">
                {t.dashboard.myFiles}
              </h1>
              <p className="text-base sm:text-lg text-black dark:text-white">{t.dashboard.welcomeBack}, {user.username}!</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              {user.username === 'koishi' && (
                <Link href="/admin/panel">
                  <Button className="w-full sm:w-auto bunny-button bg-orange-400 dark:bg-orange-900/50 hover:bg-orange-500 dark:hover:bg-orange-800/50 text-orange-900 dark:text-orange-200 min-h-[44px]">
                    {t.dashboard.adminPanel}
                  </Button>
                </Link>
              )}
              <Link href="/">
                <Button className="w-full sm:w-auto bunny-button bg-pink-300 dark:bg-pink-900/50 hover:bg-pink-400 dark:hover:bg-pink-800/50 text-pink-900 dark:text-pink-200 min-h-[44px]">
                  {t.dashboard.uploadNewFile}
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {files.length === 0 ? (
          <Card className="bunny-card p-6 sm:p-12 text-center">
            <h2 className="text-xl sm:text-2xl font-bold text-black dark:text-white mb-4">{t.dashboard.noFiles}</h2>
            <p className="text-sm sm:text-base text-black dark:text-white mb-6">{t.dashboard.uploadFirst}</p>
            <Link href="/">
              <Button className="bunny-button bg-gradient-to-r from-pink-400 to-purple-400 hover:from-pink-500 hover:to-purple-500 text-white min-h-[44px]">
                {t.home.upload}
              </Button>
            </Link>
          </Card>
        ) : (
          <>
            {/* Search Bar */}
            <div className="mb-4">
              <div className="w-full sm:w-80 sm:ml-auto">
                <Input
                  type="text"
                  placeholder={t.dashboard.searchPlaceholder}
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
                <table className="w-full min-w-[640px]">
                  <thead className="bg-white/60 dark:bg-black/30 border-b-2 border-pink-200 dark:border-pink-900/30">
                    <tr>
                      <th className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm font-bold text-gray-800 dark:text-gray-200">{t.dashboard.filename}</th>
                      <th className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm font-bold text-gray-800 dark:text-gray-200">{t.dashboard.size}</th>
                      <th className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm font-bold text-gray-800 dark:text-gray-200 hidden md:table-cell">{t.dashboard.uploaded}</th>
                      <th className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm font-bold text-gray-800 dark:text-gray-200 hidden lg:table-cell">{t.dashboard.visitors}</th>
                      <th className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm font-bold text-gray-800 dark:text-gray-200 hidden lg:table-cell">{t.dashboard.downloads}</th>
                      <th className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm font-bold text-gray-800 dark:text-gray-200">{t.dashboard.expires}</th>
                      <th className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm font-bold text-gray-800 dark:text-gray-200">{t.dashboard.actions}</th>
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
                        <td className="px-2 sm:px-4 py-3">
                          <div className="max-w-[120px] sm:max-w-xs truncate text-gray-800 dark:text-gray-200 font-medium text-xs sm:text-sm" title={file.filename}>
                            {file.filename}
                          </div>
                        </td>
                        <td className="px-2 sm:px-4 py-3 text-black dark:text-white text-xs sm:text-sm whitespace-nowrap">
                          {formatFileSize(file.filesize)}
                        </td>
                        <td className="px-2 sm:px-4 py-3 text-black dark:text-white text-xs sm:text-sm whitespace-nowrap hidden md:table-cell">
                          {new Date(file.uploadDate).toLocaleDateString()}
                        </td>
                        <td className="px-2 sm:px-4 py-3 text-black dark:text-white text-xs sm:text-sm hidden lg:table-cell">
                          {file.uniqueVisitors}
                        </td>
                        <td className="px-2 sm:px-4 py-3 text-black dark:text-white text-xs sm:text-sm hidden lg:table-cell">
                          {file.downloadCount}
                        </td>
                        <td className="px-2 sm:px-4 py-3 text-black dark:text-white text-xs sm:text-sm whitespace-nowrap">
                          {getTimeUntilDeletion(file.deleteAt ? new Date(file.deleteAt) : null)}
                        </td>
                        <td className="px-2 sm:px-4 py-3">
                          <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
                            <Link href={`/f/${file.id}`} target="_blank">
                              <Button
                                className="bunny-button bg-purple-300 dark:bg-purple-900/50 hover:bg-purple-400 dark:hover:bg-purple-800/50 text-purple-900 dark:text-purple-200 px-2 sm:px-3 py-1 text-xs sm:text-sm h-auto min-h-[36px]"
                              >
                                {t.dashboard.view}
                              </Button>
                            </Link>
                            <Button
                              onClick={() => copyLink(file.id, file.filename)}
                              variant="outline"
                              className="bunny-button border-pink-300 dark:border-pink-900/30 text-pink-700 dark:text-pink-400 px-2 sm:px-3 py-1 text-xs sm:text-sm h-auto min-h-[36px]"
                            >
                              {t.dashboard.copy}
                            </Button>
                            <Button
                              onClick={() => handleDelete(file.id)}
                              variant="outline"
                              className="bunny-button border-red-300 dark:border-red-900/30 text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/30 px-2 sm:px-3 py-1 text-xs sm:text-sm h-auto min-h-[36px]"
                            >
                              {t.dashboard.delete}
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
