'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { PdfToolLayout } from '@/components/pdf/PdfToolLayout';
import { PdfDropzone } from '@/components/pdf/PdfDropzone';
import { PdfDownload } from '@/components/pdf/PdfDownload';
import { formatFileSize } from '@/lib/pdf/validation';
import type { PdfFile } from '@/types/pdf';
import type { AcroField, FillFormState } from '@/lib/pdf/fillPdf';
import {
  extractFormFields,
  updateFieldValue,
  setRadioGroup,
  buildFilledPdf,
  countFilled,
  totalFieldCount,
} from '@/lib/pdf/fillPdf';

// ─── Types ────────────────────────────────────────────────────────────────────

type LoadState = 'idle' | 'loading' | 'ready' | 'no-fields' | 'error';
type SaveState = 'idle' | 'saving' | 'done' | 'error';

interface PageInfo {
  widthPt: number;
  heightPt: number;
  canvasW: number;
  canvasH: number;
  scale: number;
}

const PREVIEW_MAX_W = 800;
const PREVIEW_MAX_H = 960;

// ─── Page renderer ────────────────────────────────────────────────────────────

async function renderPageToCanvas(
  pdfData: ArrayBuffer,
  pageNumber: number,
  canvas: HTMLCanvasElement,
): Promise<PageInfo> {
  const pdfjs = await import('pdfjs-dist');
  if (!pdfjs.GlobalWorkerOptions.workerPort) {
    pdfjs.GlobalWorkerOptions.workerPort = new Worker('/pdf.worker.min.mjs', { type: 'module' });
  }
  const task = pdfjs.getDocument({ data: pdfData.slice(0), disableAutoFetch: true });
  const doc = await task.promise;
  const page = await doc.getPage(pageNumber);
  const vpNatural = page.getViewport({ scale: 1, rotation: 0 });
  const widthPt = vpNatural.width;
  const heightPt = vpNatural.height;
  const scale = Math.min(PREVIEW_MAX_W / widthPt, PREVIEW_MAX_H / heightPt, 2);
  const viewport = page.getViewport({ scale, rotation: 0 });
  canvas.width = Math.floor(viewport.width);
  canvas.height = Math.floor(viewport.height);
  const ctx = canvas.getContext('2d');
  if (ctx) {
    await page.render({ canvasContext: ctx as unknown as CanvasRenderingContext2D, viewport, canvas } as Parameters<typeof page.render>[0]).promise;
  }
  return { widthPt, heightPt, canvasW: canvas.width, canvasH: canvas.height, scale };
}

// ─── Field overlay positioning ────────────────────────────────────────────────

function fieldToScreen(
  rect: { x: number; y: number; width: number; height: number },
  pageInfo: PageInfo,
): { left: number; top: number; width: number; height: number } {
  // rect.x, rect.y are in PDF points, y=0 at TOP of page (already flipped in extractFormFields)
  return {
    left: rect.x * pageInfo.scale,
    top: rect.y * pageInfo.scale,
    width: rect.width * pageInfo.scale,
    height: rect.height * pageInfo.scale,
  };
}

// ─── Field overlay components ─────────────────────────────────────────────────

interface FieldProps {
  field: AcroField;
  pageInfo: PageInfo;
  onChange: (id: string, value: string | boolean) => void;
  onRadioGroup: (groupName: string, value: string) => void;
}

function TextFieldOverlay({ field, pageInfo, onChange }: FieldProps) {
  if (field.type !== 'text') return null;
  const pos = fieldToScreen(field.rect, pageInfo);
  const fontSize = Math.max(9, Math.min(field.rect.height * pageInfo.scale * 0.65, 16));
  return (
    <div
      style={{ position: 'absolute', left: pos.left, top: pos.top, width: pos.width, height: pos.height }}
      className="group"
    >
      <textarea
        value={field.value}
        readOnly={field.readOnly}
        placeholder={field.readOnly ? '' : field.name}
        title={field.name}
        aria-label={`Text field: ${field.name}`}
        maxLength={field.maxLength}
        rows={field.multiline ? undefined : 1}
        style={{ fontSize, lineHeight: 1.2, resize: 'none' }}
        onChange={(e) => onChange(field.id, e.target.value)}
        className={[
          'w-full h-full px-1 py-0.5 bg-blue-50/70 dark:bg-blue-900/30',
          'border border-blue-400/60 dark:border-blue-500/60 rounded-sm',
          'text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600',
          'focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-blue-50 dark:focus:bg-blue-900/50',
          'transition-colors overflow-hidden',
          field.readOnly ? 'cursor-default opacity-60' : '',
          field.multiline ? '' : 'whitespace-nowrap',
        ].filter(Boolean).join(' ')}
      />
      {field.required && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -top-1.5 -right-1.5 flex h-3 w-3 items-center justify-center rounded-full bg-red-500 text-white"
          style={{ fontSize: 8, lineHeight: 1 }}
          title="Required"
        >*</span>
      )}
    </div>
  );
}

