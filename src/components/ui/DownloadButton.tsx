'use client';

import { cn } from '@/lib/utils';

interface DownloadButtonProps {
  content: string;
  filename: string;
  mimeType?: string;
  disabled?: boolean;
  className?: string;
  variant?: 'outline' | 'ghost';
  onDownload?: () => void;
}

export function DownloadButton({
  content,
  filename,
  mimeType = 'text/plain',
  disabled,
  className,
  variant = 'outline',
  onDownload,
}: DownloadButtonProps) {
  const handleDownload = () => {
    if (!content) return;
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    onDownload?.();
  };

  return (
    <button
      onClick={handleDownload}
      disabled={disabled || !content}
      type="button"
      aria-label={`Download ${filename}`}
      title="Download file"
      className={cn(
        'inline-flex items-center gap-1.5 rounded-lg font-medium transition-colors text-sm',
        variant === 'outline' && 'px-3.5 py-1.5 border border-gray-200 bg-white text-gray-600 hover:bg-gray-50',
        variant === 'ghost' && 'px-1 py-1.5 text-gray-400 hover:text-gray-600',
        'disabled:opacity-40 disabled:cursor-not-allowed',
        className
      )}
    >
      <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
      Download
    </button>
  );
}
