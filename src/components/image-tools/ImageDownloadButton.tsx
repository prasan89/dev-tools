'use client';

import { useCallback } from 'react';

interface ImageDownloadButtonProps {
  url: string;
  filename: string;
  label?: string;
  size?: string;
  className?: string;
}

export function ImageDownloadButton({
  url,
  filename,
  label = 'Download',
  size,
  className,
}: ImageDownloadButtonProps) {
  const handleClick = useCallback(() => {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }, [url, filename]);

  return (
    <button
      type="button"
      onClick={handleClick}
      className={[
        'inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium',
        'bg-violet-600 hover:bg-violet-700 active:bg-violet-800',
        'text-white transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
      {label}
      {size && <span className="text-violet-200 text-xs">({size})</span>}
    </button>
  );
}
