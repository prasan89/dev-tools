'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { PdfToolLayout } from '@/components/pdf/PdfToolLayout';
import { PdfDropzone } from '@/components/pdf/PdfDropzone';
import { PdfDownload } from '@/components/pdf/PdfDownload';
import { formatFileSize } from '@/lib/pdf/validation';
import type { PdfFile } from '@/types/pdf';
import type { FormField, FormFieldType, FormBuilderState } from '@/lib/pdf/createPdfForm';
import {
  createBuilderState,
  addField,
  updateField,
  removeField,
  moveField,
  makeDefaultField,
  buildFormPdf,
} from '@/lib/pdf/createPdfForm';

// ─── Types ────────────────────────────────────────────────────────────────────

type LoadState = 'idle' | 'loading' | 'ready' | 'error';
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

// ─── Rendering ────────────────────────────────────────────────────────────────

async function renderPage(
  data: ArrayBuffer,
  pageNumber: number,
  canvas: HTMLCanvasElement,
): Promise<PageInfo> {
  const pdfjs = await import('pdfjs-dist');
  if (!pdfjs.GlobalWorkerOptions.workerPort) {
    pdfjs.GlobalWorkerOptions.workerPort = new Worker('/pdf.worker.min.mjs', { type: 'module' });
  }
  const doc = await pdfjs.getDocument({ data: data.slice(0), disableAutoFetch: true }).promise;
  const page = await doc.getPage(pageNumber);
  const vp0 = page.getViewport({ scale: 1, rotation: 0 });
  const scale = Math.min(PREVIEW_MAX_W / vp0.width, PREVIEW_MAX_H / vp0.height, 2);
  const vp = page.getViewport({ scale, rotation: 0 });
  canvas.width = Math.floor(vp.width);
  canvas.height = Math.floor(vp.height);
  const ctx = canvas.getContext('2d');
  if (ctx) {
    await page.render({ canvasContext: ctx as unknown as CanvasRenderingContext2D, viewport: vp, canvas } as Parameters<typeof page.render>[0]).promise;
  }
  return { widthPt: vp0.width, heightPt: vp0.height, canvasW: canvas.width, canvasH: canvas.height, scale };
}

// ─── Coord helpers ────────────────────────────────────────────────────────────

function fieldToScreen(rect: FormField['rect'], scale: number) {
  return {
    left: rect.x * scale,
    top: rect.y * scale,
    width: rect.width * scale,
    height: rect.height * scale,
  };
}

function screenToFieldRect(
  clientX: number, clientY: number,
  containerRect: DOMRect,
  scale: number,
): { x: number; y: number } {
  return {
    x: (clientX - containerRect.left) / scale,
    y: (clientY - containerRect.top) / scale,
  };
}

// ─── Field icon ────────────────────────────────────────────────────────────────

function fieldTypeLabel(type: FormFieldType): string {
  switch (type) {
    case 'text': return 'T';
    case 'checkbox': return '☑';
    case 'radio': return '◉';
    case 'dropdown': return '▾';
    case 'signature': return '✍';
  }
}

function fieldTypeName(type: FormFieldType): string {
  switch (type) {
    case 'text': return 'Text';
    case 'checkbox': return 'Checkbox';
    case 'radio': return 'Radio';
    case 'dropdown': return 'Dropdown';
    case 'signature': return 'Signature';
  }
}

// ─── Field overlay ────────────────────────────────────────────────────────────

interface FieldOverlayProps {
  field: FormField;
  pageInfo: PageInfo;
  selected: boolean;
  onSelect: (id: string) => void;
  onMove: (id: string, rect: Partial<FormField['rect']>) => void;
  onDelete: (id: string) => void;
}

