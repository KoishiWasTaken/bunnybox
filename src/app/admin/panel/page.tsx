'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { formatFileSize } from '@/lib/validation';
import Link from 'next/link';

interface User {
  id: string;
  username: string;
  email: string | null;
  is_verified: boolean;
  created_at: string;
  last_activity: string;
  ip_address: string | null;
  fileCount: number;
}

interface FileUpload {
  id: string;
  filename: string;
  filesize: number;
  uploader_username: string | null;
  upload_date: string;
  delete_at: string | null;
  mime_type: string;
}

export default function AdminPanel() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [files, setFiles] = useState<FileUpload[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showModerateDialog, setShowModerateDialog] = useState(false);

  // Search state
  const [userSearch, setUserSearch] = useState('');
  const [fileSearch, setFileSearch] = useState('');

  // Pagination state
  const [usersPage, setUsersPage] = useState(1);
  const [filesPage, setFilesPage] = useState(1);
  const itemsPerPage = 10;

  // Ban form state
  const [ipAddress, setIpAddress] = useState('');
  const [banDurationHours, setBanDurationHours] = useState('24');
  const [banReason, setBanReason] = useState('');
  const [isPermanentBan, setIsPermanentBan] = useState(false);

  useEffect(() => {
    // Wait for auth to load
    if (isLoading) {
      return;
    }

    // Check if user is admin
    if (!user || user.username !== 'koishi') {
      router.push('/');
      return;
    }

    // User is admin, fetch data
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isLoading, router]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch users
      const usersRes = await fetch('/api/admin/users', {
        headers: {
          'x-username': user?.username || '',
        },
      });
      const usersData = await usersRes.json();
      if (usersData.users) {
        setUsers(usersData.users);
      }

      // Fetch files
      const filesRes = await fetch('/api/admin/files', {
        headers: {
          'x-username': user?.username || '',
        },
      });
      const filesData = await filesRes.json();
      if (filesData.files) {
        setFiles(filesData.files);
      }
    } catch (error) {
      console.error('Failed to fetch admin data:', error);
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    if (!confirm('Are you sure you want to delete this file?')) {
      return;
    }

    try {
      const response = await fetch('/api/admin/files', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-username': user?.username || '',
        },
        body: JSON.stringify({ fileId }),
      });

      if (response.ok) {
        toast.success('File deleted successfully');
        fetchData();
      } else {
        toast.error('Failed to delete file');
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      toast.error('Failed to delete file');
    }
  };

  const handleModerateUser = (selectedUser: User) => {
    setSelectedUser(selectedUser);
    setIpAddress(selectedUser.ip_address || '');
    setBanDurationHours('24');
    setBanReason('');
    setIsPermanentBan(false);
    setShowModerateDialog(true);
  };

  const handleBanUser = async () => {
    if (!ipAddress) {
      toast.error('Please enter an IP address');
      return;
    }

    if (!isPermanentBan && (!banDurationHours || parseInt(banDurationHours) <= 0)) {
      toast.error('Please enter a valid ban duration');
      return;
    }

    try {
      const response = await fetch('/api/admin/ban', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-username': user?.username || '',
        },
        body: JSON.stringify({
          ipAddress,
          durationHours: parseInt(banDurationHours),
          reason: banReason || 'No reason provided',
          isPermanent: isPermanentBan,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message || 'User banned successfully');
        setShowModerateDialog(false);
        fetchData();
      } else {
        toast.error(data.error || 'Failed to ban user');
      }
    } catch (error) {
      console.error('Error banning user:', error);
      toast.error('Failed to ban user');
    }
  };

  const handleDeleteAccount = async () => {
    if (!selectedUser) return;

    const confirmDelete = window.confirm(
      `Are you sure you want to delete user "${selectedUser.username}" and all their ${selectedUser.fileCount} file(s)? This action cannot be undone and will NOT ban their IP address.`
    );

    if (!confirmDelete) return;

    try {
      const response = await fetch('/api/admin/delete-user', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-username': user?.username || '',
        },
        body: JSON.stringify({
          userId: selectedUser.id,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message || 'User account deleted successfully');
        setShowModerateDialog(false);
        fetchData();
      } else {
        toast.error(data.error || 'Failed to delete user account');
      }
    } catch (error) {
      console.error('Error deleting user account:', error);
      toast.error('Failed to delete user account');
    }
  };

  // Filter users based on search
  const filteredUsers = users.filter((user) => {
    if (!userSearch) return true;
    const search = userSearch.toLowerCase();
    return (
      user.username.toLowerCase().includes(search) ||
      user.email?.toLowerCase().includes(search) ||
      user.ip_address?.toLowerCase().includes(search)
    );
  });

  // Filter files based on search
  const filteredFiles = files.filter((file) => {
    if (!fileSearch) return true;
    const search = fileSearch.toLowerCase();
    return (
      file.filename.toLowerCase().includes(search) ||
      file.uploader_username?.toLowerCase().includes(search)
    );
  });

  // Reset to page 1 when search changes
  useEffect(() => {
    setUsersPage(1);
  }, [userSearch]);

  useEffect(() => {
    setFilesPage(1);
  }, [fileSearch]);

  // Pagination calculations
  const totalUsersPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const totalFilesPages = Math.ceil(filteredFiles.length / itemsPerPage);

  const paginatedUsers = filteredUsers.slice(
    (usersPage - 1) * itemsPerPage,
    usersPage * itemsPerPage
  );

  const paginatedFiles = filteredFiles.slice(
    (filesPage - 1) * itemsPerPage,
    filesPage * itemsPerPage
  );

  // Show loading while auth is being checked
  if (isLoading) {
    return (
      <div className="min-h-screen bunny-gradient">
        <Navigation />
        <div className="flex items-center justify-center py-32">
          <div className="text-2xl font-bold text-black dark:text-white">Loading...</div>
        </div>
      </div>
    );
  }

  // Only show nothing if definitely not admin (after loading completes)
  if (!user || user.username !== 'koishi') {
    return null;
  }

  return (
    <div className="min-h-screen bunny-gradient">
      <Navigation />

      <div className="max-w-7xl mx-auto p-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent mb-2">
            Admin Panel
          </h1>
          <p className="text-black dark:text-white">
            Manage users and files
          </p>
        </div>

        {loading ? (
          <Card className="bunny-card p-8 text-center">
            <p className="text-black dark:text-white">Loading...</p>
          </Card>
        ) : (
          <div className="space-y-8">
            {/* Users Section */}
            <Card className="bunny-card p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                  Users ({filteredUsers.length}{userSearch && ` of ${users.length}`})
                </h2>
                <div className="w-64">
                  <Input
                    type="text"
                    placeholder="Search by username, email, or IP..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="bunny-input"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-pink-200 dark:border-pink-900/30">
                      <th className="text-left p-3 font-bold text-gray-800 dark:text-gray-200">Username</th>
                      <th className="text-left p-3 font-bold text-gray-800 dark:text-gray-200">Email</th>
                      <th className="text-left p-3 font-bold text-gray-800 dark:text-gray-200">IP Address</th>
                      <th className="text-left p-3 font-bold text-gray-800 dark:text-gray-200">Created</th>
                      <th className="text-left p-3 font-bold text-gray-800 dark:text-gray-200">Last Activity</th>
                      <th className="text-left p-3 font-bold text-gray-800 dark:text-gray-200">Files</th>
                      <th className="text-left p-3 font-bold text-gray-800 dark:text-gray-200">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedUsers.map((u) => (
                      <tr key={u.id} className="border-b border-pink-100 dark:border-pink-900/20">
                        <td className="p-3 text-black dark:text-white font-semibold">{u.username}</td>
                        <td className="p-3 text-black dark:text-white text-sm">
                          {u.email ? (
                            <div className="flex items-center gap-2">
                              <a
                                href={`mailto:${u.email}`}
                                className="font-mono text-xs text-pink-600 dark:text-pink-400 hover:underline"
                              >
                                {u.email}
                              </a>
                              {u.is_verified && (
                                <span className="text-green-600 dark:text-green-400 text-xs font-semibold" title="Verified">✓</span>
                              )}
                            </div>
                          ) : (
                            <span className="text-black/70 dark:text-white/70 italic">No email</span>
                          )}
                        </td>
                        <td className="p-3 text-black dark:text-white text-sm font-mono">
                          {u.ip_address || <span className="text-black/70 dark:text-white/70 italic">Not available</span>}
                        </td>
                        <td className="p-3 text-black dark:text-white text-sm">
                          {new Date(u.created_at).toLocaleDateString()}
                        </td>
                        <td className="p-3 text-black dark:text-white text-sm">
                          {new Date(u.last_activity).toLocaleDateString()}
                        </td>
                        <td className="p-3 text-black dark:text-white">{u.fileCount}</td>
                        <td className="p-3">
                          <Button
                            onClick={() => handleModerateUser(u)}
                            className="bg-orange-500 hover:bg-orange-600 text-white text-sm px-4 py-2"
                          >
                            Moderate
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Users Pagination */}
              {totalUsersPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-6">
                  <Button
                    onClick={() => setUsersPage(p => Math.max(1, p - 1))}
                    disabled={usersPage === 1}
                    className="bunny-button bg-pink-300 dark:bg-pink-900/50 hover:bg-pink-400 dark:hover:bg-pink-800/50 text-pink-900 dark:text-pink-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </Button>

                  <div className="flex gap-2">
                    {Array.from({ length: totalUsersPages }, (_, i) => i + 1).map((page) => (
                      <Button
                        key={page}
                        onClick={() => setUsersPage(page)}
                        className={`bunny-button ${
                          usersPage === page
                            ? 'bg-purple-500 hover:bg-purple-600 text-white'
                            : 'bg-white/80 dark:bg-black/30 hover:bg-pink-100 dark:hover:bg-pink-900/30 text-gray-800 dark:text-gray-200'
                        }`}
                      >
                        {page}
                      </Button>
                    ))}
                  </div>

                  <Button
                    onClick={() => setUsersPage(p => Math.min(totalUsersPages, p + 1))}
                    disabled={usersPage === totalUsersPages}
                    className="bunny-button bg-pink-300 dark:bg-pink-900/50 hover:bg-pink-400 dark:hover:bg-pink-800/50 text-pink-900 dark:text-pink-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </Button>
                </div>
              )}
            </Card>

            {/* Files Section */}
            <Card className="bunny-card p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                  All Files ({filteredFiles.length}{fileSearch && ` of ${files.length}`})
                </h2>
                <div className="w-64">
                  <Input
                    type="text"
                    placeholder="Search by filename or uploader..."
                    value={fileSearch}
                    onChange={(e) => setFileSearch(e.target.value)}
                    className="bunny-input"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-pink-200 dark:border-pink-900/30">
                      <th className="text-left p-3 font-bold text-gray-800 dark:text-gray-200">Filename</th>
                      <th className="text-left p-3 font-bold text-gray-800 dark:text-gray-200">Size</th>
                      <th className="text-left p-3 font-bold text-gray-800 dark:text-gray-200">Uploader</th>
                      <th className="text-left p-3 font-bold text-gray-800 dark:text-gray-200">Uploaded</th>
                      <th className="text-left p-3 font-bold text-gray-800 dark:text-gray-200">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedFiles.map((file) => (
                      <tr key={file.id} className="border-b border-pink-100 dark:border-pink-900/20">
                        <td className="p-3 text-black dark:text-white font-mono text-sm max-w-xs truncate">
                          {file.filename}
                        </td>
                        <td className="p-3 text-black dark:text-white text-sm">
                          {formatFileSize(file.filesize)}
                        </td>
                        <td className="p-3 text-black dark:text-white">
                          {file.uploader_username || 'Anonymous'}
                        </td>
                        <td className="p-3 text-black dark:text-white text-sm">
                          {new Date(file.upload_date).toLocaleDateString()}
                        </td>
                        <td className="p-3">
                          <div className="flex gap-2">
                            <Link href={`/f/${file.id}`} target="_blank">
                              <Button className="bg-blue-500 hover:bg-blue-600 text-white text-sm px-4 py-2">
                                View
                              </Button>
                            </Link>
                            <Button
                              onClick={() => handleDeleteFile(file.id)}
                              className="bg-red-500 hover:bg-red-600 text-white text-sm px-4 py-2"
                            >
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Files Pagination */}
              {totalFilesPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-6">
                  <Button
                    onClick={() => setFilesPage(p => Math.max(1, p - 1))}
                    disabled={filesPage === 1}
                    className="bunny-button bg-pink-300 dark:bg-pink-900/50 hover:bg-pink-400 dark:hover:bg-pink-800/50 text-pink-900 dark:text-pink-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </Button>

                  <div className="flex gap-2">
                    {Array.from({ length: totalFilesPages }, (_, i) => i + 1).map((page) => (
                      <Button
                        key={page}
                        onClick={() => setFilesPage(page)}
                        className={`bunny-button ${
                          filesPage === page
                            ? 'bg-purple-500 hover:bg-purple-600 text-white'
                            : 'bg-white/80 dark:bg-black/30 hover:bg-pink-100 dark:hover:bg-pink-900/30 text-gray-800 dark:text-gray-200'
                        }`}
                      >
                        {page}
                      </Button>
                    ))}
                  </div>

                  <Button
                    onClick={() => setFilesPage(p => Math.min(totalFilesPages, p + 1))}
                    disabled={filesPage === totalFilesPages}
                    className="bunny-button bg-pink-300 dark:bg-pink-900/50 hover:bg-pink-400 dark:hover:bg-pink-800/50 text-pink-900 dark:text-pink-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </Button>
                </div>
              )}
            </Card>
          </div>
        )}
      </div>

      {/* Moderation Dialog */}
      <Dialog open={showModerateDialog} onOpenChange={setShowModerateDialog}>
        <DialogContent className="bunny-card max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-800 dark:text-gray-200">
              Moderate User: {selectedUser?.username}
            </DialogTitle>
            <DialogDescription className="text-black dark:text-white">
              Ban by IP address or delete account and uploads
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div>
              <Label htmlFor="ipAddress" className="text-black dark:text-white font-semibold">
                IP Address * {ipAddress && <span className="text-green-600 dark:text-green-400 text-xs font-normal">(Auto-detected)</span>}
              </Label>
              <Input
                id="ipAddress"
                value={ipAddress}
                onChange={(e) => setIpAddress(e.target.value)}
                placeholder="192.168.1.1"
                className="bunny-input mt-2"
              />
              <p className="text-xs text-black dark:text-white mt-1">
                {ipAddress
                  ? 'IP address automatically detected from user\'s last login'
                  : 'No IP address found. Enter manually or wait for user to log in.'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isPermanent"
                checked={isPermanentBan}
                onChange={(e) => setIsPermanentBan(e.target.checked)}
                className="w-4 h-4 text-pink-500 border-gray-300 dark:border-gray-600 rounded focus:ring-pink-500"
              />
              <Label htmlFor="isPermanent" className="text-black dark:text-white cursor-pointer">
                Permanent Ban
              </Label>
            </div>

            {!isPermanentBan && (
              <div>
                <Label htmlFor="duration" className="text-black dark:text-white font-semibold">
                  Ban Duration (hours)
                </Label>
                <Input
                  id="duration"
                  type="number"
                  value={banDurationHours}
                  onChange={(e) => setBanDurationHours(e.target.value)}
                  min="1"
                  className="bunny-input mt-2"
                />
              </div>
            )}

            <div>
              <Label htmlFor="reason" className="text-black dark:text-white font-semibold">
                Ban Reason
              </Label>
              <Textarea
                id="reason"
                value={banReason}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setBanReason(e.target.value)}
                placeholder="Enter reason for ban..."
                className="bunny-input mt-2 min-h-[100px]"
              />
            </div>

            <div className="space-y-3 mt-6">
              <div className="flex gap-3">
                <Button
                  onClick={() => setShowModerateDialog(false)}
                  variant="outline"
                  className="flex-1 bunny-button border-pink-300 dark:border-pink-900/30"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleBanUser}
                  className="flex-1 bunny-button bg-red-500 hover:bg-red-600 text-white"
                >
                  {isPermanentBan ? 'Permanent Ban' : 'Temporary Ban'}
                </Button>
              </div>

              <div className="border-t border-gray-300 dark:border-gray-600 pt-3">
                <p className="text-xs text-black dark:text-white mb-2">
                  Or delete account without banning IP:
                </p>
                <Button
                  onClick={handleDeleteAccount}
                  className="w-full bunny-button bg-orange-500 hover:bg-orange-600 text-white"
                >
                  Delete Account & Files ({selectedUser?.fileCount || 0} files)
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
