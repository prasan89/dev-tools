'use client';

import { useCallback, useRef, useState } from 'react';
import { ACCEPTED_MIME_STRING, ACCEPTED_EXTENSIONS, MAX_FILE_SIZE, validateImageFile } from '@/lib/image-tools/validation';
import { formatFileSize } from '@/lib/image-tools/engine';

interface ImageDropzoneProps {
  onFiles: (files: File[]) => void;
  multiple?: boolean;
  disabled?: boolean;
  className?: string;
}

export function ImageDropzone({
  onFiles,
  multiple = false,
  disabled = false,
  className,
}: ImageDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const processFiles = useCallback(
    (raw: FileList | File[]) => {
      const arr = Array.from(raw);
      const valid: File[] = [];
      const errs: string[] = [];

      for (const f of arr) {
        const result = validateImageFile(f);
        if (result.valid) {
          valid.push(f);
        } else {
          errs.push(`${f.name}: ${result.message}`);
        }
      }

      if (errs.length > 0) setErrors(errs);
      else setErrors([]);

      if (valid.length > 0) onFiles(valid);
    },
    [onFiles],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      if (disabled) return;
      processFiles(e.dataTransfer.files);
    },
    [disabled, processFiles],
  );

  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      if (disabled) return;
      const items = Array.from(e.clipboardData.items);
      const files = items
        .filter((i) => i.kind === 'file')
        .map((i) => i.getAsFile())
        .filter((f): f is File => f !== null);
      if (files.length > 0) processFiles(files);
    },
    [disabled, processFiles],
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) processFiles(e.target.files);
      e.target.value = '';
    },
    [processFiles],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        inputRef.current?.click();
      }
    },
    [],
  );

  return (
    <div className={className}>
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label="Upload image files — click or drag and drop"
        aria-disabled={disabled}
        onDragOver={(e) => { e.preventDefault(); if (!disabled) setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onPaste={handlePaste}
        onKeyDown={handleKeyDown}
        onClick={() => !disabled && inputRef.current?.click()}
        className={[
          'flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-10 text-center transition-colors cursor-pointer',
          dragging
            ? 'border-violet-400 bg-violet-50 dark:border-violet-600 dark:bg-violet-950/20'
            : 'border-gray-300 dark:border-gray-700 hover:border-violet-400 dark:hover:border-violet-600 bg-white dark:bg-gray-900',
          disabled ? 'opacity-50 cursor-not-allowed' : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <svg
          className="h-10 w-10 text-gray-300 dark:text-gray-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        <div>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Drop image{multiple ? 's' : ''} here, paste, or{' '}
            <span className="text-violet-600 dark:text-violet-400 underline underline-offset-2">
              browse
            </span>
          </p>
          <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
            JPEG, PNG, WebP · up to {formatFileSize(MAX_FILE_SIZE)} each
          </p>
          <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-500">
            Accepted: {ACCEPTED_EXTENSIONS.join(', ')}
          </p>
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_MIME_STRING}
        multiple={multiple}
        className="sr-only"
        onChange={handleChange}
        aria-hidden="true"
        tabIndex={-1}
      />

      {errors.length > 0 && (
        <ul
          className="mt-3 space-y-1 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20 px-4 py-3"
          role="alert"
          aria-live="polite"
        >
          {errors.map((e, i) => (
            <li key={i} className="text-xs text-red-700 dark:text-red-400">
              {e}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
