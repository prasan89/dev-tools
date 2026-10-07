'use client';

import React, { useCallback, useRef, useState } from 'react';
import type { PdfFile } from '@/types/pdf';
import type { DiffResult, PageTextContent } from '@/lib/pdf/comparePdf';
import { diffTextPages, extractTextPages, hasDifferences } from '@/lib/pdf/comparePdf';

type Status = 'idle' | 'loading' | 'done' | 'error';

function useDropzone(label: string) {
  const [pdfFile, setPdfFile] = useState<PdfFile | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((file: File) => {
    if (!file.name.toLowerCase().endsWith('.pdf')) return;
    const pf: PdfFile = {
      id: `${label}-${Date.now()}`,
      name: file.name,
      size: file.size,
      file,
      pageCount: null,
      objectUrl: null,
      isPasswordProtected: false,
      isCorrupted: false,
      loadedAt: Date.now(),
    };
    setPdfFile(pf);
  }, [label]);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const f = e.dataTransfer.files[0];
      if (f) handleFile(f);
    },
    [handleFile],
  );

  const onInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0];
      if (f) handleFile(f);
    },
    [handleFile],
  );

  return { pdfFile, inputRef, onDrop, onInputChange };
}

export default function ComparePdfPage() {
  const doc1 = useDropzone('doc1');
  const doc2 = useDropzone('doc2');
  const [status, setStatus] = useState<Status>('idle');
  const [diffs, setDiffs] = useState<DiffResult[] | null>(null);
  const [pages1, setPages1] = useState<PageTextContent[] | null>(null);
  const [pages2, setPages2] = useState<PageTextContent[] | null>(null);
  const [error, setError] = useState('');

  const compare = useCallback(async () => {
    if (!doc1.pdfFile || !doc2.pdfFile) return;
    setStatus('loading');
    setError('');
    try {
      const [p1, p2] = await Promise.all([
        extractTextPages(doc1.pdfFile),
        extractTextPages(doc2.pdfFile),
      ]);
      setPages1(p1);
      setPages2(p2);
      setDiffs(diffTextPages(p1, p2));
      setStatus('done');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Comparison failed');
      setStatus('error');
    }
  }, [doc1.pdfFile, doc2.pdfFile]);

  const noDiffs = diffs !== null && !hasDifferences(diffs);

  return (
    <main className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Compare PDFs</h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Compare two PDF files side by side. Text content differences are highlighted. Files never leave your browser.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          { label: 'PDF Document 1', hook: doc1, id: 'pdf1' },
          { label: 'PDF Document 2', hook: doc2, id: 'pdf2' },
        ].map(({ label, hook, id }) => (
          <div key={id} className="space-y-2">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</p>
            <div
              role="button"
              tabIndex={0}
              aria-label={`Drop zone for ${label}`}
              onDrop={hook.onDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => hook.inputRef.current?.click()}
              onKeyDown={(e) => e.key === 'Enter' && hook.inputRef.current?.click()}
              className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 p-8 cursor-pointer hover:border-blue-400 transition-colors min-h-[120px]"
            >
              {hook.pdfFile ? (
                <p className="text-sm text-green-700 dark:text-green-400 font-medium text-center break-all">
                  {hook.pdfFile.name}
                </p>
              ) : (
                <>
                  <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Drop PDF or click to browse</p>
                </>
              )}
              <input
                ref={hook.inputRef}
                type="file"
                accept=".pdf,application/pdf"
                className="sr-only"
                onChange={hook.onInputChange}
                aria-label={`Choose ${label}`}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-center">
        <button
          onClick={compare}
          disabled={!doc1.pdfFile || !doc2.pdfFile || status === 'loading'}
          className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-busy={status === 'loading'}
        >
          {status === 'loading' ? 'Comparing…' : 'Compare PDFs'}
        </button>
      </div>

      {status === 'error' && (
        <div role="alert" className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20 p-4 text-sm text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      {status === 'done' && diffs && (
        <section aria-label="Comparison results" className="space-y-4">
          {noDiffs ? (
            <div className="rounded-lg border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/20 p-4 text-sm text-green-700 dark:text-green-400 font-medium">
              No text differences found — the documents have identical text content.
            </div>
          ) : (
            <>
              <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                Differences found
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Page counts: Document 1 has {pages1?.length ?? 0} page(s), Document 2 has {pages2?.length ?? 0} page(s).
              </p>
              <div className="space-y-3">
                {diffs
                  .filter((d) => d.added.length > 0 || d.removed.length > 0)
                  .map((d) => (
                    <div
                      key={d.pageIndex}
                      className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 space-y-2"
                    >
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Page {d.pageIndex + 1}
                        <span className="ml-2 text-xs text-gray-400">
                          ({d.unchanged} unchanged line{d.unchanged !== 1 ? 's' : ''})
                        </span>
                      </p>
                      {d.removed.length > 0 && (
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-red-600 dark:text-red-400">Removed from Doc 1:</p>
                          {d.removed.map((line, i) => (
                            <p key={i} className="text-xs font-mono bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-300 px-2 py-0.5 rounded break-all">
                              − {line}
                            </p>
                          ))}
                        </div>
                      )}
                      {d.added.length > 0 && (
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-green-600 dark:text-green-400">Added in Doc 2:</p>
                          {d.added.map((line, i) => (
                            <p key={i} className="text-xs font-mono bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-300 px-2 py-0.5 rounded break-all">
                              + {line}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </>
          )}
        </section>
      )}
    </main>
  );
}
