'use client';

import { useState, useCallback, useRef } from 'react';
import { PdfToolLayout } from '@/components/pdf/PdfToolLayout';
import { PdfDropzone } from '@/components/pdf/PdfDropzone';
import { PdfDownload } from '@/components/pdf/PdfDownload';
import { PdfPasswordDialog } from '@/components/pdf/PdfPasswordDialog';
import { formatFileSize } from '@/lib/pdf/validation';
import type { PdfFile } from '@/types/pdf';
import { unlockPdf } from '@/lib/pdf/unlockPdf';

type SaveState = 'idle' | 'saving' | 'done' | 'error';
type DialogState = 'hidden' | 'required' | 'incorrect';

export default function UnlockPdfPage() {
  const [pdfFile, setPdfFile] = useState<PdfFile | null>(null);
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [saveError, setSaveError] = useState('');
  const [downloadBlob, setDownloadBlob] = useState<Blob | null>(null);
  const [downloadName, setDownloadName] = useState('');
  const [dialogState, setDialogState] = useState<DialogState>('hidden');

  // Bridge: the pdfjs onPassword callback hands us an updatePassword fn.
  // We store it here so the dialog's submit handler can invoke it.
  const pendingPasswordRef = useRef<((pw: string) => void) | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const handleFile = useCallback((files: PdfFile[]) => {
    setPdfFile(files[0] ?? null);
    setSaveState('idle');
    setDownloadBlob(null);
    setDownloadName('');
    setSaveError('');
    setDialogState('hidden');
    pendingPasswordRef.current = null;
    abortRef.current?.abort();
    abortRef.current = null;
  }, []);

  const handleUnlock = useCallback(async () => {
    if (!pdfFile) return;
    setSaveState('saving');
    setSaveError('');
    setDialogState('hidden');

    const ac = new AbortController();
    abortRef.current = ac;

    const result = await unlockPdf(pdfFile, (updatePassword, reason) => {
      pendingPasswordRef.current = updatePassword;
      setDialogState(reason === 'incorrect' ? 'incorrect' : 'required');
    });

    abortRef.current = null;

    if (result.success && result.outputFile) {
      setDownloadBlob(result.outputFile.blob);
      setDownloadName(result.outputFile.filename);
      setSaveState('done');
      setDialogState('hidden');
    } else if (result.error === 'Cancelled') {
      setSaveState('idle');
      setDialogState('hidden');
    } else {
      setSaveError(result.error ?? 'Failed to unlock PDF');
      setSaveState('error');
      setDialogState('hidden');
    }
  }, [pdfFile]);

  const handlePasswordSubmit = useCallback((password: string) => {
    const fn = pendingPasswordRef.current;
    pendingPasswordRef.current = null;
    setDialogState('hidden');
    if (fn) fn(password);
  }, []);

  const handlePasswordCancel = useCallback(() => {
    pendingPasswordRef.current = null;
    setDialogState('hidden');
    abortRef.current?.abort();
    abortRef.current = null;
    setSaveState('idle');
  }, []);

  return (
    <PdfToolLayout title="Unlock PDF" description="Remove the password from a PDF. Processed entirely in your browser — your file never leaves your device.">
      {dialogState !== 'hidden' && (
        <PdfPasswordDialog
          message={dialogState === 'incorrect' ? 'Incorrect password. Please try again.' : 'This PDF is password protected. Enter the password to continue.'}
          isIncorrect={dialogState === 'incorrect'}
          onSubmit={handlePasswordSubmit}
          onCancel={handlePasswordCancel}
        />
      )}

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
              onClick={() => { setPdfFile(null); setSaveState('idle'); setDownloadBlob(null); }}
              className="ml-4 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              Remove
            </button>
          </div>

          <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Click <strong>Remove Password</strong> to start. If this PDF is password protected, you will be prompted to enter the password.
            </p>
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