function FieldOverlay({ field, pageInfo, selected, onSelect, onMove, onDelete }: FieldOverlayProps) {
  const pos = fieldToScreen(field.rect, pageInfo.scale);
  const dragRef = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(null);
  const divRef = useRef<HTMLDivElement>(null);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    e.stopPropagation();
    onSelect(field.id);
    if (e.button !== 0) return;
    e.preventDefault();
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      origX: field.rect.x,
      origY: field.rect.y,
    };
    divRef.current?.setPointerCapture(e.pointerId);
  }, [field.id, field.rect.x, field.rect.y, onSelect]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragRef.current) return;
    const dx = (e.clientX - dragRef.current.startX) / pageInfo.scale;
    const dy = (e.clientY - dragRef.current.startY) / pageInfo.scale;
    onMove(field.id, {
      x: Math.max(0, dragRef.current.origX + dx),
      y: Math.max(0, dragRef.current.origY + dy),
    });
  }, [field.id, pageInfo.scale, onMove]);

  const handlePointerUp = useCallback(() => { dragRef.current = null; }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    const NUDGE = 1;
    if (e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); onDelete(field.id); return; }
    if (e.key === 'ArrowLeft') { e.preventDefault(); onMove(field.id, { x: Math.max(0, field.rect.x - NUDGE) }); }
    if (e.key === 'ArrowRight') { e.preventDefault(); onMove(field.id, { x: field.rect.x + NUDGE }); }
    if (e.key === 'ArrowUp') { e.preventDefault(); onMove(field.id, { y: Math.max(0, field.rect.y - NUDGE) }); }
    if (e.key === 'ArrowDown') { e.preventDefault(); onMove(field.id, { y: field.rect.y + NUDGE }); }
  }, [field.id, field.rect.x, field.rect.y, onMove, onDelete]);

  // SE resize handle
  const resizeRef = useRef<{ startX: number; startY: number; origW: number; origH: number } | null>(null);
  const resizeDivRef = useRef<HTMLDivElement>(null);

  const handleResizeDown = useCallback((e: React.PointerEvent) => {
    e.stopPropagation();
    e.preventDefault();
    resizeRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      origW: field.rect.width,
      origH: field.rect.height,
    };
    resizeDivRef.current?.setPointerCapture(e.pointerId);
  }, [field.rect.width, field.rect.height]);

  const handleResizeMove = useCallback((e: React.PointerEvent) => {
    if (!resizeRef.current) return;
    const dw = (e.clientX - resizeRef.current.startX) / pageInfo.scale;
    const dh = (e.clientY - resizeRef.current.startY) / pageInfo.scale;
    onMove(field.id, {
      width: Math.max(20, resizeRef.current.origW + dw),
      height: Math.max(10, resizeRef.current.origH + dh),
    });
  }, [field.id, pageInfo.scale, onMove]);

  const handleResizeUp = useCallback(() => { resizeRef.current = null; }, []);

  return (
    <div
      ref={divRef}
      role="button"
      tabIndex={0}
      aria-label={`${fieldTypeName(field.type)} field: ${field.name}. Drag to reposition.`}
      style={{
        position: 'absolute',
        left: pos.left,
        top: pos.top,
        width: pos.width,
        height: pos.height,
        cursor: 'move',
        touchAction: 'none',
      }}
      className={[
        'rounded border transition-colors select-none',
        selected
          ? 'border-blue-500 bg-blue-100/40 dark:bg-blue-900/30 ring-1 ring-blue-500'
          : 'border-blue-400/70 bg-blue-50/30 dark:bg-blue-900/20 hover:border-blue-500',
      ].join(' ')}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onKeyDown={handleKeyDown}
    >
      {/* Type label */}
      <span
        className="absolute -top-4 left-0 rounded-sm bg-blue-600 text-white px-1 leading-4 pointer-events-none"
        style={{ fontSize: 10 }}
      >
        {fieldTypeLabel(field.type)} {field.name}
      </span>
      {/* Required badge */}
      {field.required && (
        <span
          aria-hidden="true"
          className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-red-500"
          title="Required"
        />
      )}
      {/* Delete button */}
      {selected && (
        <button
          aria-label={`Delete ${field.name}`}
          onClick={(e) => { e.stopPropagation(); onDelete(field.id); }}
          className="absolute -top-3 -right-3 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-white hover:bg-red-700 z-10"
          style={{ fontSize: 10 }}
          tabIndex={-1}
        >✕</button>
      )}
      {/* SE resize handle */}
      <div
        ref={resizeDivRef}
        className="absolute bottom-0 right-0 h-3 w-3 cursor-se-resize bg-blue-500 rounded-tl"
        onPointerDown={handleResizeDown}
        onPointerMove={handleResizeMove}
        onPointerUp={handleResizeUp}
        aria-hidden="true"
      />
    </div>
  );
}

