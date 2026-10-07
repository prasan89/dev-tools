'use client';

import { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface CopyButtonProps {
  text: string;
  className?: string;
  size?: 'sm' | 'md';
  variant?: 'outline' | 'solid' | 'ghost';
  onCopy?: () => void;
}

export function CopyButton({ text, className, size = 'md', variant = 'outline', onCopy }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const el = document.createElement('textarea');
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    onCopy?.();
  }, [text, onCopy]);

  return (
    <button
      onClick={handleCopy}
      aria-label={copied ? 'Copied to clipboard' : 'Copy to clipboard'}
      title={copied ? 'Copied!' : 'Copy to clipboard'}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-lg font-medium transition-colors',
        size === 'sm' ? 'px-2 py-1 text-xs' : 'px-3.5 py-1.5 text-sm',
        variant === 'solid' && !copied && 'bg-gray-900 text-white hover:bg-gray-700',
        variant === 'solid' && copied && 'bg-green-600 text-white',
        variant === 'outline' && !copied && 'border border-gray-200 bg-white text-gray-600 hover:bg-gray-50',
        variant === 'outline' && copied && 'border border-green-400 bg-white text-green-600',
        variant === 'ghost' && !copied && 'text-gray-500 hover:text-gray-700',
        variant === 'ghost' && copied && 'text-green-600',
        className
      )}
    >
      {copied ? (
        <>
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Copied
        </>
      ) : (
        <>
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          Copy
        </>
      )}
    </button>
  );
}
