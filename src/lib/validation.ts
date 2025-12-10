// Validation utilities

// Basic profanity/inappropriate content filter
const BLOCKED_WORDS = [
  'fuck', 'shit', 'ass', 'bitch', 'damn', 'hell', 'sex', 'porn', 'xxx',
  'nazi', 'hitler', 'rape', 'kill', 'death', 'hate', 'slur', 'nigger',
  'fag', 'tranny', 'retard', 'whore', 'slut', 'cock', 'dick', 'penis',
  'vagina', 'pussy', 'cunt', 'bastard', 'bloody', 'piss', 'arse',
];

export function validateUsername(username: string): { valid: boolean; error?: string } {
  // Check length
  if (username.length < 3 || username.length > 16) {
    return { valid: false, error: 'Username must be 3-16 characters long' };
  }

  // Check allowed characters
  if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
    return { valid: false, error: 'Username can only contain letters, numbers, dashes, and underscores' };
  }

  // Check for profanity/inappropriate content
  const lowerUsername = username.toLowerCase();
  for (const word of BLOCKED_WORDS) {
    if (lowerUsername.includes(word)) {
      return { valid: false, error: 'Username contains inappropriate content' };
    }
  }

  return { valid: true };
}

export function validatePassword(password: string): { valid: boolean; error?: string } {
  if (password.length < 8 || password.length > 24) {
    return { valid: false, error: 'Password must be 8-24 characters long' };
  }

  // Allow alphanumeric and specific symbols: !@#$%^&*-_+,.?;:'"`~
  if (!/^[a-zA-Z0-9!@#$%^&*\-_+,.?;:'"`~]+$/.test(password)) {
    return { valid: false, error: 'Password contains invalid characters. Allowed: letters, numbers, and !@#$%^&*-_+,.?;:\'"`~' };
  }

  return { valid: true };
}

export function sanitizeFilename(filename: string): string {
  // Remove path separators and other dangerous characters
  let sanitized = filename.replace(/[\/\\:*?"<>|]/g, '_');

  // Remove any null bytes
  sanitized = sanitized.replace(/\0/g, '');

  // Trim whitespace
  sanitized = sanitized.trim();

  // Replace multiple underscores with single underscore
  sanitized = sanitized.replace(/_+/g, '_');

  // Ensure filename isn't empty
  if (!sanitized || sanitized === '_') {
    sanitized = 'unnamed_file';
  }

  // Limit filename length (keep extension if present)
  const maxLength = 255;
  if (sanitized.length > maxLength) {
    const lastDot = sanitized.lastIndexOf('.');
    if (lastDot > 0 && lastDot > maxLength - 20) {
      // Has extension, preserve it
      const ext = sanitized.substring(lastDot);
      const name = sanitized.substring(0, maxLength - ext.length);
      sanitized = name + ext;
    } else {
      // No extension or extension too far
      sanitized = sanitized.substring(0, maxLength);
    }
  }

  return sanitized;
}

export function validateFilename(filename: string): { valid: boolean; error?: string } {
  if (!filename || filename.trim().length === 0) {
    return { valid: false, error: 'Filename cannot be empty' };
  }

  if (filename.length > 255) {
    return { valid: false, error: 'Filename is too long (max 255 characters)' };
  }

  // Check for null bytes or other control characters
  if (/[\0-\x1F\x7F]/.test(filename)) {
    return { valid: false, error: 'Filename contains invalid control characters' };
  }

  return { valid: true };
}

export function validateFileSize(size: number): { valid: boolean; error?: string } {
  const maxSize = 50 * 1024 * 1024; // 50MB in bytes

  if (size > maxSize) {
    return { valid: false, error: 'File size exceeds 50MB limit' };
  }

  return { valid: true };
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

export function formatStorageSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  // Format with 2 decimal places for better readability
  return (bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i];
}

export function getDeleteDuration(duration: string): Date | null {
  const now = new Date();

  switch (duration) {
    case '1hour':
      return new Date(now.getTime() + 60 * 60 * 1000);
    case '6hours':
      return new Date(now.getTime() + 6 * 60 * 60 * 1000);
    case '12hours':
      return new Date(now.getTime() + 12 * 60 * 60 * 1000);
    case '1day':
      return new Date(now.getTime() + 24 * 60 * 60 * 1000);
    case '2days':
      return new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
    case '7days':
      return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    case '30days':
      return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    case 'never':
      return null;
    default:
      return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  }
}

export function getTimeUntilDeletion(deleteAt: Date | null): string {
  if (!deleteAt) return 'Never';

  const now = new Date();
  const diff = deleteAt.getTime() - now.getTime();

  if (diff <= 0) return 'Expired';

  const days = Math.floor(diff / (24 * 60 * 60 * 1000));
  const hours = Math.floor((diff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
  const minutes = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000));

  if (days > 0) {
    return `${days} day${days > 1 ? 's' : ''}, ${hours} hour${hours !== 1 ? 's' : ''}`;
  } else if (hours > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''}, ${minutes} minute${minutes !== 1 ? 's' : ''}`;
  } else {
    return `${minutes} minute${minutes > 1 ? 's' : ''}`;
  }
}
