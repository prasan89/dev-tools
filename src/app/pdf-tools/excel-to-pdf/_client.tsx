'use client';

import { useState, useCallback } from 'react';
import { convertExcelToPdf, defaultExcelToPdfOptions } from '@/lib/pdf/excelToPdf';
import type { ExcelToPdfOptions } from '@/lib/pdf/excelToPdf';
import { PdfDownload } from '@/components/pdf/PdfDownload';

type State = 'idle' | 'parsing' | 'ready' | 'converting' | 'done' | 'error';

export default function ExcelToPdfPage() {
  const [state, setState] = useState<State>('idle');
  const [error, setError] = useState<string | null>(null);
  const [blob, setBlob] = useState<Blob | null>(null);
  const [filename, setFilename] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [options, setOptions] = useState<ExcelToPdfOptions>(defaultExcelToPdfOptions());
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = useCallback((f: File) => {
    if (!/\.(xlsx?)$/i.test(f.name)) {
      setError('Please select a .xls or .xlsx file');
      setState('error');
      return;
    }
    setFile(f);
    setBlob(null);
    setError(null);
    setState('ready');
  }, []);

  const handleConvert = useCallback(async () => {
    if (!file) return;
    setState('converting');
    const result = await convertExcelToPdf(file, options);
    if (result.success && result.outputFile) {
      setBlob(result.outputFile.blob);
      setFilename(result.outputFile.filename);
      setState('done');
    } else {
      setError(result.error ?? 'Conversion failed');
      setState('error');
    }
  }, [file, options]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, [handleFile]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Excel to PDF</h1>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Convert Excel spreadsheets to PDF in your browser. Your file is never uploaded.
      </p>

      {/* Dropzone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors ${isDragging ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20' : 'border-gray-300 dark:border-gray-600 hover:border-blue-400'}`}
        onClick={() => document.getElementById('excel-input')?.click()}
        role="button"
        aria-label="Drop Excel file or click to browse"
      >
        <input
          id="excel-input"
          type="file"
          accept=".xls,.xlsx,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
        />
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {file ? file.name : 'Drop a .xlsx file here or click to browse'}
        </p>
      </div>

      {(state === 'ready' || state === 'done') && (
        <div className="space-y-4">
          {/* Options */}
          <div className="flex flex-wrap gap-4 text-sm">
            <label className="flex items-center gap-2">
              Page size:
              <select
                value={options.pageSize}
                onChange={(e) => setOptions((o) => ({ ...o, pageSize: e.target.value as 'A4' | 'Letter' }))}
                className="border rounded px-2 py-1 text-sm dark:bg-gray-800 dark:border-gray-600"
              >
                <option value="A4">A4</option>
                <option value="Letter">Letter</option>
              </select>
            </label>
            <label className="flex items-center gap-2">
              Orientation:
              <select
                value={options.orientation}
                onChange={(e) => setOptions((o) => ({ ...o, orientation: e.target.value as 'portrait' | 'landscape' }))}
                className="border rounded px-2 py-1 text-sm dark:bg-gray-800 dark:border-gray-600"
              >
                <option value="portrait">Portrait</option>
                <option value="landscape">Landscape</option>
              </select>
            </label>
          </div>

          <button
            onClick={handleConvert}
            className="rounded-lg bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 text-sm font-medium"
          >
            Convert to PDF
          </button>
        </div>
      )}

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
        <strong>Limitations:</strong> Converts cell values and basic text. Formulas show stored values only. Charts, images, advanced formatting, macros and pivot tables are not supported.
      </aside>
    </div>
  );
}