// ─── Properties panel ─────────────────────────────────────────────────────────

interface PropsPanelProps {
  field: FormField;
  onUpdate: (id: string, patch: Partial<FormField>) => void;
  onDelete: (id: string) => void;
}

function PropsPanel({ field, onUpdate, onDelete }: PropsPanelProps) {
  return (
    <aside className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 space-y-3 text-sm">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-gray-900 dark:text-gray-100">
          {fieldTypeName(field.type)} Field
        </h2>
        <button
          onClick={() => onDelete(field.id)}
          className="rounded-md border border-red-300 dark:border-red-700 px-2 py-1 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
        >Delete</button>
      </div>

      {/* Common */}
      <label className="block">
        <span className="text-xs text-gray-500 dark:text-gray-400">Field name</span>
        <input
          type="text"
          value={field.name}
          onChange={(e) => onUpdate(field.id, { name: e.target.value })}
          className="mt-1 w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </label>
      <label className="block">
        <span className="text-xs text-gray-500 dark:text-gray-400">Label (display only)</span>
        <input
          type="text"
          value={field.label}
          onChange={(e) => onUpdate(field.id, { label: e.target.value })}
          className="mt-1 w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </label>

      {/* Position & size */}
      <div className="grid grid-cols-2 gap-2">
        {(['x','y','width','height'] as const).map((k) => (
          <label key={k} className="block">
            <span className="text-xs text-gray-500 dark:text-gray-400">{k}</span>
            <input
              type="number"
              value={Math.round(field.rect[k])}
              onChange={(e) => onUpdate(field.id, { rect: { ...field.rect, [k]: Number(e.target.value) } })}
              className="mt-1 w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </label>
        ))}
      </div>

      {/* Required / ReadOnly */}
      <div className="flex gap-3">
        <label className="flex items-center gap-1.5 text-xs cursor-pointer">
          <input
            type="checkbox"
            checked={field.required}
            onChange={(e) => onUpdate(field.id, { required: e.target.checked })}
            className="accent-blue-600"
          />
          Required
        </label>
        <label className="flex items-center gap-1.5 text-xs cursor-pointer">
          <input
            type="checkbox"
            checked={field.readOnly}
            onChange={(e) => onUpdate(field.id, { readOnly: e.target.checked })}
            className="accent-blue-600"
          />
          Read-only
        </label>
      </div>

      {/* Type-specific */}
      {field.type === 'text' && (
        <>
          <label className="block">
            <span className="text-xs text-gray-500 dark:text-gray-400">Default value</span>
            <input type="text" value={field.defaultValue} onChange={(e) => onUpdate(field.id, { defaultValue: e.target.value })}
              className="mt-1 w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500" />
          </label>
          <label className="block">
            <span className="text-xs text-gray-500 dark:text-gray-400">Font size</span>
            <input type="number" min={6} max={72} value={field.fontSize} onChange={(e) => onUpdate(field.id, { fontSize: Number(e.target.value) })}
              className="mt-1 w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500" />
          </label>
          <label className="flex items-center gap-1.5 text-xs cursor-pointer">
            <input type="checkbox" checked={field.multiline} onChange={(e) => onUpdate(field.id, { multiline: e.target.checked })} className="accent-blue-600" />
            Multi-line
          </label>
          <label className="block">
            <span className="text-xs text-gray-500 dark:text-gray-400">Max length (optional)</span>
            <input type="number" min={1} value={field.maxLength ?? ''} onChange={(e) => onUpdate(field.id, { maxLength: e.target.value ? Number(e.target.value) : undefined })}
              className="mt-1 w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500" />
          </label>
        </>
      )}

      {field.type === 'checkbox' && (
        <label className="flex items-center gap-1.5 text-xs cursor-pointer">
          <input type="checkbox" checked={field.defaultChecked} onChange={(e) => onUpdate(field.id, { defaultChecked: e.target.checked })} className="accent-blue-600" />
          Default checked
        </label>
      )}

      {field.type === 'radio' && (
        <>
          <label className="block">
            <span className="text-xs text-gray-500 dark:text-gray-400">Group name</span>
            <input type="text" value={field.groupName} onChange={(e) => onUpdate(field.id, { groupName: e.target.value })}
              className="mt-1 w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500" />
          </label>
          <label className="block">
            <span className="text-xs text-gray-500 dark:text-gray-400">Button value</span>
            <input type="text" value={field.buttonValue} onChange={(e) => onUpdate(field.id, { buttonValue: e.target.value })}
              className="mt-1 w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500" />
          </label>
          <label className="flex items-center gap-1.5 text-xs cursor-pointer">
            <input type="checkbox" checked={field.defaultSelected} onChange={(e) => onUpdate(field.id, { defaultSelected: e.target.checked })} className="accent-blue-600" />
            Default selected
          </label>
        </>
      )}

      {field.type === 'dropdown' && (
        <>
          <label className="block">
            <span className="text-xs text-gray-500 dark:text-gray-400">Options (one per line)</span>
            <textarea
              value={field.options.join('\n')}
              onChange={(e) => onUpdate(field.id, { options: e.target.value.split('\n').filter(Boolean) })}
              rows={4}
              className="mt-1 w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 resize-y"
            />
          </label>
          <label className="block">
            <span className="text-xs text-gray-500 dark:text-gray-400">Default value</span>
            <select value={field.defaultValue} onChange={(e) => onUpdate(field.id, { defaultValue: e.target.value })}
              className="mt-1 w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500">
              <option value="">— none —</option>
              {field.options.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </label>
          <label className="flex items-center gap-1.5 text-xs cursor-pointer">
            <input type="checkbox" checked={field.editable} onChange={(e) => onUpdate(field.id, { editable: e.target.checked })} className="accent-blue-600" />
            Editable (combo box)
          </label>
        </>
      )}

      {/* Position info */}
      <p className="text-xs text-gray-400 dark:text-gray-500">
        Page {field.pageIndex + 1} · {Math.round(field.rect.width)}×{Math.round(field.rect.height)} pt
      </p>
    </aside>
  );
}

// ─── Tool type selector ────────────────────────────────────────────────────────

const FIELD_TYPES: FormFieldType[] = ['text', 'checkbox', 'radio', 'dropdown', 'signature'];

function ToolButton({
  type, active, onClick,
}: { type: FormFieldType; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      title={`Add ${fieldTypeName(type)} field`}
      aria-pressed={active}
      className={[
        'flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-colors',
        active
          ? 'border-blue-500 bg-blue-600 text-white'
          : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400',
      ].join(' ')}
    >
      <span aria-hidden="true">{fieldTypeLabel(type)}</span>
      {fieldTypeName(type)}
    </button>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function CreatePdfFormPage() {
  const [pdfFile, setPdfFile] = useState<PdfFile | null>(null);
  const [loadState, setLoadState] = useState<LoadState>('idle');
  const [loadError, setLoadError] = useState('');
  const [builderState, setBuilderState] = useState<FormBuilderState | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageInfo, setPageInfo] = useState<PageInfo | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeTool, setActiveTool] = useState<FormFieldType>('text');
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [saveError, setSaveError] = useState('');
  const [downloadBlob, setDownloadBlob] = useState<Blob | null>(null);
  const [downloadName, setDownloadName] = useState('');

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const pdfDataRef = useRef<ArrayBuffer | null>(null);

  const handleFileSelected = useCallback(async (files: PdfFile[]) => {
    const file = files[0];
    if (!file) return;
    setLoadState('loading');
    setLoadError('');
    setBuilderState(null);
    setSelectedId(null);
    setCurrentPage(1);
    setPageInfo(null);
    setSaveState('idle');
    setDownloadBlob(null);
    setPdfFile(file);

    try {
      const buf = await new Promise<ArrayBuffer>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as ArrayBuffer);
        reader.onerror = () => reject(reader.error);
        reader.readAsArrayBuffer(file.file);
      });
      pdfDataRef.current = buf;

      // Load pdfjs to get page info
      const pdfjs = await import('pdfjs-dist');
      if (!pdfjs.GlobalWorkerOptions.workerPort) {
        pdfjs.GlobalWorkerOptions.workerPort = new Worker('/pdf.worker.min.mjs', { type: 'module' });
      }
      const doc = await pdfjs.getDocument({ data: buf.slice(0), disableAutoFetch: true }).promise;
      const pageSizes: Array<{ width: number; height: number }> = [];
      for (let p = 1; p <= doc.numPages; p++) {
        const page = await doc.getPage(p);
        const vp = page.getViewport({ scale: 1, rotation: 0 });
        pageSizes.push({ width: vp.width, height: vp.height });
      }
      setBuilderState(createBuilderState(doc.numPages, pageSizes));
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
    renderPage(pdfDataRef.current, currentPage, canvasRef.current)
      .then((info) => { if (!cancelled) setPageInfo(info); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [loadState, currentPage]);

  // Click on canvas to place field
  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if (!pageInfo || !containerRef.current || !builderState) return;
    const rect = containerRef.current.getBoundingClientRect();
    const { x, y } = screenToFieldRect(e.clientX, e.clientY, rect, pageInfo.scale);
    const newField = makeDefaultField(activeTool, currentPage - 1, x, y, builderState.fields);
    setBuilderState((prev) => prev ? addField(prev, newField) : prev);
    setSelectedId(newField.id);
    setSaveState('idle');
    setDownloadBlob(null);
  }, [pageInfo, builderState, activeTool, currentPage]);

  const handleUpdateField = useCallback((id: string, patch: Partial<FormField>) => {
    setBuilderState((prev) => prev ? updateField(prev, id, patch) : prev);
    setSaveState('idle');
    setDownloadBlob(null);
  }, []);

  const handleMoveField = useCallback((id: string, rect: Partial<FormField['rect']>) => {
    setBuilderState((prev) => prev ? moveField(prev, id, rect) : prev);
    setSaveState('idle');
    setDownloadBlob(null);
  }, []);

  const handleDeleteField = useCallback((id: string) => {
    setBuilderState((prev) => prev ? removeField(prev, id) : prev);
    setSelectedId((prev) => prev === id ? null : prev);
    setSaveState('idle');
    setDownloadBlob(null);
  }, []);

  const handleExport = useCallback(async () => {
    if (!pdfFile || !builderState) return;
    setSaveState('saving');
    setSaveError('');
    try {
      const result = await buildFormPdf(pdfFile, builderState);
      if (!result.success || !result.outputFile) throw new Error(result.error ?? 'Export failed');
      setDownloadBlob(result.outputFile.blob);
      setDownloadName(result.outputFile.filename);
      setSaveState('done');
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Export failed');
      setSaveState('error');
    }
  }, [pdfFile, builderState]);

  const handleReset = useCallback(() => {
    setDownloadBlob(null);
    setPdfFile(null);
    setLoadState('idle');
    setBuilderState(null);
    setCurrentPage(1);
    setPageInfo(null);
    setSelectedId(null);
    setSaveState('idle');
    setSaveError('');
    setLoadError('');
    pdfDataRef.current = null;
  }, []);

  const selectedField = builderState?.fields.find((f) => f.id === selectedId) ?? null;
  const fieldsOnPage = builderState?.fields.filter((f) => f.pageIndex === currentPage - 1) ?? [];
  const totalPages = builderState?.pageCount ?? 0;
  const totalFields = builderState?.fields.length ?? 0;

  return (
    <PdfToolLayout
      title="Create PDF Form Fields"
      description="Add interactive AcroForm fields to any PDF — text boxes, checkboxes, radio buttons, dropdowns, and signature boxes. Your PDF never leaves your browser."
    >
      {/* ── Dropzone ── */}
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
          <span className="text-sm text-gray-600 dark:text-gray-400">Loading PDF…</span>
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

      {/* ── Ready ── */}
      {loadState === 'ready' && pdfFile && builderState && (
        <div className="space-y-4">
          {/* File info bar */}
          <div className="flex flex-wrap items-center gap-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3 text-xs text-gray-500 dark:text-gray-400">
            <span className="font-medium text-gray-700 dark:text-gray-200 truncate max-w-xs">{pdfFile.name}</span>
            <span>{formatFileSize(pdfFile.size)}</span>
            <span>{totalPages} {totalPages === 1 ? 'page' : 'pages'}</span>
            <span className="rounded-full bg-blue-100 dark:bg-blue-900/40 px-2 py-0.5 font-medium text-blue-700 dark:text-blue-300">
              {totalFields} {totalFields === 1 ? 'field' : 'fields'}
            </span>
            <button onClick={handleReset} className="ml-auto rounded-md border border-gray-300 dark:border-gray-600 px-2.5 py-1 text-xs hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              Change file
            </button>
          </div>

          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 mr-2">Add field:</span>
            {FIELD_TYPES.map((t) => (
              <ToolButton key={t} type={t} active={activeTool === t} onClick={() => setActiveTool(t)} />
            ))}
            <span className="ml-4 text-xs text-gray-400 dark:text-gray-500">Click on the PDF to place</span>
          </div>

          <div className="flex gap-4 items-start">
            {/* Canvas area */}
            <div className="flex-1 min-w-0 space-y-3">
              {/* Page nav */}
              {totalPages > 1 && (
                <div className="flex items-center gap-2">
                  <button disabled={currentPage <= 1} onClick={() => setCurrentPage((p) => p - 1)}
                    className="rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-1 text-xs disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">← Prev</button>
                  <span className="text-xs text-gray-500 dark:text-gray-400">Page {currentPage} of {totalPages}</span>
                  <button disabled={currentPage >= totalPages} onClick={() => setCurrentPage((p) => p + 1)}
                    className="rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-1 text-xs disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">Next →</button>
                </div>
              )}

              {/* Canvas + overlays */}
              <div
                ref={containerRef}
                className="relative inline-block rounded-lg border border-gray-200 dark:border-gray-700 overflow-visible shadow-sm bg-white dark:bg-gray-900 cursor-crosshair"
                onClick={handleCanvasClick}
                role="region"
                aria-label={`PDF page ${currentPage}. Click to place a ${fieldTypeName(activeTool)} field.`}
              >
                <canvas ref={canvasRef} className="block rounded-lg" />
                {pageInfo && fieldsOnPage.map((f) => (
                  <FieldOverlay
                    key={f.id}
                    field={f}
                    pageInfo={pageInfo}
                    selected={f.id === selectedId}
                    onSelect={setSelectedId}
                    onMove={handleMoveField}
                    onDelete={handleDeleteField}
                  />
                ))}
              </div>

              {/* Hint */}
              <p className="text-xs text-gray-400 dark:text-gray-500">
                Click anywhere on the PDF to place a <strong>{fieldTypeName(activeTool)}</strong> field. Drag to reposition. Use the SE handle to resize.
              </p>
            </div>

            {/* Properties panel */}
            {selectedField ? (
              <div className="w-64 shrink-0">
                <PropsPanel field={selectedField} onUpdate={handleUpdateField} onDelete={handleDeleteField} />
              </div>
            ) : (
              <div className="w-64 shrink-0 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4">
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  Select a field to edit its properties, or click on the PDF to place a new one.
                </p>
                {totalFields > 0 && (
                  <ul className="mt-3 space-y-1 max-h-64 overflow-y-auto">
                    {builderState.fields.map((f) => (
                      <li key={f.id}>
                        <button
                          onClick={() => { setCurrentPage(f.pageIndex + 1); setSelectedId(f.id); }}
                          className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-xs hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                          <span className="shrink-0 w-5 text-center text-blue-500">{fieldTypeLabel(f.type)}</span>
                          <span className="flex-1 truncate text-gray-700 dark:text-gray-300">{f.name}</span>
                          <span className="text-gray-400 dark:text-gray-500">p.{f.pageIndex + 1}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>

          {/* Export bar */}
          <div className="flex flex-wrap items-center gap-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {totalFields} {totalFields === 1 ? 'field' : 'fields'} across {totalPages} {totalPages === 1 ? 'page' : 'pages'}
            </span>
            <div className="ml-auto flex items-center gap-3">
              {saveState === 'error' && <p className="text-xs text-red-600 dark:text-red-400">{saveError}</p>}
              {saveState === 'done' && downloadBlob ? (
                <PdfDownload blob={downloadBlob} filename={downloadName} label="Download form PDF" />
              ) : (
                <button
                  onClick={handleExport}
                  disabled={saveState === 'saving' || totalFields === 0}
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
                      Export form PDF
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
