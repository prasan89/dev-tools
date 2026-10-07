'use client';

import { useState } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Dataset } from '@/types/dataset';

interface DatasetActionsProps {
  dataset: Dataset;
}

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
    return keys
      .map((k) => {
        const val = r[k];
        if (val === null || val === undefined) return '';
        if (typeof val === 'object') return JSON.stringify(JSON.stringify(val));
        return JSON.stringify(String(val));
      })
      .join(',');
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

export function DatasetActions({ dataset }: DatasetActionsProps) {
  const [copied, setCopied] = useState(false);

  const jsonString = JSON.stringify(dataset.data, null, 2);

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

  const btnBase = cn(
    'flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors',
    'border-gray-200 dark:border-gray-700',
    'bg-white dark:bg-gray-900',
    'hover:bg-gray-50 dark:hover:bg-gray-800',
    'text-gray-700 dark:text-gray-300'
  );

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        {/* Copy JSON */}
        <button type="button" onClick={handleCopy} className={btnBase}>
          {copied ? (
            <>
              <svg className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
              Copied!
            </>
          ) : (
            <>
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184" />
              </svg>
              Copy JSON
            </>
          )}
        </button>

        {/* Download JSON */}
        <button type="button" onClick={handleDownloadJSON} className={btnBase}>
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
          Download JSON
          <span className="ml-0.5 text-xs text-gray-400 dark:text-gray-500">
            ({formatBytes(dataset.fileSizeBytes)})
          </span>
        </button>

        {/* Download CSV */}
        <button type="button" onClick={handleDownloadCSV} className={btnBase}>
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
          Download CSV
        </button>
      </div>

      {/* Tool links */}
      <div className="flex flex-wrap gap-2">
        <Link
          href="/tools/json-validator"
          className={cn(
            'flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors',
            'border-blue-200 dark:border-blue-800',
            'bg-blue-50 dark:bg-blue-950/30',
            'hover:bg-blue-100 dark:hover:bg-blue-950/50',
            'text-blue-700 dark:text-blue-400'
          )}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
          Validate in JSON Validator
          <svg className="h-3.5 w-3.5 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
          </svg>
        </Link>

        <Link
          href="/tools/json-formatter"
          className={cn(
            'flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors',
            'border-blue-200 dark:border-blue-800',
            'bg-blue-50 dark:bg-blue-950/30',
            'hover:bg-blue-100 dark:hover:bg-blue-950/50',
            'text-blue-700 dark:text-blue-400'
          )}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5" />
          </svg>
          Format in JSON Formatter
          <svg className="h-3.5 w-3.5 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
          </svg>
        </Link>
      </div>
    </div>
  );
}
