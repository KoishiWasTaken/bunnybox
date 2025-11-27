// Database types and in-memory storage
// This can later be replaced with Supabase

export interface User {
  id: string;
  username: string;
  password: string; // In production, this should be hashed
  createdAt: Date;
}

export interface FileUpload {
  id: string;
  filename: string;
  filesize: number;
  uploaderId: string | null; // null for anonymous
  uploaderUsername: string | null;
  uploadDate: Date;
  deleteAt: Date | null; // null for never delete
  deleteDuration: string;
  uniqueVisitors: Set<string>; // IP addresses
  downloadCount: number;
  fileData: string; // base64 encoded file data
  mimeType: string;
}

export interface RateLimit {
  ip: string;
  uploads: Date[];
  bannedUntil: Date | null;
}

// In-memory storage (replace with Supabase later)
class Database {
  private users: Map<string, User> = new Map();
  private files: Map<string, FileUpload> = new Map();
  private rateLimits: Map<string, RateLimit> = new Map();

  // User methods
  createUser(username: string, password: string): User {
    const id = this.generateId();
    const user: User = {
      id,
      username,
      password,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  findUserByUsername(username: string): User | undefined {
    return Array.from(this.users.values()).find(u => u.username === username);
  }

  findUserById(id: string): User | undefined {
    return this.users.get(id);
  }

  // File methods
  createFile(data: Omit<FileUpload, 'id' | 'uniqueVisitors' | 'downloadCount'>): FileUpload {
    const id = this.generateFileId();
    const file: FileUpload = {
      ...data,
      id,
      uniqueVisitors: new Set(),
      downloadCount: 0,
    };
    this.files.set(id, file);
    return file;
  }

  getFile(id: string): FileUpload | undefined {
    return this.files.get(id);
  }

  deleteFile(id: string): boolean {
    return this.files.delete(id);
  }

  getUserFiles(userId: string): FileUpload[] {
    return Array.from(this.files.values()).filter(f => f.uploaderId === userId);
  }

  incrementDownloadCount(fileId: string): void {
    const file = this.files.get(fileId);
    if (file) {
      file.downloadCount++;
    }
  }

  addUniqueVisitor(fileId: string, ip: string): void {
    const file = this.files.get(fileId);
    if (file) {
      file.uniqueVisitors.add(ip);
    }
  }

  // Rate limiting methods
  checkRateLimit(ip: string): { allowed: boolean; reason?: string } {
    const now = new Date();
    let rateLimit = this.rateLimits.get(ip);

    if (!rateLimit) {
      rateLimit = { ip, uploads: [], bannedUntil: null };
      this.rateLimits.set(ip, rateLimit);
    }

    // Check if banned
    if (rateLimit.bannedUntil && rateLimit.bannedUntil > now) {
      return { allowed: false, reason: `Banned until ${rateLimit.bannedUntil.toLocaleString()}` };
    }

    // Clear old uploads (older than 10 minutes)
    const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000);
    rateLimit.uploads = rateLimit.uploads.filter(d => d > tenMinutesAgo);

    // Check if too many uploads
    if (rateLimit.uploads.length >= 10) {
      // Ban for 1 day
      rateLimit.bannedUntil = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      return { allowed: false, reason: 'Too many uploads. Banned for 1 day.' };
    }

    return { allowed: true };
  }

  recordUpload(ip: string): void {
    const rateLimit = this.rateLimits.get(ip);
    if (rateLimit) {
      rateLimit.uploads.push(new Date());
    }
  }

  // Clean up expired files
  cleanupExpiredFiles(): void {
    const now = new Date();
    for (const [id, file] of this.files.entries()) {
      if (file.deleteAt && file.deleteAt <= now) {
        this.files.delete(id);
      }
    }
  }

  // Utility methods
  private generateId(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  private generateFileId(): string {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    // Check if already exists
    if (this.files.has(result)) {
      return this.generateFileId();
    }
    return result;
  }
}

export const db = new Database();

// Run cleanup every hour
if (typeof window === 'undefined') {
  setInterval(() => {
    db.cleanupExpiredFiles();
  }, 60 * 60 * 1000);
}
