'use client';

import { useCallback, useState } from 'react';
import { PdfToolLayout } from '@/components/pdf/PdfToolLayout';
import { PdfDropzone } from '@/components/pdf/PdfDropzone';
import type { PdfFile } from '@/types/pdf';
import { convertPdfToHtml } from '@/lib/pdf/pdfToHtml';

type State = 'idle' | 'loading' | 'done' | 'error';

export default function PdfToHtmlPage() {
  const [state, setState] = useState<State>('idle');
  const [html, setHtml] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [filename, setFilename] = useState('');

  const handleFileSelected = useCallback(async (files: PdfFile[]) => {
    const f = files[0];
    if (!f) return;
    setState('loading');
    setError(null);
    setFilename(f.name);
    const result = await convertPdfToHtml(f);
    if (result.success && result.html !== undefined) {
      setHtml(result.html);
      setState('done');
    } else {
      setError(result.error ?? 'Failed to convert');
      setState('error');
    }
  }, []);

  const handleDownload = () => {
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename.replace(/\.pdf$/i, '') + '.html';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <PdfToolLayout title="PDF to HTML" description="Convert PDF pages to HTML format.">
      {state === 'idle' && <PdfDropzone onFilesSelected={handleFileSelected} multiple={false} />}
      {state === 'loading' && <div className="flex items-center justify-center h-48 text-sm text-gray-500">Converting to HTML…</div>}
      {state === 'error' && (
        <div className="space-y-3">
          <p className="text-sm text-red-500 text-center">{error}</p>
          <button onClick={() => setState('idle')} className="text-sm underline text-gray-500 block mx-auto">Try again</button>
        </div>
      )}
      {state === 'done' && (
        <div className="space-y-4">
          <div className="flex gap-3 justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">{html.length.toLocaleString()} chars</span>
            <button onClick={handleDownload} className="rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 transition-colors">Download .html</button>
          </div>
          <textarea readOnly value={html} className="w-full h-96 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-4 text-sm font-mono resize-y" />
          <button onClick={() => { setState('idle'); setHtml(''); }} className="text-sm text-gray-500 hover:text-gray-700 underline block">Load a different PDF</button>
        </div>
      )}
    </PdfToolLayout>
  );
}
