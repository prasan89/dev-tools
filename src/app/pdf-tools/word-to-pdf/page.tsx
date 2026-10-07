'use client';

import { useState, useCallback } from 'react';
import { convertWordToPdf } from '@/lib/pdf/wordToPdf';
import { PdfDownload } from '@/components/pdf/PdfDownload';

type State = 'idle' | 'converting' | 'done' | 'error';

export default function WordToPdfPage() {
  const [state, setState] = useState<State>('idle');
  const [error, setError] = useState<string | null>(null);
  const [blob, setBlob] = useState<Blob | null>(null);
  const [filename, setFilename] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = useCallback(async (file: File) => {
    if (!/\.(docx?)/i.test(file.name)) {
      setError('Please select a .doc or .docx file');
      setState('error');
      return;
    }
    setState('converting');
    setError(null);
    setBlob(null);
    const result = await convertWordToPdf(file);
    if (result.success && result.outputFile) {
      setBlob(result.outputFile.blob);
      setFilename(result.outputFile.filename);
      setState('done');
    } else {
      setError(result.error ?? 'Conversion failed');
      setState('error');
    }
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Word to PDF</h1>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Convert DOCX files to PDF in your browser. Your file is never uploaded.
      </p>

      {/* Dropzone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors ${isDragging ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20' : 'border-gray-300 dark:border-gray-600 hover:border-blue-400'}`}
        onClick={() => document.getElementById('word-input')?.click()}
        role="button"
        aria-label="Drop Word file or click to browse"
      >
        <input
          id="word-input"
          type="file"
          accept=".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
        />
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {state === 'converting' ? 'Converting…' : 'Drop a .docx file here or click to browse'}
        </p>
      </div>

      {state === 'error' && (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">{error}</p>
      )}

      {state === 'done' && blob && (
        <div className="space-y-3">
          <p className="text-sm text-green-700 dark:text-green-400">Conversion successful.</p>
          <PdfDownload blob={blob} filename={filename} />
        </div>
      )}

      <aside className="rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/20 p-4 text-xs text-amber-800 dark:text-amber-300">
        <strong>Limitations:</strong> Supports common paragraphs, headings, bold/italic, lists, and tables. Complex Word layouts, floating objects, headers/footers, macros, and unsupported fonts may not convert correctly.
      </aside>
    </div>
  );
}
