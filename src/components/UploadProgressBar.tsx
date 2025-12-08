'use client';

interface UploadProgressBarProps {
  progress: number; // 0-100
}

export function UploadProgressBar({ progress }: UploadProgressBarProps) {
  if (progress < 0) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-gray-200 dark:bg-gray-800">
      <div
        className="h-full bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 transition-all duration-300 ease-out"
        style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
      />
    </div>
  );
}