function CheckboxOverlay({ field, pageInfo, onChange }: FieldProps) {
  if (field.type !== 'checkbox') return null;
  const pos = fieldToScreen(field.rect, pageInfo);
  const size = Math.min(pos.width, pos.height);
  return (
    <div
      style={{ position: 'absolute', left: pos.left, top: pos.top, width: pos.width, height: pos.height }}
      className="flex items-center justify-center"
    >
      <input
        type="checkbox"
        checked={field.checked}
        disabled={field.readOnly}
        title={field.name}
        aria-label={`Checkbox: ${field.name}`}
        onChange={(e) => onChange(field.id, e.target.checked)}
        style={{ width: size * 0.8, height: size * 0.8 }}
        className="cursor-pointer accent-blue-600 focus:ring-2 focus:ring-blue-500"
      />
      {field.required && (
        <span aria-hidden="true" className="pointer-events-none absolute -top-1 -right-1 text-red-500 font-bold" style={{ fontSize: 10 }}>*</span>
      )}
    </div>
  );
}

function RadioOverlay({ field, pageInfo, onRadioGroup }: FieldProps) {
  if (field.type !== 'radio') return null;
  const pos = fieldToScreen(field.rect, pageInfo);
  const size = Math.min(pos.width, pos.height);
  const isSelected = field.selectedValue === field.buttonValue;
  return (
    <div
      style={{ position: 'absolute', left: pos.left, top: pos.top, width: pos.width, height: pos.height }}
      className="flex items-center justify-center"
    >
      <input
        type="radio"
        name={field.groupName}
        value={field.buttonValue}
        checked={isSelected}
        disabled={field.readOnly}
        title={`${field.name}: ${field.buttonValue}`}
        aria-label={`Radio: ${field.name} — ${field.buttonValue}`}
        onChange={() => onRadioGroup(field.groupName, field.buttonValue)}
        style={{ width: size * 0.8, height: size * 0.8 }}
        className="cursor-pointer accent-blue-600 focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}

function DropdownOverlay({ field, pageInfo, onChange }: FieldProps) {
  if (field.type !== 'dropdown' && field.type !== 'listbox') return null;
  const pos = fieldToScreen(field.rect, pageInfo);
  const fontSize = Math.max(9, Math.min(field.rect.height * pageInfo.scale * 0.65, 14));
  if (field.type === 'listbox') {
    return (
      <div style={{ position: 'absolute', left: pos.left, top: pos.top, width: pos.width, height: pos.height }}>
        <select
          value={field.value}
          disabled={field.readOnly}
          title={field.name}
          aria-label={`List: ${field.name}`}
          style={{ fontSize }}
          onChange={(e) => onChange(field.id, e.target.value)}
          className="w-full h-full bg-blue-50/70 dark:bg-blue-900/30 border border-blue-400/60 dark:border-blue-500/60 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500 rounded-sm"
          size={Math.min(4, field.options.length)}
        >
          {field.options.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </div>
    );
  }
  return (
    <div style={{ position: 'absolute', left: pos.left, top: pos.top, width: pos.width, height: pos.height }}>
      <select
        value={field.value}
        disabled={field.readOnly}
        title={field.name}
        aria-label={`Dropdown: ${field.name}`}
        style={{ fontSize }}
        onChange={(e) => onChange(field.id, e.target.value)}
        className="w-full h-full bg-blue-50/70 dark:bg-blue-900/30 border border-blue-400/60 dark:border-blue-500/60 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500 rounded-sm"
      >
        {field.value === '' && <option value="">— select —</option>}
        {field.options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
      {field.required && (
        <span aria-hidden="true" className="pointer-events-none absolute -top-1 -right-1 text-red-500 font-bold" style={{ fontSize: 10 }}>*</span>
      )}
    </div>
  );
}

function FieldOverlay(props: FieldProps) {
  switch (props.field.type) {
    case 'text': return <TextFieldOverlay {...props} />;
    case 'checkbox': return <CheckboxOverlay {...props} />;
    case 'radio': return <RadioOverlay {...props} />;
    case 'dropdown':
    case 'listbox': return <DropdownOverlay {...props} />;
  }
}

// ─── Field list panel ─────────────────────────────────────────────────────────

interface FieldSummaryPanelProps {
  state: FillFormState;
  onFieldClick: (field: AcroField) => void;
}

function FieldSummaryPanel({ state, onFieldClick }: FieldSummaryPanelProps) {
  const filled = countFilled(state);
  const total = totalFieldCount(state);

  // deduplicate radio groups
  const seenGroups = new Set<string>();
  const uniqueFields = state.fields.filter((f) => {
    if (f.type !== 'radio') return true;
    if (seenGroups.has(f.groupName)) return false;
    seenGroups.add(f.groupName);
    return true;
  });

  return (
    <aside className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Form Fields</h2>
        <span className="rounded-full bg-blue-100 dark:bg-blue-900/40 px-2 py-0.5 text-xs font-medium text-blue-700 dark:text-blue-300">
          {filled}/{total} filled
        </span>
      </div>
      {/* Progress bar */}
      <div className="h-1.5 w-full rounded-full bg-gray-200 dark:bg-gray-700" role="progressbar" aria-valuenow={filled} aria-valuemax={total}>
        <div
          className="h-full rounded-full bg-blue-500 transition-all"
          style={{ width: total > 0 ? `${(filled / total) * 100}%` : '0%' }}
        />
      </div>
      <ul className="space-y-1 max-h-64 overflow-y-auto text-xs" role="list">
        {uniqueFields.map((f) => {
          let isFilled = false;
          let label = '';
          if (f.type === 'text') { isFilled = !!f.value.trim(); label = f.value.trim().slice(0, 24) || '—'; }
          else if (f.type === 'checkbox') { isFilled = f.checked; label = f.checked ? 'Checked' : 'Unchecked'; }
          else if (f.type === 'radio') { isFilled = !!f.selectedValue; label = f.selectedValue || '—'; }
          else if (f.type === 'dropdown' || f.type === 'listbox') { isFilled = !!f.value; label = f.value || '—'; }
          return (
            <li key={f.id}>
              <button
                onClick={() => onFieldClick(f)}
                className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <span className={`shrink-0 h-2 w-2 rounded-full ${isFilled ? 'bg-green-500' : f.required ? 'bg-red-400' : 'bg-gray-300 dark:bg-gray-600'}`} />
                <span className="flex-1 truncate text-gray-700 dark:text-gray-300">
                  <span className="font-medium">{f.name}</span>
                  <span className="ml-1 text-gray-400">({f.type})</span>
                </span>
                <span className="text-gray-400 dark:text-gray-500 truncate max-w-[80px]">{label}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function FillPdfPage() {
  const [pdfFile, setPdfFile] = useState<PdfFile | null>(null);
  const [loadState, setLoadState] = useState<LoadState>('idle');
  const [loadError, setLoadError] = useState('');
  const [formState, setFormState] = useState<FillFormState>({ fields: [] });
  const [pageHeights, setPageHeights] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [pageInfo, setPageInfo] = useState<PageInfo | null>(null);
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [saveError, setSaveError] = useState('');
  const [downloadBlob, setDownloadBlob] = useState<Blob | null>(null);
  const [downloadName, setDownloadName] = useState('');
  const [showFieldPanel, setShowFieldPanel] = useState(true);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pdfDataRef = useRef<ArrayBuffer | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load PDF and extract fields
  const handleFileSelected = useCallback(async (files: PdfFile[]) => {
    const file = files[0];
    if (!file) return;

    // cleanup prev
    setDownloadBlob(null);
    setFormState({ fields: [] });
    setPageHeights([]);
    setCurrentPage(1);
    setTotalPages(0);
    setPageInfo(null);
    setSaveState('idle');
    setSaveError('');
    setLoadError('');
    setLoadState('loading');
    setPdfFile(file);

    try {
      const buf = await new Promise<ArrayBuffer>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as ArrayBuffer);
        reader.onerror = () => reject(reader.error);
        reader.readAsArrayBuffer(file.file);
      });
      pdfDataRef.current = buf;

      const { fields, pageHeights: heights } = await extractFormFields(file);
      setPageHeights(heights);
      setTotalPages(heights.length);

      if (fields.length === 0) {
        setLoadState('no-fields');
        return;
      }

      setFormState({ fields });
      setLoadState('ready');
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to load PDF');
      setLoadState('error');
    }
  }, []);

  // Render current page
  useEffect(() => {
    if (loadState !== 'ready' || !pdfDataRef.current || !canvasRef.current) return;
    let cancelled = false;
    renderPageToCanvas(pdfDataRef.current, currentPage, canvasRef.current)
      .then((info) => { if (!cancelled) setPageInfo(info); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [loadState, currentPage]);

  const handleFieldChange = useCallback((id: string, value: string | boolean) => {
    setFormState((prev) => updateFieldValue(prev, id, value));
    setSaveState('idle');
    setDownloadBlob(null);
  }, []);

  const handleRadioGroup = useCallback((groupName: string, value: string) => {
    setFormState((prev) => setRadioGroup(prev, groupName, value));
    setSaveState('idle');
    setDownloadBlob(null);
  }, []);

  const handleFieldClick = useCallback((field: AcroField) => {
    if (field.pageIndex + 1 !== currentPage) {
      setCurrentPage(field.pageIndex + 1);
    }
  }, [currentPage]);

  const handleExport = useCallback(async () => {
    if (!pdfFile) return;
    setSaveState('saving');
    setSaveError('');
    try {
      const result = await buildFilledPdf(pdfFile, formState);
      if (!result.success || !result.outputFile) throw new Error(result.error ?? 'Export failed');
      setDownloadBlob(result.outputFile.blob);
      setDownloadName(result.outputFile.filename);
      setSaveState('done');
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Export failed');
      setSaveState('error');
    }
  }, [pdfFile, formState]);

  const handleReset = useCallback(() => {
    setDownloadBlob(null);
    setPdfFile(null);
    setLoadState('idle');
    setFormState({ fields: [] });
    setPageHeights([]);
    setTotalPages(0);
    setCurrentPage(1);
    setPageInfo(null);
    setSaveState('idle');
    setSaveError('');
    setLoadError('');
    pdfDataRef.current = null;
  }, []);

  const fieldsOnPage = formState.fields.filter((f) => f.pageIndex === currentPage - 1);
  const filled = countFilled(formState);
  const total = totalFieldCount(formState);

  return (
    <PdfToolLayout
      title="Fill PDF Form"
      description="Fill AcroForm PDF fields directly in your browser. Text, checkboxes, radio buttons, and dropdowns — your PDF never leaves your device."
    >
      {/* ── Step 1: Dropzone ── */}
      {loadState === 'idle' && (
        <PdfDropzone onFilesSelected={handleFileSelected} multiple={false} />
      )}

      {/* ── Loading ── */}
      {loadState === 'loading' && (
        <div className="flex items-center justify-center py-20 gap-3">
          <svg className="h-5 w-5 animate-spin text-blue-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
          <span className="text-sm text-gray-600 dark:text-gray-400">Detecting form fields…</span>
        </div>
      )}

      {/* ── Error ── */}
      {loadState === 'error' && (
        <div className="rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20 p-6 text-center space-y-3">
          <p className="text-sm font-medium text-red-700 dark:text-red-400">Failed to load PDF</p>
          <p className="text-xs text-red-600 dark:text-red-500">{loadError}</p>
          <button onClick={handleReset} className="rounded-lg bg-red-600 px-4 py-2 text-xs font-medium text-white hover:bg-red-700 transition-colors">Try another file</button>
        </div>
      )}

      {/* ── No fields ── */}
      {loadState === 'no-fields' && (
        <div className="rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/20 p-6 text-center space-y-3">
          <svg className="mx-auto h-8 w-8 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm font-medium text-amber-700 dark:text-amber-400">No fillable fields found</p>
          <p className="text-xs text-amber-600 dark:text-amber-500">
            This PDF does not contain AcroForm fields. Try the <a href="/pdf-tools/edit-pdf" className="underline">PDF Editor</a> to add text directly.
          </p>
          <button onClick={handleReset} className="rounded-lg bg-amber-600 px-4 py-2 text-xs font-medium text-white hover:bg-amber-700 transition-colors">Open another file</button>
        </div>
      )}

      {/* ── Ready ── */}
      {loadState === 'ready' && pdfFile && (
        <div className="space-y-4">
          {/* File info bar */}
          <div className="flex flex-wrap items-center gap-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3 text-xs text-gray-500 dark:text-gray-400">
            <span className="font-medium text-gray-700 dark:text-gray-200 truncate max-w-xs">{pdfFile.name}</span>
            <span>{formatFileSize(pdfFile.size)}</span>
            <span>{totalPages} {totalPages === 1 ? 'page' : 'pages'}</span>
            <span className="rounded-full bg-blue-100 dark:bg-blue-900/40 px-2 py-0.5 font-medium text-blue-700 dark:text-blue-300">
              {total} {total === 1 ? 'field' : 'fields'}
            </span>
            <div className="ml-auto flex gap-2">
              <button
                onClick={() => setShowFieldPanel((v) => !v)}
                className="rounded-md border border-gray-300 dark:border-gray-600 px-2.5 py-1 text-xs hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                {showFieldPanel ? 'Hide' : 'Show'} field list
              </button>
              <button onClick={handleReset} className="rounded-md border border-gray-300 dark:border-gray-600 px-2.5 py-1 text-xs hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                Change file
              </button>
            </div>
          </div>

          <div className="flex gap-4 items-start">
            {/* PDF canvas + field overlays */}
            <div className="flex-1 min-w-0 space-y-3">
              {/* Page nav */}
              {totalPages > 1 && (
                <div className="flex items-center gap-2 text-sm" role="navigation" aria-label="Page navigation">
                  <button
                    disabled={currentPage <= 1}
                    onClick={() => setCurrentPage((p) => p - 1)}
                    className="rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-1 text-xs disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    aria-label="Previous page"
                  >← Prev</button>
                  <span className="text-xs text-gray-500 dark:text-gray-400">Page {currentPage} of {totalPages}</span>
                  <button
                    disabled={currentPage >= totalPages}
                    onClick={() => setCurrentPage((p) => p + 1)}
                    className="rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-1 text-xs disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    aria-label="Next page"
                  >Next →</button>
                  {/* Page jump */}
                  <select
                    value={currentPage}
                    onChange={(e) => setCurrentPage(Number(e.target.value))}
                    aria-label="Jump to page"
                    className="ml-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-2 py-1 text-xs"
                  >
                    {Array.from({ length: totalPages }, (_, i) => (
                      <option key={i + 1} value={i + 1}>p. {i + 1}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Canvas + overlays */}
              <div ref={containerRef} className="relative inline-block rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm bg-white dark:bg-gray-900">
                <canvas ref={canvasRef} className="block" />
                {/* Field overlays */}
                {pageInfo && fieldsOnPage.map((field) => (
                  <FieldOverlay
                    key={field.id}
                    field={field}
                    pageInfo={pageInfo}
                    onChange={handleFieldChange}
                    onRadioGroup={handleRadioGroup}
                  />
                ))}
              </div>

              {/* Legend */}
              <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400" aria-hidden="true">
                <span className="flex items-center gap-1"><span className="inline-block h-2 w-4 rounded-sm bg-blue-100 border border-blue-400/60" /> editable field</span>
                <span className="flex items-center gap-1"><span className="text-red-500 font-bold">*</span> required</span>
              </div>
            </div>

            {/* Field panel */}
            {showFieldPanel && (
              <div className="w-64 shrink-0">
                <FieldSummaryPanel state={formState} onFieldClick={handleFieldClick} />
              </div>
            )}
          </div>

          {/* Export bar */}
          <div className="flex flex-wrap items-center gap-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {filled} of {total} {total === 1 ? 'field' : 'fields'} filled
            </span>
            <div className="h-1.5 w-32 rounded-full bg-gray-200 dark:bg-gray-700" role="progressbar" aria-valuenow={filled} aria-valuemax={total}>
              <div
                className="h-full rounded-full bg-blue-500 transition-all"
                style={{ width: total > 0 ? `${(filled / total) * 100}%` : '0%' }}
              />
            </div>
            <div className="ml-auto flex items-center gap-3">
              {saveState === 'error' && (
                <p className="text-xs text-red-600 dark:text-red-400">{saveError}</p>
              )}
              {saveState === 'done' && downloadBlob ? (
                <PdfDownload
                  blob={downloadBlob}
                  filename={downloadName}
                  label="Download filled PDF"
                />
              ) : (
                <button
                  onClick={handleExport}
                  disabled={saveState === 'saving'}
                  className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60 transition-colors"
                >
                  {saveState === 'saving' ? (
                    <>
                      <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                      </svg>
                      Saving…
                    </>
                  ) : (
                    <>
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Export filled PDF
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </PdfToolLayout>
  );
}
