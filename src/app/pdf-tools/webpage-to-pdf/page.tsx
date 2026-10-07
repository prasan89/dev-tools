'use client';

import { useState } from 'react';
import { convertUrlToPdf, convertHtmlSourceToPdf } from '@/lib/pdf/webPageToPdf';
import { PdfDownload } from '@/components/pdf/PdfDownload';

type Tab = 'url' | 'html';

export default function WebPageToPdfPage() {
  const [tab, setTab] = useState<Tab>('url');

  // URL tab state
  const [url, setUrl] = useState('');
  const [urlInstructions, setUrlInstructions] = useState('');

  // HTML tab state
  const [htmlSource, setHtmlSource] = useState('');
  const [htmlTitle, setHtmlTitle] = useState('');
  const [converting, setConverting] = useState(false);
  const [downloadBlob, setDownloadBlob] = useState<Blob | null>(null);
  const [downloadName, setDownloadName] = useState('');
  const [error, setError] = useState('');

  const handleShowInstructions = async () => {
    const result = await convertUrlToPdf(url);
    setUrlInstructions(result.instructions);
  };

  const handleOpenUrl = () => {
    if (url) window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleConvertHtml = async () => {
    if (!htmlSource.trim()) {
      setError('Please paste some HTML source first.');
      return;
    }
    setConverting(true);
    setError('');
    setDownloadBlob(null);
    try {
      const result = await convertHtmlSourceToPdf(htmlSource, htmlTitle);
      if (result.success && result.outputFile) {
        setDownloadBlob(result.outputFile.blob);
        setDownloadName(result.outputFile.filename);
      } else {
        setError(result.error ?? 'Conversion failed');
      }
    } finally {
      setConverting(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Web Page to PDF</h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Convert a URL or HTML source to PDF. All processing is browser-based — no uploads required.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        {(['url', 'html'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              tab === t
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            {t === 'url' ? 'From URL' : 'From HTML Source'}
          </button>
        ))}
      </div>

      {tab === 'url' && (
        <div className="space-y-4">
          <div
            className="rounded-lg border border-amber-200 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/20 p-4 text-sm text-amber-800 dark:text-amber-300"
            role="note"
          >
            <strong>Browser limitation:</strong> Due to cross-origin restrictions, fully automated URL-to-PDF is not
            possible in a browser. Use the guide below or paste the page&apos;s HTML source in the other tab.
          </div>

          <div className="space-y-3">
            <label htmlFor="url-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Web Page URL
            </label>
            <div className="flex gap-2">
              <input
                id="url-input"
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
                className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleOpenUrl}
                disabled={!url}
                className="rounded-lg bg-gray-100 dark:bg-gray-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50"
              >
                Open Page
              </button>
              <button
                onClick={handleShowInstructions}
                disabled={!url}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                Show Print Guide
              </button>
            </div>
          </div>

          {urlInstructions && (
            <div className="rounded-lg border border-blue-200 dark:border-blue-700 bg-blue-50 dark:bg-blue-950/20 p-4">
              <p className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">How to save as PDF:</p>
              <ol className="list-decimal list-inside space-y-1 text-sm text-blue-700 dark:text-blue-400">
                {urlInstructions.split('\n').filter(Boolean).map((line, i) => {
                  const text = line.replace(/^\d+\.\s*/, '');
                  return <li key={i}>{text}</li>;
                })}
              </ol>
            </div>
          )}
        </div>
      )}

      {tab === 'html' && (
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Paste the HTML source of any page. Headings, paragraphs, and lists will be preserved.
            Complex CSS layouts and images are not supported.
          </p>
          <div>
            <label htmlFor="title-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Document Title (used as filename)
            </label>
            <input
              id="title-input"
              type="text"
              value={htmlTitle}
              onChange={(e) => setHtmlTitle(e.target.value)}
              placeholder="My Page"
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="html-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              HTML Source
            </label>
            <textarea
              id="html-input"
              value={htmlSource}
              onChange={(e) => setHtmlSource(e.target.value)}
              rows={12}
              placeholder="<h1>Title</h1><p>Content...</p>"
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 dark:text-red-400" role="alert">{error}</p>
          )}

          <button
            onClick={handleConvertHtml}
            disabled={converting || !htmlSource.trim()}
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {converting ? 'Converting…' : 'Convert to PDF'}
          </button>

          {downloadBlob && (
            <PdfDownload blob={downloadBlob} filename={downloadName} />
          )}
        </div>
      )}
    </div>
  );
}
