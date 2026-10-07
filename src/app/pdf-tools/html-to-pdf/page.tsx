'use client';

import { useState, useCallback } from 'react';
import { PdfDownload } from '@/components/pdf/PdfDownload';
import { convertHtmlToPdf } from '@/lib/pdf/htmlToPdf';

export default function HtmlToPdfPage() {
  const [html, setHtml] = useState('');
  const [title, setTitle] = useState('');
  const [blob, setBlob] = useState<Blob | null>(null);
  const [filename, setFilename] = useState('converted.pdf');
  const [state, setState] = useState<'idle' | 'converting' | 'done' | 'error'>('idle');
  const [error, setError] = useState('');

  const handleConvert = useCallback(async () => {
    if (!html.trim()) return;
    setState('converting');
    setBlob(null);
    const result = await convertHtmlToPdf(html, title);
    if (result.success && result.outputFile) {
      setBlob(result.outputFile.blob);
      setFilename(result.outputFile.filename);
      setState('done');
    } else {
      setError(result.error ?? 'Conversion failed');
      setState('error');
    }
  }, [html, title]);

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">HTML to PDF</h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Convert HTML content to a PDF document. Paste or type HTML below.
        </p>
      </div>

      <aside className="rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/20 p-3 text-xs text-amber-800 dark:text-amber-300">
        Basic conversion — preserves headings, paragraphs, and list items. Complex CSS layouts and images are not supported.
      </aside>

      <div className="space-y-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5">
        <div>
          <label htmlFor="pdf-title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Document title (used as filename)
          </label>
          <input
            id="pdf-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="My document"
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          />
        </div>

        <div>
          <label htmlFor="html-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            HTML content
          </label>
          <textarea
            id="html-input"
            value={html}
            onChange={(e) => setHtml(e.target.value)}
            rows={14}
            placeholder={'<h1>My Title</h1>\n<p>Some paragraph text here.</p>\n<ul>\n  <li>Item one</li>\n  <li>Item two</li>\n</ul>'}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm font-mono bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 resize-y"
          />
        </div>

        <button
          onClick={handleConvert}
          disabled={!html.trim() || state === 'converting'}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {state === 'converting' ? 'Converting…' : 'Convert to PDF'}
        </button>
      </div>

      {state === 'error' && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      {state === 'done' && blob && (
        <div className="rounded-xl border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/20 p-5">
          <p className="text-sm font-medium text-green-800 dark:text-green-300 mb-3">PDF ready</p>
          <PdfDownload blob={blob} filename={filename} label="Download PDF" />
        </div>
      )}
    </main>
  );
}
