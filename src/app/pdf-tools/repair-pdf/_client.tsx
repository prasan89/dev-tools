'use client';

import React, { useCallback, useRef, useState } from 'react';
import type { PdfFile } from '@/types/pdf';
import type { PdfToolResult } from '@/types/pdf';
import { repairPdf } from '@/lib/pdf/repairPdf';

type Status = 'idle' | 'repairing' | 'done' | 'error';

export default function RepairPdfPage() {
  const [pdfFile, setPdfFile] = useState<PdfFile | null>(null);
  const [status, setStatus] = useState<Status>('idle');
  const [result, setResult] = useState<PdfToolResult | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((file: File) => {
    if (!file.name.toLowerCase().endsWith('.pdf')) return;
    const pf: PdfFile = {
      id: `repair-${Date.now()}`,
      name: file.name,
      size: file.size,
      file,
      pageCount: null,
      objectUrl: null,
      isPasswordProtected: false,
      isCorrupted: false,
      loadedAt: Date.now(),
    };
    setPdfFile(pf);
    setStatus('idle');
    setResult(null);
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const f = e.dataTransfer.files[0];
      if (f) handleFile(f);
    },
    [handleFile],
  );

  const onInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0];
      if (f) handleFile(f);
    },
    [handleFile],
  );

  const handleRepair = useCallback(async () => {
    if (!pdfFile) return;
    setStatus('repairing');
    const res = await repairPdf(pdfFile);
    setResult(res);
    setStatus(res.success ? 'done' : 'error');
  }, [pdfFile]);

  const handleDownload = useCallback(() => {
    if (!result?.outputFile) return;
    const url = URL.createObjectURL(result.outputFile.blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = result.outputFile.filename;
    a.click();
    URL.revokeObjectURL(url);
  }, [result]);

  return (
    <main className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Repair PDF</h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Re-serialize a PDF to fix minor structural issues. Files never leave your browser.
        </p>
      </div>

      <aside className="rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/20 px-4 py-3 text-xs text-amber-800 dark:text-amber-400" role="note">
        This tool re-serializes the PDF using pdf-lib. It may fix minor structural issues (bad cross-reference tables, some encoding problems) but cannot repair severely corrupted files.
      </aside>

      <div
        role="button"
        tabIndex={0}
        aria-label="Drop zone for PDF file"
        onDrop={onDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
        className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 p-12 cursor-pointer hover:border-blue-400 transition-colors"
      >
        {pdfFile ? (
          <p className="text-sm text-green-700 dark:text-green-400 font-medium text-center break-all">
            {pdfFile.name}
          </p>
        ) : (
          <>
            <svg className="h-10 w-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p className="text-sm text-gray-500 dark:text-gray-400">Drop a PDF here, or click to browse</p>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,application/pdf"
          className="sr-only"
          onChange={onInputChange}
          aria-label="Choose PDF file"
        />
      </div>

      {pdfFile && status === 'idle' && (
        <div className="flex justify-center">
          <button
            onClick={handleRepair}
            className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
          >
            Attempt Repair
          </button>
        </div>
      )}

      {status === 'repairing' && (
        <div role="status" aria-live="polite" className="flex items-center justify-center gap-3 py-4">
          <svg className="h-5 w-5 animate-spin text-blue-600" fill="none" viewBox="0 0 24 24" aria-hidden="true">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span className="text-sm text-gray-600 dark:text-gray-400">Attempting repair…</span>
        </div>
      )}

      {status === 'done' && result?.success && (
        <div className="space-y-4">
          <div className="rounded-lg border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/20 p-4 text-sm text-green-700 dark:text-green-400">
            PDF re-serialized successfully. Minor structural issues may have been fixed.
          </div>
          <div className="flex justify-center">
            <button
              onClick={handleDownload}
              className="rounded-lg bg-green-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-green-700 transition-colors"
            >
              Download Repaired PDF
            </button>
          </div>
        </div>
      )}

      {status === 'error' && result && (
        <div role="alert" className="space-y-2">
          <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20 p-4 text-sm text-red-700 dark:text-red-400">
            {result.error}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            The file may be too corrupted for automatic repair.
          </p>
        </div>
      )}
    </main>
  );
}
