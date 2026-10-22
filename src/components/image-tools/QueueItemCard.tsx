'use client';

import { useCallback } from 'react';
import type { QueueItem, QueueItemStatus } from '@/lib/image-tools/types';
import { formatFileSize } from '@/lib/image-tools/engine';

interface QueueItemCardProps<TOptions, TResult> {
  item: QueueItem<TOptions, TResult>;
  onRemove: (id: string) => void;
  onRetry?: (id: string) => void;
  renderResult?: (item: QueueItem<TOptions, TResult>) => React.ReactNode;
  previewUrl?: string;
}

const STATUS_LABELS: Record<QueueItemStatus, string> = {
  queued: 'Queued',
  processing: 'Processing…',
  completed: 'Done',
  failed: 'Failed',
  cancelled: 'Cancelled',
};

const STATUS_COLORS: Record<QueueItemStatus, string> = {
  queued: 'text-gray-500 dark:text-gray-400',
  processing: 'text-blue-600 dark:text-blue-400',
  completed: 'text-green-600 dark:text-green-400',
  failed: 'text-red-600 dark:text-red-400',
  cancelled: 'text-gray-400 dark:text-gray-500',
};

export function QueueItemCard<TOptions, TResult>({
  item,
  onRemove,
  onRetry,
  renderResult,
  previewUrl,
}: QueueItemCardProps<TOptions, TResult>) {
  const handleRemove = useCallback(() => onRemove(item.id), [item.id, onRemove]);
  const handleRetry = useCallback(() => onRetry?.(item.id), [item.id, onRetry]);

  return (
    <div
      className="flex flex-col gap-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4"
      aria-label={`${item.file.name} — ${STATUS_LABELS[item.status]}`}
    >
      <div className="flex items-start gap-3">
        {/* Thumbnail */}
        {previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={previewUrl}
            alt=""
            aria-hidden="true"
            className="h-12 w-12 rounded-lg object-cover shrink-0 border border-gray-100 dark:border-gray-700"
          />
        ) : (
          <div className="h-12 w-12 rounded-lg bg-gray-100 dark:bg-gray-800 shrink-0 flex items-center justify-center">
            <svg className="h-5 w-5 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
            {item.file.name}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {formatFileSize(item.file.size)}
          </p>
          <p className={`text-xs mt-0.5 font-medium ${STATUS_COLORS[item.status]}`}
            role="status"
            aria-live="polite"
          >
            {STATUS_LABELS[item.status]}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0">
          {item.status === 'failed' && onRetry && (
            <button
              type="button"
              onClick={handleRetry}
              className="rounded-md px-2 py-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors"
            >
              Retry
            </button>
          )}
          <button
            type="button"
            onClick={handleRemove}
            aria-label={`Remove ${item.file.name}`}
            className="rounded-md p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Progress bar */}
      {item.status === 'processing' && (
        <div className="h-1.5 w-full rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
          <div
            className="h-full rounded-full bg-violet-500 transition-all duration-200"
            style={{ width: `${item.progress}%` }}
            role="progressbar"
            aria-valuenow={item.progress}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
      )}

      {/* Error message */}
      {item.status === 'failed' && item.error && (
        <p className="text-xs text-red-600 dark:text-red-400 rounded-md bg-red-50 dark:bg-red-950/20 px-3 py-2" role="alert">
          {item.error}
        </p>
      )}

      {/* Result */}
      {item.status === 'completed' && renderResult && renderResult(item)}
    </div>
  );
}
