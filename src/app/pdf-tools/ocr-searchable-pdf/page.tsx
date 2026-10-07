'use client';

import { useCallback, useState } from 'react';
import { PdfToolLayout } from '@/components/pdf/PdfToolLayout';
import { PdfDropzone } from '@/components/pdf/PdfDropzone';
import { PdfDownload } from '@/components/pdf/PdfDownload';
import type { PdfFile } from '@/types/pdf';
import { ocrPdf } from '@/lib/pdf/ocrPdf';

type State = 'idle' | 'processing' | 'done' | 'error';

async function buildSearchablePdf(pdfFile: PdfFile, pages: Array<{ pageIndex: number; text: string }>): Promise<Blob> {
  const { PDFDocument, rgb, StandardFonts } = await import('pdf-lib');

  const buf = await new Promise<ArrayBuffer>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(pdfFile.file);
  });

  const pdfDoc = await PDFDocument.load(buf);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  for (const { pageIndex, text } of pages) {
    if (pageIndex >= pdfDoc.getPageCount()) continue;
    const page = pdfDoc.getPage(pageIndex);
    // Draw invisible text layer (opacity 0 — searchable but not visible)
    page.drawText(text.slice(0, 2000), {
      x: 0, y: 10,
      size: 1,
      font,
      color: rgb(1, 1, 1),
      opacity: 0,
    });
  }

  const bytes = await pdfDoc.save();
  return new Blob([bytes.buffer as ArrayBuffer], { type: 'application/pdf' });
}

export default function OcrSearchablePdfPage() {
  const [state, setState] = useState<State>('idle');
  const [progress, setProgress] = useState('');
  const [downloadBlob, setDownloadBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filename, setFilename] = useState('');

  const handleFileSelected = useCallback(async (files: PdfFile[]) => {
    const f = files[0];
    if (!f) return;
    setState('processing');
    setError(null);
    setFilename(f.name);
    setProgress('Starting OCR…');

    const ocrResult = await ocrPdf(f.file, f.pageCount ?? 1, ({ pageIndex, total }) => {
      setProgress(`OCR: page ${pageIndex + 1} of ${total}…`);
    });

    if (!ocrResult.success || !ocrResult.pages) {
      setError(ocrResult.error ?? 'OCR failed');
      setState('error');
      return;
    }

    setProgress('Building searchable PDF…');
    try {
      const blob = await buildSearchablePdf(f, ocrResult.pages);
      setDownloadBlob(blob);
      setState('done');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to build PDF');
      setState('error');
    }
  }, []);

  return (
    <PdfToolLayout title="OCR to Searchable PDF" description="Add a searchable text layer to scanned PDFs.">
      <aside className="mb-4 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/20 px-4 py-3 text-xs text-amber-800 dark:text-amber-400">
        OCR accuracy depends on scan quality. Tesseract.js (~20MB) downloads on first use.
      </aside>

      {state === 'idle' && <PdfDropzone onFilesSelected={handleFileSelected} multiple={false} />}

      {state === 'processing' && (
        <div className="flex flex-col items-center justify-center h-48 gap-3">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-600 dark:text-gray-400">{progress}</p>
        </div>
      )}

      {state === 'error' && (
        <div className="space-y-3">
          <p className="text-sm text-red-500 text-center">{error}</p>
          <button onClick={() => setState('idle')} className="text-sm underline text-gray-500 block mx-auto">Try again</button>
        </div>
      )}

      {state === 'done' && downloadBlob && (
        <div className="space-y-4">
          <p className="text-sm text-green-600 dark:text-green-400 text-center font-medium">Searchable PDF ready!</p>
          <PdfDownload blob={downloadBlob} filename={filename.replace(/\.pdf$/i, '') + '_searchable.pdf'} />
          <button onClick={() => { setState('idle'); setDownloadBlob(null); }} className="text-sm text-gray-500 hover:text-gray-700 underline block mx-auto">Load a different PDF</button>
        </div>
      )}
    </PdfToolLayout>
  );
}
