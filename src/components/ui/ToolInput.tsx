'use client';

import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface ToolInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  rows?: number;
  disabled?: boolean;
  className?: string;
  mono?: boolean;
}

export function ToolInput({
  value,
  onChange,
  placeholder,
  label,
  rows = 10,
  disabled,
  className,
  mono = true,
}: ToolInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.max(textareaRef.current.scrollHeight, rows * 24)}px`;
    }
  }, [value, rows]);

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
      )}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        rows={rows}
        className={cn(
          'w-full resize-y rounded-lg border px-3 py-2.5 text-sm',
          'border-gray-200 dark:border-gray-700',
          'bg-white dark:bg-gray-900',
          'text-gray-900 dark:text-gray-100',
          'placeholder:text-gray-400 dark:placeholder:text-gray-600',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          mono && 'font-mono text-xs leading-relaxed',
          className
        )}
      />
    </div>
  );
}
