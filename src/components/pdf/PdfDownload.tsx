'use client';

import { useCallback, useState } from 'react';
import { formatFileSize } from '@/lib/pdf/validation';

interface PdfDownloadProps {
  blob: Blob | null;
  filename: string;
  label?: string;
  disabled?: boolean;
  className?: string;
  onDownload?: () => void;
}

export function PdfDownload({
  blob,
  filename,
  label = 'Download PDF',
  disabled,
  className,
  onDownload,
}: PdfDownloadProps) {
  const [downloaded, setDownloaded] = useState(false);

  const handleDownload = useCallback(() => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    // Revoke after a short delay so the download can start
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setDownloaded(true);
    onDownload?.();
  }, [blob, filename, onDownload]);

  const isDisabled = disabled || !blob;

  return (
    <div className={['flex flex-col items-start gap-1', className].filter(Boolean).join(' ')}>
      <button
        type="button"
        onClick={handleDownload}
        disabled={isDisabled}
        aria-label={`Download ${filename}`}
        className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 active:bg-blue-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        {downloaded ? 'Downloaded' : label}
      </button>
      {blob && (
        <p className="text-xs text-gray-400 dark:text-gray-500">
          {filename} · {formatFileSize(blob.size)}
        </p>
      )}
    </div>
  );
}
