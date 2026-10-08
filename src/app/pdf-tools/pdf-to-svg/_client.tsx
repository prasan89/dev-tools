'use client';

import { useCallback, useState } from 'react';
import { PdfToolLayout } from '@/components/pdf/PdfToolLayout';
import { PdfDropzone } from '@/components/pdf/PdfDropzone';
import type { PdfFile } from '@/types/pdf';
import { convertPdfToSvg } from '@/lib/pdf/pdfToSvg';

type State = 'idle' | 'loading' | 'done' | 'error';

export default function PdfToSvgPage() {
  const [state, setState] = useState<State>('idle');
  const [svgs, setSvgs] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [filename, setFilename] = useState('');

  const handleFileSelected = useCallback(async (files: PdfFile[]) => {
    const f = files[0];
    if (!f) return;
    setState('loading');
    setError(null);
    setFilename(f.name);
    const result = await convertPdfToSvg(f);
    if (result.success && result.svgs) {
      setSvgs(result.svgs);
      setState('done');
    } else {
      setError(result.error ?? 'Failed to convert');
      setState('error');
    }
  }, []);

  const handleDownload = (svg: string, idx: number) => {
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename.replace(/\.pdf$/i, '')}_page${idx + 1}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadAll = () => {
    svgs.forEach((svg, i) => handleDownload(svg, i));
  };

  return (
    <PdfToolLayout title="PDF to SVG" description="Convert PDF pages to SVG vector format.">
      {state === 'idle' && <PdfDropzone onFilesSelected={handleFileSelected} multiple={false} />}
      {state === 'loading' && <div className="flex items-center justify-center h-48 text-sm text-gray-500">Converting to SVG…</div>}
      {state === 'error' && (
        <div className="space-y-3">
          <p className="text-sm text-red-500 text-center">{error}</p>
          <button onClick={() => setState('idle')} className="text-sm underline text-gray-500 block mx-auto">Try again</button>
        </div>
      )}
      {state === 'done' && (
        <div className="space-y-4">
          <div className="flex gap-3 justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">{svgs.length} page{svgs.length !== 1 ? 's' : ''} converted</span>
            {svgs.length > 1 && (
              <button onClick={handleDownloadAll} className="rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 transition-colors">Download All SVGs</button>
            )}
          </div>
          <div className="space-y-3">
            {svgs.map((svg, i) => (
              <div key={i} className="flex items-center justify-between rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4">
                <span className="text-sm text-gray-700 dark:text-gray-300">Page {i + 1}</span>
                <button onClick={() => handleDownload(svg, i)} className="rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1.5 transition-colors">Download SVG</button>
              </div>
            ))}
          </div>
          <button onClick={() => { setState('idle'); setSvgs([]); }} className="text-sm text-gray-500 hover:text-gray-700 underline block">Load a different PDF</button>
        </div>
      )}
    </PdfToolLayout>
  );
}
