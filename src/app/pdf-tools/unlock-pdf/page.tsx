'use client';

import { useState, useCallback } from 'react';
import { PdfToolLayout } from '@/components/pdf/PdfToolLayout';
import { PdfDropzone } from '@/components/pdf/PdfDropzone';
import { PdfDownload } from '@/components/pdf/PdfDownload';
import { formatFileSize } from '@/lib/pdf/validation';
import type { PdfFile } from '@/types/pdf';
import { unlockPdf } from '@/lib/pdf/unlockPdf';

type SaveState = 'idle' | 'saving' | 'done' | 'error';

export default function UnlockPdfPage() {
  const [pdfFile, setPdfFile] = useState<PdfFile | null>(null);
  const [password, setPassword] = useState('');
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [saveError, setSaveError] = useState('');
  const [downloadBlob, setDownloadBlob] = useState<Blob | null>(null);
  const [downloadName, setDownloadName] = useState('');

  const handleFile = useCallback((files: PdfFile[]) => {
    setPdfFile(files[0] ?? null);
    setSaveState('idle');
    setDownloadBlob(null);
    setDownloadName('');
    setSaveError('');
    setPassword('');
  }, []);

  const handleUnlock = useCallback(async () => {
    if (!pdfFile) return;
    setSaveState('saving');
    setSaveError('');
    const result = await unlockPdf(pdfFile, password);
    if (result.success && result.outputFile) {
      setDownloadBlob(result.outputFile.blob);
      setDownloadName(result.outputFile.filename);
      setSaveState('done');
    } else {
      setSaveError(result.error ?? 'Failed to unlock PDF');
      setSaveState('error');
    }
  }, [pdfFile, password]);

  return (
    <PdfToolLayout title="Unlock PDF" description="Remove the password from a PDF. Processed entirely in your browser — your file never leaves your device.">
      {!pdfFile ? (
        <PdfDropzone onFilesSelected={handleFile} multiple={false} />
      ) : (
        <div className="space-y-5">
          {/* File info */}
          <div className="flex items-center justify-between rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3">
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{pdfFile.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{formatFileSize(pdfFile.size)}</p>
            </div>
            <button
              onClick={() => { setPdfFile(null); setSaveState('idle'); setDownloadBlob(null); setPassword(''); }}
              className="ml-4 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              Remove
            </button>
          </div>

          {/* Password input */}
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5 space-y-3">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Enter PDF Password</h2>
            <div>
              <label htmlFor="unlock-pw" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Password
              </label>
              <input
                id="unlock-pw"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleUnlock(); }}
                placeholder="Enter the PDF password"
                className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
              <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                Leave blank if the PDF has no password (re-saves without encryption).
              </p>
            </div>
          </div>

          {/* Error */}
          {saveState === 'error' && saveError && (
            <p role="alert" className="text-sm text-red-600 dark:text-red-400">{saveError}</p>
          )}

          {/* Actions */}
          {saveState === 'done' && downloadBlob ? (
            <PdfDownload blob={downloadBlob} filename={downloadName} />
          ) : (
            <button
              onClick={handleUnlock}
              disabled={saveState === 'saving'}
              className="w-full rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-sm font-medium py-2.5 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              {saveState === 'saving' ? 'Unlocking…' : 'Remove Password'}
            </button>
          )}
        </div>
      )}
    </PdfToolLayout>
  );
}
