'use client';

import { useState, useCallback } from 'react';
import { PdfToolLayout } from '@/components/pdf/PdfToolLayout';
import { PdfDropzone } from '@/components/pdf/PdfDropzone';
import { PdfDownload } from '@/components/pdf/PdfDownload';
import { formatFileSize } from '@/lib/pdf/validation';
import type { PdfFile } from '@/types/pdf';
import {
  defaultProtectConfig,
  generateOwnerPassword,
  buildProtectedPdf,
} from '@/lib/pdf/protectPdf';
import type { ProtectConfig } from '@/lib/pdf/protectPdf';

type SaveState = 'idle' | 'saving' | 'done' | 'error';

function passwordStrength(pw: string): { label: string; color: string; width: string } {
  if (pw.length === 0) return { label: '', color: 'bg-gray-200', width: '0%' };
  if (pw.length < 6) return { label: 'Weak', color: 'bg-red-500', width: '25%' };
  if (pw.length < 10) return { label: 'Fair', color: 'bg-yellow-400', width: '50%' };
  const hasUpper = /[A-Z]/.test(pw);
  const hasNum = /[0-9]/.test(pw);
  const hasSpecial = /[^A-Za-z0-9]/.test(pw);
  const extras = [hasUpper, hasNum, hasSpecial].filter(Boolean).length;
  if (extras >= 2) return { label: 'Strong', color: 'bg-green-500', width: '100%' };
  return { label: 'Good', color: 'bg-blue-500', width: '75%' };
}

export default function ProtectPdfPage() {
  const [pdfFile, setPdfFile] = useState<PdfFile | null>(null);
  const [config, setConfig] = useState<ProtectConfig>(defaultProtectConfig());
  const [confirmPassword, setConfirmPassword] = useState('');
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
  }, []);

  const handleAutoGenerate = useCallback(() => {
    setConfig((prev) => ({ ...prev, ownerPassword: generateOwnerPassword() }));
  }, []);

  const handleProtect = useCallback(async () => {
    if (!pdfFile) return;
    if (!config.userPassword.trim()) {
      setSaveError('Please enter a user password');
      return;
    }
    if (config.userPassword !== confirmPassword) {
      setSaveError('Passwords do not match');
      return;
    }
    setSaveState('saving');
    setSaveError('');
    const result = await buildProtectedPdf(pdfFile, config);
    if (result.success && result.outputFile) {
      setDownloadBlob(result.outputFile.blob);
      setDownloadName(result.outputFile.filename);
      setSaveState('done');
    } else {
      setSaveError(result.error ?? 'Failed to protect PDF');
      setSaveState('error');
    }
  }, [pdfFile, config, confirmPassword]);

  const strength = passwordStrength(config.userPassword);
  const passwordsMatch = confirmPassword === '' || config.userPassword === confirmPassword;

  return (
    <PdfToolLayout title="Password Protect PDF" description="Encrypt your PDF with a password. Processed entirely in your browser — your file never leaves your device.">
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

          {/* Password form */}
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5 space-y-4">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Set Password</h2>

            {/* User password */}
            <div className="space-y-1">
              <label htmlFor="user-pw" className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                Open Password <span className="text-red-500">*</span>
              </label>
              <input
                id="user-pw"
                type="password"
                value={config.userPassword}
                onChange={(e) => setConfig((prev) => ({ ...prev, userPassword: e.target.value }))}
                placeholder="Password to open the PDF"
                className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-describedby="pw-strength"
              />
              {config.userPassword && (
                <div id="pw-strength" className="mt-1">
                  <div className="h-1.5 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                    <div className={`h-1.5 rounded-full transition-all ${strength.color}`} style={{ width: strength.width }} />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Strength: {strength.label}</p>
                </div>
              )}
            </div>

            {/* Confirm password */}
            <div className="space-y-1">
              <label htmlFor="confirm-pw" className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <input
                id="confirm-pw"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                className={`w-full rounded-md border px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  passwordsMatch ? 'border-gray-300 dark:border-gray-600' : 'border-red-500'
                }`}
                aria-invalid={!passwordsMatch}
              />
              {!passwordsMatch && (
                <p className="text-xs text-red-500">Passwords do not match</p>
              )}
            </div>

            {/* Owner password */}
            <div className="space-y-1">
              <label htmlFor="owner-pw" className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                Owner Password <span className="text-xs font-normal text-gray-400">(optional — controls permissions)</span>
              </label>
              <div className="flex gap-2">
                <input
                  id="owner-pw"
                  type="text"
                  value={config.ownerPassword}
                  onChange={(e) => setConfig((prev) => ({ ...prev, ownerPassword: e.target.value }))}
                  placeholder="Auto-generated if left empty"
                  className="flex-1 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={handleAutoGenerate}
                  className="rounded-md border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Generate
                </button>
              </div>
            </div>
          </div>

          {/* Permissions */}
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5 space-y-3">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Permissions</h2>
            {(
              [
                { key: 'allowPrinting', label: 'Allow printing' },
                { key: 'allowCopying', label: 'Allow copying text' },
                { key: 'allowModifying', label: 'Allow modifying' },
              ] as { key: keyof ProtectConfig; label: string }[]
            ).map(({ key, label }) => (
              <label key={key} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config[key] as boolean}
                  onChange={(e) => setConfig((prev) => ({ ...prev, [key]: e.target.checked }))}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
              </label>
            ))}
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
              onClick={handleProtect}
              disabled={saveState === 'saving' || !config.userPassword.trim() || !passwordsMatch}
              className="w-full rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-sm font-medium py-2.5 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              {saveState === 'saving' ? 'Protecting…' : 'Protect PDF'}
            </button>
          )}
        </div>
      )}
    </PdfToolLayout>
  );
}
