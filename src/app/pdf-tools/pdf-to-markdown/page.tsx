'use client';

import { useState, useCallback } from 'react';
import { PdfDropzone } from '@/components/pdf/PdfDropzone';
import type { PdfFile } from '@/types/pdf';
import { extractMarkdownFromPdf, type MarkdownResult } from '@/lib/pdf/pdfToMarkdown';

type PageState = 'idle' | 'loading' | 'done' | 'error';

export default function PdfToMarkdownPage() {
  const [state, setState] = useState<PageState>('idle');
  const [result, setResult] = useState<MarkdownResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleFiles = useCallback(async (files: PdfFile[]) => {
    const file = files[0];
    if (!file) return;
    setState('loading');
    setError(null);
    setResult(null);
    const res = await extractMarkdownFromPdf(file);
    if (res.success && res.result) {
      setResult(res.result);
      setState('done');
    } else {
      setError(res.error ?? 'Failed to convert');
      setState('error');
    }
  }, []);

  const handleCopy = useCallback(async () => {
    if (!result) return;
    await navigator.clipboard.writeText(result.markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [result]);

  const handleDownload = useCallback(() => {
    if (!result) return;
    const blob = new Blob([result.markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'document.md';
    a.click();
    URL.revokeObjectURL(url);
  }, [result]);

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">PDF to Markdown</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Convert a PDF to Markdown format. Your file never leaves your device.
        </p>
      </div>

      <aside
        className="rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/20 px-4 py-3 text-xs text-amber-800 dark:text-amber-400"
        role="note"
      >
        Markdown structure is inferred from text formatting. Results may need manual review — headings, lists, and layout depend on the PDF's text content.
      </aside>

      <PdfDropzone onFilesSelected={handleFiles} maxFiles={1} disabled={state === 'loading'} />

      {state === 'loading' && (
        <p className="text-sm text-gray-500 dark:text-gray-400 animate-pulse">Converting…</p>
      )}

      {state === 'error' && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      {state === 'done' && result && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {result.pageCount} page{result.pageCount !== 1 ? 's' : ''} converted
            </span>
            <div className="flex gap-2">
              <button
                onClick={handleCopy}
                className="rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                {copied ? 'Copied!' : 'Copy Markdown'}
              </button>
              <button
                onClick={handleDownload}
                className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 transition-colors"
              >
                Download .md
              </button>
            </div>
          </div>
          <textarea
            readOnly
            value={result.markdown}
            rows={20}
            className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-3 text-xs font-mono text-gray-800 dark:text-gray-200 resize-y"
            aria-label="Extracted Markdown"
          />
        </div>
      )}
    </div>
  );
}
