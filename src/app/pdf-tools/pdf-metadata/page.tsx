'use client';

import { useCallback, useState } from 'react';
import { PdfToolLayout } from '@/components/pdf/PdfToolLayout';
import { PdfDropzone } from '@/components/pdf/PdfDropzone';
import { PdfDownload } from '@/components/pdf/PdfDownload';
import type { PdfFile } from '@/types/pdf';
import type { PdfMetadata } from '@/lib/pdf/pdfMetadata';
import { emptyMetadata, readMetadata, buildMetadataEditedPdf } from '@/lib/pdf/pdfMetadata';

type LoadState = 'idle' | 'loading' | 'ready' | 'error';
type SaveState = 'idle' | 'saving' | 'done' | 'error';

const FIELD_LABELS: { key: keyof PdfMetadata; label: string; type?: string }[] = [
  { key: 'title', label: 'Title' },
  { key: 'author', label: 'Author' },
  { key: 'subject', label: 'Subject' },
  { key: 'keywords', label: 'Keywords' },
  { key: 'creator', label: 'Creator Application' },
  { key: 'producer', label: 'PDF Producer' },
  { key: 'creationDate', label: 'Creation Date', type: 'datetime-local' },
  { key: 'modificationDate', label: 'Modification Date', type: 'datetime-local' },
];

function isoToDatetimeLocal(iso: string): string {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    return d.toISOString().slice(0, 16);
  } catch {
    return '';
  }
}

function datetimeLocalToIso(local: string): string {
  if (!local) return '';
  try {
    return new Date(local).toISOString();
  } catch {
    return local;
  }
}

