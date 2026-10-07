'use client';

import { useCallback, useRef, useState } from 'react';
import { validateImageFile } from '@/types/image';
import { formatFileSize } from '@/lib/pdf/validation';
import type { ImageFile } from '@/types/image';
import { IMAGE_MAX_FILES, IMAGE_MAX_FILE_SIZE } from '@/types/image';

interface ImageDropzoneProps {
  onFilesSelected: (files: ImageFile[]) => void;
  maxFiles?: number;
  multiple?: boolean;
  disabled?: boolean;
  className?: string;
  /** Compact variant shown inline after files are already loaded */
  compact?: boolean;
}

export function buildImageFile(file: File): ImageFile {
  return {
    id: crypto.randomUUID(),
    name: file.name,
    size: file.size,
    file,
    objectUrl: null,
    width: null,
    height: null,
    exifOrientation: null,
    isCorrupted: false,
    loadedAt: Date.now(),
  };
}

export function ImageDropzone({
  onFilesSelected,
  maxFiles = IMAGE_MAX_FILES,
  multiple = true,
  disabled = false,
  className,
  compact = false,
}: ImageDropzoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFiles = useCallback(
    (rawFiles: FileList | File[]) => {
      setErrors([]);
      const fileArray = Array.from(rawFiles);
      const limited = fileArray.slice(0, maxFiles);
      const validFiles: ImageFile[] = [];
      const newErrors: string[] = [];

      for (const file of limited) {
        const result = validateImageFile(file);
        if (!result.valid) {
          const msgs: Record<string, string> = {
            'empty-file': `"${file.name}" is empty.`,
            'file-too-large': `"${file.name}" exceeds ${Math.round(IMAGE_MAX_FILE_SIZE / 1024 / 1024)} MB limit.`,
            'invalid-type': `"${file.name}" is not a JPG or PNG file.`,
          };
          newErrors.push(msgs[result.error!] ?? `"${file.name}" could not be loaded.`);
          continue;
        }
        validFiles.push(buildImageFile(file));
      }

      if (fileArray.length > maxFiles) {
        newErrors.push(
          `Only the first ${maxFiles} image${maxFiles !== 1 ? 's' : ''} were accepted (${fileArray.length} selected).`
        );
      }

      setErrors(newErrors);
      if (validFiles.length > 0) {
        onFilesSelected(validFiles);
      }
    },
    [maxFiles, onFilesSelected],
  );

  const onDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragOver(false);
      if (disabled) return;
      processFiles(e.dataTransfer.files);
    },
    [disabled, processFiles],
  );

  const onDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const onDragLeave = useCallback(() => setIsDragOver(false), []);

  const onKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      inputRef.current?.click();
    }
  }, []);

  const dropzoneContent = compact ? (
    <div className="flex items-center gap-2">
      <svg className="h-4 w-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
      <span className="text-sm text-gray-600 dark:text-gray-400">
        Add more images or{' '}
        <span className="text-blue-600 dark:text-blue-400 underline underline-offset-2">browse</span>
      </span>
    </div>
  ) : (
    <>
      <svg className="h-10 w-10 text-gray-400 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
      <div>
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {isDragOver ? 'Drop images here' : 'Drag & drop images here'}
        </p>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
          or{' '}
          <span className="text-blue-600 dark:text-blue-400 underline underline-offset-2">browse files</span>
        </p>
        <p className="mt-2 text-xs text-gray-400 dark:text-gray-600">
          JPG and PNG · Max 50 MB each{multiple ? ` · Up to ${maxFiles} images` : ''}
        </p>
      </div>
    </>
  );

  return (
    <div className={className}>
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label={`${multiple ? 'Select images' : 'Select an image'} — drag and drop or click to browse`}
        aria-disabled={disabled}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onClick={() => !disabled && inputRef.current?.click()}
        onKeyDown={onKeyDown}
        className={[
          'flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed transition-colors cursor-pointer select-none',
          compact ? 'p-3' : 'p-8 text-center',
          isDragOver
            ? 'border-blue-400 bg-blue-50 dark:bg-blue-950/30 dark:border-blue-500'
            : 'border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 hover:border-gray-400 dark:hover:border-gray-600',
          disabled ? 'opacity-50 cursor-not-allowed' : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {dropzoneContent}
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,.jpg,.jpeg,.png"
          multiple={multiple}
          disabled={disabled}
          onChange={(e) => e.target.files && processFiles(e.target.files)}
          className="sr-only"
          aria-hidden="true"
          tabIndex={-1}
        />
      </div>

      {errors.length > 0 && (
        <ul role="alert" aria-live="polite" className="mt-2 space-y-1">
          {errors.map((err, i) => (
            <li
              key={i}
              className="flex items-start gap-1.5 rounded-md border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20 px-3 py-2 text-xs text-red-700 dark:text-red-400"
            >
              <svg className="mt-0.5 h-3.5 w-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              {err}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export { formatFileSize };
