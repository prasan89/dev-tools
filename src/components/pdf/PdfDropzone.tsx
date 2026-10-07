'use client';

import { useCallback, useRef, useState } from 'react';
import { validatePdfFile, formatFileSize } from '@/lib/pdf/validation';
import { PDF_MAX_FILES, PDF_LARGE_FILE_WARNING, type PdfFile } from '@/types/pdf';

interface PdfDropzoneProps {
  onFilesSelected: (files: PdfFile[]) => void;
  maxFiles?: number;
  multiple?: boolean;
  disabled?: boolean;
  className?: string;
}

function buildPdfFile(file: File): PdfFile {
  return {
    id: crypto.randomUUID(),
    name: file.name,
    size: file.size,
    file,
    objectUrl: null,
    pageCount: null,
    isPasswordProtected: false,
    isCorrupted: false,
    loadedAt: Date.now(),
  };
}

export function PdfDropzone({
  onFilesSelected,
  maxFiles = PDF_MAX_FILES,
  multiple = false,
  disabled = false,
  className,
}: PdfDropzoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFiles = useCallback(
    (rawFiles: FileList | File[]) => {
      setErrors([]);
      const fileArray = Array.from(rawFiles);
      const limited = fileArray.slice(0, maxFiles);
      const validFiles: PdfFile[] = [];
      const newErrors: string[] = [];

      for (const file of limited) {
        const result = validatePdfFile(file);
        if (!result.valid) {
          const msgs: Record<string, string> = {
            'empty-file': `"${file.name}" is empty.`,
            'file-too-large': `"${file.name}" exceeds 100 MB limit.`,
            'invalid-type': `"${file.name}" is not a PDF file.`,
            'invalid-extension': `"${file.name}" must have a .pdf extension.`,
            corrupted: `"${file.name}" appears to be corrupted.`,
            'password-protected': `"${file.name}" is password protected.`,
          };
          newErrors.push(msgs[result.error!] ?? `"${file.name}" could not be loaded.`);
          continue;
        }
        validFiles.push(buildPdfFile(file));
      }

      if (fileArray.length > maxFiles) {
        newErrors.push(
          `Only the first ${maxFiles} file${maxFiles > 1 ? 's' : ''} were accepted (${fileArray.length} selected).`
        );
      }

      setErrors(newErrors);
      if (validFiles.length > 0) {
        onFilesSelected(validFiles);
      }
    },
    [maxFiles, onFilesSelected]
  );

  const onDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragOver(false);
      if (disabled) return;
      processFiles(e.dataTransfer.files);
    },
    [disabled, processFiles]
  );

  const onDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const onDragLeave = useCallback(() => setIsDragOver(false), []);

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        inputRef.current?.click();
      }
    },
    []
  );

  return (
    <div className={className}>
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label={`${multiple ? 'Select PDF files' : 'Select a PDF file'} — drag and drop or click to browse`}
        aria-disabled={disabled}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onClick={() => !disabled && inputRef.current?.click()}
        onKeyDown={onKeyDown}
        className={[
          'relative flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-8 text-center transition-colors cursor-pointer select-none',
          isDragOver
            ? 'border-blue-400 bg-blue-50 dark:bg-blue-950/30 dark:border-blue-500'
            : 'border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 hover:border-gray-400 dark:hover:border-gray-600',
          disabled ? 'opacity-50 cursor-not-allowed' : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <svg
          className="h-10 w-10 text-gray-400 dark:text-gray-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <div>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {isDragOver ? 'Drop PDF here' : 'Drag & drop PDF here'}
          </p>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
            or{' '}
            <span className="text-blue-600 dark:text-blue-400 underline underline-offset-2">
              browse files
            </span>
          </p>
          <p className="mt-2 text-xs text-gray-400 dark:text-gray-600">
            PDF only · Max 100 MB{multiple ? ` · Up to ${maxFiles} files` : ''}
          </p>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf,.pdf"
          multiple={multiple}
          disabled={disabled}
          onChange={(e) => e.target.files && processFiles(e.target.files)}
          className="sr-only"
          aria-hidden="true"
          tabIndex={-1}
        />
      </div>

      {errors.length > 0 && (
        <ul
          role="alert"
          aria-live="polite"
          className="mt-2 space-y-1"
        >
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

export { buildPdfFile, formatFileSize as formatPdfSize };
