'use client';

import { useState, useCallback } from 'react';
import { PdfDropzone } from '@/components/pdf/PdfDropzone';
import type { PdfFile } from '@/types/pdf';
import { extractTextFromPdf, type TextExtractionResult } from '@/lib/pdf/pdfToText';

type PageState = 'idle' | 'loading' | 'done' | 'error';

export default function PdfToTextPage() {
  const [state, setState] = useState<PageState>('idle');
  const [result, setResult] = useState<TextExtractionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showPages, setShowPages] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleFiles = useCallback(async (files: PdfFile[]) => {
    const file = files[0];
    if (!file) return;
    setState('loading');
    setError(null);
    setResult(null);
    const res = await extractTextFromPdf(file);
    if (res.success && res.result) {
      setResult(res.result);
      setState('done');
    } else {
      setError(res.error ?? 'Failed to extract text');
      setState('error');
    }
  }, []);

  const handleCopy = useCallback(async () => {
    if (!result) return;
    await navigator.clipboard.writeText(result.fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [result]);

  const handleDownload = useCallback(() => {
    if (!result) return;
    const blob = new Blob([result.fullText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'extracted_text.txt';
    a.click();
    URL.revokeObjectURL(url);
  }, [result]);

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">PDF to Text</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Extract all text from a PDF file. Your file never leaves your device.
        </p>
      </div>

      <PdfDropzone onFilesSelected={handleFiles} maxFiles={1} disabled={state === 'loading'} />

      {state === 'loading' && (
        <p className="text-sm text-gray-500 dark:text-gray-400 animate-pulse">Extracting text…</p>
      )}

      {state === 'error' && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      {state === 'done' && result && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {result.pages.length} page{result.pages.length !== 1 ? 's' : ''} extracted
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setShowPages((v) => !v)}
                className="rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                {showPages ? 'Show full text' : 'Show per page'}
              </button>
              <button
                onClick={handleCopy}
                className="rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                {copied ? 'Copied!' : 'Copy text'}
              </button>
              <button
                onClick={handleDownload}
                className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 transition-colors"
              >
                Download .txt
              </button>
            </div>
          </div>

          {showPages ? (
            <div className="space-y-4">
              {result.pages.map((p) => (
                <div key={p.pageIndex} className="rounded-lg border border-gray-200 dark:border-gray-700 p-3">
                  <p className="mb-1 text-xs font-semibold text-gray-500 dark:text-gray-400">
                    Page {p.pageIndex + 1}
                  </p>
                  <pre className="whitespace-pre-wrap text-xs text-gray-800 dark:text-gray-200 font-mono">
                    {p.text || '(no text on this page)'}
                  </pre>
                </div>
              ))}
            </div>
          ) : (
            <textarea
              readOnly
              value={result.fullText}
              rows={20}
              className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-3 text-xs font-mono text-gray-800 dark:text-gray-200 resize-y"
              aria-label="Extracted PDF text"
            />
          )}
        </div>
      )}
    </div>
  );
}
