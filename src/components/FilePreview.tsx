import { useState } from 'react';
import Image from 'next/image';
import { FileIcon, PlayCircle, ImageIcon } from 'lucide-react';

interface FilePreviewProps {
  fileId: string;
  filename: string;
  mimeType: string;
  storagePath?: string | null;
  usesStorage?: boolean;
  fileData?: string | null;
}

export function FilePreview({
  fileId,
  filename,
  mimeType,
  storagePath,
  usesStorage,
  fileData,
}: FilePreviewProps) {
  const [imageError, setImageError] = useState(false);
  const [videoError, setVideoError] = useState(false);

  const isImage = mimeType.startsWith('image/');
  const isVideo = mimeType.startsWith('video/');

  // Get the file URL
  const getFileUrl = () => {
    if (usesStorage && storagePath) {
      // Storage-based file
      const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
      return `${baseUrl}/storage/v1/object/public/bunnybox-files/${storagePath}`;
    } else if (fileData) {
      // Base64 embedded file
      return `data:${mimeType};base64,${fileData}`;
    }
    return null;
  };

  const fileUrl = getFileUrl();

  // If not image or video, show icon
  if (!isImage && !isVideo) {
    return (
      <div className="flex items-center justify-center w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <FileIcon className="w-8 h-8 text-gray-400 dark:text-gray-600" />
      </div>
    );
  }

  // If no URL available
  if (!fileUrl) {
    return (
      <div className="flex items-center justify-center w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <FileIcon className="w-8 h-8 text-gray-400 dark:text-gray-600" />
      </div>
    );
  }

  // Image preview
  if (isImage && !imageError) {
    return (
      <div className="relative w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden group">
        <Image
          src={fileUrl}
          alt={filename}
          fill
          className="object-cover"
          onError={() => setImageError(true)}
          sizes="80px"
        />
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <ImageIcon className="w-6 h-6 text-white" />
        </div>
      </div>
    );
  }

  // Video preview
  if (isVideo && !videoError) {
    return (
      <div className="relative w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden group">
        <video
          src={fileUrl}
          className="w-full h-full object-cover"
          onError={() => setVideoError(true)}
          muted
          playsInline
        />
        {/* Play icon overlay */}
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center pointer-events-none">
          <PlayCircle className="w-8 h-8 text-white drop-shadow-lg" />
        </div>
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    );
  }

  // Fallback if error loading media
  return (
    <div className="flex items-center justify-center w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-lg">
      <FileIcon className="w-8 h-8 text-gray-400 dark:text-gray-600" />
    </div>
  );
}
