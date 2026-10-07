'use client';

import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Dataset } from '@/types/dataset';

interface DatasetViewerProps {
  dataset: Dataset;
}

type Tab = 'table' | 'json';

const PAGE_SIZE = 50;

function formatBytes(bytes: number): string {
  if (bytes >= 1_048_576) return `${(bytes / 1_048_576).toFixed(1)} MB`;
  if (bytes >= 1_024) return `${(bytes / 1_024).toFixed(1)} KB`;
  return `${bytes} B`;
}

function recordsToCSV(records: unknown[]): string {
  if (!records.length) return '';
  const first = records[0];
  if (typeof first !== 'object' || first === null) {
    return records.map(String).join('\n');
  }
  const keys = Object.keys(first as Record<string, unknown>);
  const header = keys.map((k) => JSON.stringify(k)).join(',');
  const rows = records.map((row) => {
    const r = row as Record<string, unknown>;
    return keys.map((k) => {
      const val = r[k];
      if (val === null || val === undefined) return '';
      if (typeof val === 'object') return JSON.stringify(JSON.stringify(val));
      return JSON.stringify(String(val));
    }).join(',');
  });
  return [header, ...rows].join('\n');
}

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function DatasetViewer({ dataset }: DatasetViewerProps) {
  const [activeTab, setActiveTab] = useState<Tab>('table');
  const [tableSearch, setTableSearch] = useState('');
  const [page, setPage] = useState(0);
  const [copied, setCopied] = useState(false);

  const records = dataset.data as Record<string, unknown>[];
  const columns = useMemo(() => {
    if (!records.length || typeof records[0] !== 'object' || records[0] === null) return [];
    return Object.keys(records[0]);
  }, [records]);

  const filteredRecords = useMemo(() => {
    if (!tableSearch.trim()) return records;
    const q = tableSearch.toLowerCase();
    return records.filter((row) =>
      Object.values(row).some((v) => String(v ?? '').toLowerCase().includes(q))
    );
  }, [records, tableSearch]);

  const totalPages = Math.ceil(filteredRecords.length / PAGE_SIZE);
  const pageRecords = filteredRecords.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const jsonString = useMemo(() => JSON.stringify(dataset.data, null, 2), [dataset.data]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(jsonString);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // silently fail
    }
  };

  const handleDownloadJSON = () => {
    downloadFile(jsonString, `${dataset.slug}.json`, 'application/json');
  };

  const handleDownloadCSV = () => {
    const csv = recordsToCSV(dataset.data as unknown[]);
    downloadFile(csv, `${dataset.slug}.csv`, 'text/csv');
  };

  const cellValue = (v: unknown): string => {
    if (v === null || v === undefined) return '';
    if (typeof v === 'object') return JSON.stringify(v);
    return String(v);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Header row: stats + actions */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
          <span>
            <span className="font-medium text-gray-900 dark:text-gray-100">
              {dataset.recordCount.toLocaleString()}
            </span>{' '}
            records
          </span>
          <span className="text-gray-300 dark:text-gray-600">|</span>
          <span>{formatBytes(dataset.fileSizeBytes)}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className={cn(
              'flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors',
              'border-gray-200 dark:border-gray-700',
              'bg-white dark:bg-gray-900',
              'hover:bg-gray-50 dark:hover:bg-gray-800',
              'text-gray-700 dark:text-gray-300'
            )}
          >
            {copied ? (
              <>
                <svg className="h-3.5 w-3.5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
                Copied
              </>
            ) : (
              <>
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184" />
                </svg>
                Copy JSON
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleDownloadJSON}
            className={cn(
              'flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors',
              'border-gray-200 dark:border-gray-700',
              'bg-white dark:bg-gray-900',
              'hover:bg-gray-50 dark:hover:bg-gray-800',
              'text-gray-700 dark:text-gray-300'
            )}
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            JSON
          </button>

          <button
            type="button"
            onClick={handleDownloadCSV}
            className={cn(
              'flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors',
              'border-gray-200 dark:border-gray-700',
              'bg-white dark:bg-gray-900',
              'hover:bg-gray-50 dark:hover:bg-gray-800',
              'text-gray-700 dark:text-gray-300'
            )}
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            CSV
          </button>
        </div>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-1 border-b border-gray-200 dark:border-gray-800">
        {(['table', 'json'] as Tab[]).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={cn(
              'px-4 py-2 text-sm font-medium capitalize transition-colors',
              activeTab === tab
                ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            )}
          >
            {tab === 'table' ? 'Table' : 'JSON'}
          </button>
        ))}
      </div>

      {/* Table view */}
      {activeTab === 'table' && (
        <div className="flex flex-col gap-3">
          {columns.length > 0 && (
            <input
              type="search"
              value={tableSearch}
              onChange={(e) => { setTableSearch(e.target.value); setPage(0); }}
              placeholder="Search within dataset…"
              className={cn(
                'w-full max-w-sm rounded-lg border py-1.5 px-3 text-sm',
                'border-gray-200 dark:border-gray-700',
                'bg-white dark:bg-gray-900',
                'text-gray-900 dark:text-gray-100',
                'placeholder:text-gray-400 dark:placeholder:text-gray-500',
                'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              )}
            />
          )}

          <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-800">
            {columns.length > 0 ? (
              <table className="min-w-full text-xs">
                <thead className="bg-gray-50 dark:bg-gray-800/60">
                  <tr>
                    {columns.map((col) => (
                      <th
                        key={col}
                        scope="col"
                        className="whitespace-nowrap px-3 py-2.5 text-left font-medium text-gray-700 dark:text-gray-300"
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {pageRecords.map((row, i) => (
                    <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                      {columns.map((col) => (
                        <td
                          key={col}
                          className="max-w-[200px] truncate px-3 py-2 text-gray-600 dark:text-gray-400"
                          title={cellValue(row[col])}
                        >
                          {cellValue(row[col])}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-6 text-center text-sm text-gray-500 dark:text-gray-400">
                This dataset cannot be displayed as a table.
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
              <span>
                Page {page + 1} of {totalPages} &mdash;{' '}
                {filteredRecords.length.toLocaleString()} matching records
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className={cn(
                    'rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors',
                    'border-gray-200 dark:border-gray-700',
                    page === 0
                      ? 'cursor-not-allowed opacity-40'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-800 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300'
                  )}
                >
                  Prev
                </button>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1}
                  className={cn(
                    'rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors',
                    'border-gray-200 dark:border-gray-700',
                    page >= totalPages - 1
                      ? 'cursor-not-allowed opacity-40'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-800 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300'
                  )}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* JSON view */}
      {activeTab === 'json' && (
        <div className="relative">
          <button
            type="button"
            onClick={handleCopy}
            aria-label="Copy JSON"
            className={cn(
              'absolute right-3 top-3 z-10 flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors',
              'border-gray-600 dark:border-gray-600',
              'bg-gray-800 text-gray-200 hover:bg-gray-700'
            )}
          >
            {copied ? (
              <>
                <svg className="h-3 w-3 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
                Copied
              </>
            ) : (
              <>
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184" />
                </svg>
                Copy
              </>
            )}
          </button>
          <pre
            className={cn(
              'overflow-auto rounded-lg p-4 pt-10 text-xs leading-relaxed',
              'bg-gray-900 dark:bg-gray-950',
              'text-gray-100',
              'font-mono',
              'max-h-[600px]'
            )}
          >
            {jsonString}
          </pre>
        </div>
      )}
    </div>
  );
}