export default function PdfMetadataPage() {
  const [pdfFile, setPdfFile] = useState<PdfFile | null>(null);
  const [originalMeta, setOriginalMeta] = useState<PdfMetadata>(emptyMetadata());
  const [metadata, setMetadata] = useState<PdfMetadata>(emptyMetadata());
  const [loadState, setLoadState] = useState<LoadState>('idle');
  const [loadError, setLoadError] = useState('');
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [saveError, setSaveError] = useState('');
  const [downloadBlob, setDownloadBlob] = useState<Blob | null>(null);
  const [downloadFilename, setDownloadFilename] = useState('');

  const handleFile = useCallback(async (files: PdfFile[]) => {
    const f = files[0];
    if (!f) return;
    setPdfFile(f);
    setLoadState('loading');
    setLoadError('');
    setDownloadBlob(null);
    try {
      const meta = await readMetadata(f);
      setOriginalMeta(meta);
      setMetadata(meta);
      setLoadState('ready');
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to read metadata');
      setLoadState('error');
    }
  }, []);

  const handleFieldChange = useCallback((key: keyof PdfMetadata, rawValue: string) => {
    const value = (key === 'creationDate' || key === 'modificationDate')
      ? datetimeLocalToIso(rawValue)
      : rawValue;
    setMetadata((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleClearAll = useCallback(() => {
    setMetadata(emptyMetadata());
  }, []);

  const handleReset = useCallback(() => {
    setMetadata(originalMeta);
  }, [originalMeta]);

  const handleExport = useCallback(async (clearAll = false) => {
    if (!pdfFile) return;
    setSaveState('saving');
    setSaveError('');
    setDownloadBlob(null);
    try {
      const result = await buildMetadataEditedPdf(pdfFile, metadata, clearAll);
      if (result.success && result.outputFile) {
        setDownloadBlob(result.outputFile.blob);
        setDownloadFilename(result.outputFile.filename);
        setSaveState('done');
      } else {
        setSaveError(result.error ?? 'Export failed');
        setSaveState('error');
      }
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Export failed');
      setSaveState('error');
    }
  }, [pdfFile, metadata]);

  return (
    <PdfToolLayout title="PDF Metadata Editor" description="View and edit PDF document properties in your browser. Your file never leaves your device.">
      {loadState === 'idle' && (
        <PdfDropzone onFilesSelected={handleFile} maxFiles={1} />
      )}

      {loadState === 'loading' && (
        <div className="flex items-center justify-center py-16 text-sm text-gray-500 dark:text-gray-400">
          Reading metadata…
        </div>
      )}

      {loadState === 'error' && (
        <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20 p-4 text-sm text-red-700 dark:text-red-400">
          <p className="font-medium">Failed to read PDF</p>
          <p className="mt-1">{loadError}</p>
          <button
            onClick={() => setLoadState('idle')}
            className="mt-3 text-xs underline hover:no-underline"
          >
            Try another file
          </button>
        </div>
      )}

      {loadState === 'ready' && pdfFile && (
        <div className="space-y-6">
          {/* File info */}
          <div className="flex items-center justify-between rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-4 py-3 text-sm">
            <span className="font-medium text-gray-800 dark:text-gray-200 truncate max-w-[60%]">{pdfFile.name}</span>
            <button
              onClick={() => { setLoadState('idle'); setPdfFile(null); setDownloadBlob(null); }}
              className="ml-3 text-xs text-gray-500 hover:text-red-600 dark:hover:text-red-400 transition-colors shrink-0"
            >
              Remove
            </button>
          </div>

          {/* Metadata form */}
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 divide-y divide-gray-100 dark:divide-gray-800">
            <div className="px-4 py-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-200">Document Properties</h2>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleReset}
                  className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                >
                  Reset
                </button>
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="text-xs text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                >
                  Clear all
                </button>
              </div>
            </div>

            {FIELD_LABELS.map(({ key, label, type }) => {
              const isDate = type === 'datetime-local';
              const displayValue = isDate ? isoToDatetimeLocal(metadata[key]) : metadata[key];
              const originalValue = isDate ? isoToDatetimeLocal(originalMeta[key]) : originalMeta[key];
              const changed = metadata[key] !== originalMeta[key];

              return (
                <div key={key} className="px-4 py-3 grid grid-cols-[140px_1fr] gap-4 items-start">
                  <label
                    htmlFor={`meta-${key}`}
                    className="text-xs font-medium text-gray-500 dark:text-gray-400 pt-1.5 select-none"
                  >
                    {label}
                    {changed && (
                      <span className="ml-1 inline-block h-1.5 w-1.5 rounded-full bg-blue-500 align-middle" aria-label="modified" />
                    )}
                  </label>
                  <div className="space-y-1">
                    <input
                      id={`meta-${key}`}
                      type={type ?? 'text'}
                      value={displayValue}
                      onChange={(e) => handleFieldChange(key, e.target.value)}
                      placeholder={originalValue || `No ${label.toLowerCase()} set`}
                      className="w-full rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-1.5 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                    />
                    {!isDate && originalValue && originalValue !== displayValue && (
                      <p className="text-xs text-gray-400 dark:text-gray-600 truncate">
                        Original: {originalValue}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => handleExport(false)}
              disabled={saveState === 'saving'}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {saveState === 'saving' ? 'Saving…' : 'Download updated PDF'}
            </button>
            <button
              type="button"
              onClick={() => handleExport(true)}
              disabled={saveState === 'saving'}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Remove all metadata
            </button>
          </div>

          {saveState === 'error' && (
            <p className="text-sm text-red-600 dark:text-red-400">{saveError}</p>
          )}

          {saveState === 'done' && downloadBlob && (
            <PdfDownload blob={downloadBlob} filename={downloadFilename} label="Download PDF" />
          )}

          {/* Info note */}
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-4 py-3 text-xs text-gray-500 dark:text-gray-400 space-y-1">
            <p className="font-medium text-gray-600 dark:text-gray-300">About PDF metadata</p>
            <p>These fields are the standard document information dictionary (Title, Author, Subject, Keywords, Creator, Producer, dates). Editing them updates those properties in the output file.</p>
            <p>Some PDFs also embed metadata in XMP streams or binary content. This tool edits the standard InfoDict fields only — embedded fonts, binary attachments, and XMP metadata beyond these fields are preserved unchanged.</p>
          </div>
        </div>
      )}
    </PdfToolLayout>
  );
}
