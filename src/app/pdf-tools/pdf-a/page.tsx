'use client';

import { useState, useCallback } from 'react';
import { convertToPdfA } from '@/lib/pdf/pdfAConverter';
import type { PdfALevel } from '@/lib/pdf/pdfAConverter';
import type { PdfFile } from '@/types/pdf';
import { PdfDropzone } from '@/components/pdf/PdfDropzone';
import { PdfDownload } from '@/components/pdf/PdfDownload';

export default function PdfAPage() {
  const [pdfFile, setPdfFile] = useState<PdfFile | null>(null);
  const [level, setLevel] = useState<PdfALevel>('PDF/A-1b');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [outputBlob, setOutputBlob] = useState<Blob | null>(null);

  const handleFile = useCallback((files: PdfFile[]) => {
    if (files[0]) {
      setPdfFile(files[0]);
      setOutputBlob(null);
      setError(null);
    }
  }, []);

  const handleConvert = useCallback(async () => {
    if (!pdfFile) return;
    setProcessing(true);
    setError(null);
    setOutputBlob(null);
    const result = await convertToPdfA(pdfFile, level);
    setProcessing(false);
    if (result.success && result.outputFile) {
      setOutputBlob(result.outputFile.blob);
    } else {
      setError(result.error ?? 'Conversion failed');
    }
  }, [pdfFile, level]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">PDF/A Converter</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Re-serialize a PDF with PDF/A metadata for long-term archiving. Runs entirely in your browser.
        </p>
      </div>

      <aside className="rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/20 px-4 py-3 text-xs text-amber-800 dark:text-amber-400">
        <strong>Best-effort conversion.</strong> pdf-lib re-serializes the document and sets metadata, but cannot perform full PDF/A validation (font embedding verification, color space checks). For certified PDF/A, use dedicated software.
      </aside>

      <PdfDropzone onFilesSelected={handleFile} maxFiles={1} />

      {pdfFile && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              PDF/A Conformance Level
            </label>
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value as PdfALevel)}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="PDF/A-1b">PDF/A-1b — Basic (ISO 19005-1)</option>
              <option value="PDF/A-2b">PDF/A-2b — Extended (ISO 19005-2)</option>
              <option value="PDF/A-3b">PDF/A-3b — With attachments (ISO 19005-3)</option>
            </select>
          </div>

          <button
            onClick={handleConvert}
            disabled={processing}
            className="w-full rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 px-4 py-2.5 text-sm font-semibold text-white transition-colors"
          >
            {processing ? 'Converting…' : 'Convert to PDF/A'}
          </button>
        </div>
      )}

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">{error}</p>
      )}

      {outputBlob && (
        <PdfDownload blob={outputBlob} filename={`${pdfFile!.name.replace(/\.pdf$/i, '')}_pdfa.pdf`} label="Download PDF/A" />
      )}
    </div>
  );
}
