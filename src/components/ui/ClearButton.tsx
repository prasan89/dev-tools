'use client';

import { cn } from '@/lib/utils';

interface ClearButtonProps {
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}

export function ClearButton({ onClick, disabled, className }: ClearButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title="Clear input"
      className={cn(
        'inline-flex items-center gap-1.5 rounded px-3 py-1.5 text-sm font-medium',
        'border border-gray-200 dark:border-gray-700',
        'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700',
        'text-gray-600 dark:text-gray-300',
        'transition-colors disabled:opacity-40 disabled:cursor-not-allowed',
        className
      )}
    >
      <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
      Clear
    </button>
  );
}
