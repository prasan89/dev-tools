'use client';

import './editor.css';

import { useCallback, useEffect, useRef, useState } from 'react';
import { PdfToolLayout } from '@/components/pdf/PdfToolLayout';
import { PdfDropzone } from '@/components/pdf/PdfDropzone';
import { PdfDownload } from '@/components/pdf/PdfDownload';
import { EditorOverlay, pdfRectToScreen } from '@/components/pdf/EditorOverlay';
import { formatFileSize } from '@/lib/pdf/validation';
import type { PdfFile } from '@/types/pdf';
import type {
  EditorObject, TextObject, ImageObject, RectObject,
  EllipseObject, LineObject, ArrowObject, AnnotationObject, StrokeObject, WhiteoutObject,
  StickyNoteObject, CalloutObject,
  EditOutcome, FontFamily, TextAlign, AnnotationType, ArrowheadStyle,
} from '@/lib/pdf/editPdf';
import {
  createEditorState,
  addObject,
  updateObject,
  removeObject,
  bringForward,
  sendBackward,
  bringToFront,
  sendToBack,
  duplicateObject,
  screenToPdfPoint,
} from '@/lib/pdf/editPdf';
import type { EditorState, StrokePoint } from '@/lib/pdf/editPdf';

// ─── Types ────────────────────────────────────────────────────────────────────

type SaveState = 'idle' | 'saving' | 'done' | 'error';
type ToolMode = 'select' | 'text' | 'image' | 'rect' | 'ellipse' | 'line' | 'arrow' | 'highlight' | 'underline' | 'strikethrough' | 'pen' | 'whiteout' | 'sticky' | 'callout';

interface PageInfo {
  number: number;
  widthPt: number;
  heightPt: number;
  rotation: number;
}

interface PdfTextItem {
  id: string;
  text: string;
  /** PDF coordinate space (bottom-left origin) */
  x: number;
  y: number;
  width: number;
  height: number;
  /** Approximate font size in PDF points */
  fontSize: number;
}

// ─── Page rendering ────────────────────────────────────────────────────────────

const PREVIEW_MAX_W = 860;
const PREVIEW_MAX_H = 1000;

async function renderPageToCanvas(
  pdfData: ArrayBuffer,
  pageNumber: number,
  canvas: HTMLCanvasElement,
  userZoom: number,
): Promise<{ widthPt: number; heightPt: number; rotation: number; scale: number; cssWidth: number; cssHeight: number }> {
  const pdfjs = await import('pdfjs-dist');
  if (!pdfjs.GlobalWorkerOptions.workerPort) {
    pdfjs.GlobalWorkerOptions.workerPort = new Worker('/pdf.worker.min.mjs', { type: 'module' });
  }
  const task = pdfjs.getDocument({ data: pdfData.slice(0), disableAutoFetch: true, wasmUrl: '/wasm/' });
  const doc = await task.promise;
  const page = await doc.getPage(pageNumber);
  const rotation = page.rotate;
  const vpNatural = page.getViewport({ scale: 1, rotation: 0 });
  const widthPt = vpNatural.width;
  const heightPt = vpNatural.height;
  // CSS scale: the logical pixel scale for layout and overlay positioning
  const cssScale = Math.min(PREVIEW_MAX_W / widthPt, PREVIEW_MAX_H / heightPt, 2) * userZoom;
  // DPR: render at device resolution for crisp output on Retina/HiDPI displays
  const dpr = typeof window !== 'undefined' ? (window.devicePixelRatio || 1) : 1;
  const physicalScale = cssScale * dpr;
  const viewport = page.getViewport({ scale: physicalScale, rotation });
  // Set physical canvas size (device pixels)
  canvas.width = Math.floor(viewport.width);
  canvas.height = Math.floor(viewport.height);
  // Set CSS display size (logical pixels) — overlays align to these dimensions
  const cssWidth = Math.floor(viewport.width / dpr);
  const cssHeight = Math.floor(viewport.height / dpr);
  canvas.style.width = `${cssWidth}px`;
  canvas.style.height = `${cssHeight}px`;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    await page.render({ canvas, canvasContext: ctx, viewport }).promise;
  }
  page.cleanup();
  doc.cleanup();
  return { widthPt, heightPt, rotation, scale: cssScale, cssWidth, cssHeight };
}

// ─── Extract text items from pdfjs ────────────────────────────────────────────

async function extractPageTextItems(
  pdfData: ArrayBuffer,
  pageNumber: number,
): Promise<PdfTextItem[]> {
  const pdfjs = await import('pdfjs-dist');
  if (!pdfjs.GlobalWorkerOptions.workerPort) {
    pdfjs.GlobalWorkerOptions.workerPort = new Worker('/pdf.worker.min.mjs', { type: 'module' });
  }
  const task = pdfjs.getDocument({ data: pdfData.slice(0), disableAutoFetch: true, wasmUrl: '/wasm/' });
  const doc = await task.promise;
  const page = await doc.getPage(pageNumber);
  const heightPt = page.getViewport({ scale: 1, rotation: 0 }).height;
  const content = await page.getTextContent();
  page.cleanup();
  doc.cleanup();

  const items: PdfTextItem[] = [];
  let idx = 0;
  for (const item of content.items) {
    if (!('str' in item) || !item.str.trim()) continue;
    // pdfjs transform: [scaleX, skewX, skewY, scaleY, translateX, translateY]
    const t = item.transform as number[];
    const scaleX = Math.abs(t[0]);
    const scaleY = Math.abs(t[3]);
    const fontSize = Math.max(scaleX, scaleY);
    const x = t[4];
    // t[5] is the baseline Y in PDF coords (bottom-left origin).
    // Use fontSize as the glyph height; y = baseline - fontSize gives the bottom of the glyph.
    const itemH = fontSize;
    const y = t[5] - itemH;
    const w = (item as { width?: number }).width ?? scaleX * item.str.length;
    items.push({ id: `pdftext-${idx++}`, text: item.str, x, y, width: w, height: itemH, fontSize });
  }
  return items;
}

// ─── Image decode ─────────────────────────────────────────────────────────────

async function decodeImageFile(file: File): Promise<{
  objectUrl: string;
  mimeType: 'image/jpeg' | 'image/png';
  naturalWidth: number;
  naturalHeight: number;
  embedBytes: Uint8Array;
} | null> {
  const t = file.type.toLowerCase();
  const n = file.name.toLowerCase();
  const isJpeg = t === 'image/jpeg' || n.endsWith('.jpg') || n.endsWith('.jpeg');
  const isPng = t === 'image/png' || n.endsWith('.png');
  const isWebp = t === 'image/webp' || n.endsWith('.webp');
  if (!isJpeg && !isPng && !isWebp) return null;

  const buf = await new Promise<ArrayBuffer>((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result as ArrayBuffer);
    r.onerror = () => rej(new Error('read failed'));
    r.readAsArrayBuffer(file);
  });

  const mimeOrig = isJpeg ? 'image/jpeg' : isWebp ? 'image/webp' : 'image/png';
  const objUrl = URL.createObjectURL(new Blob([buf], { type: mimeOrig }));

  const img = await new Promise<HTMLImageElement>((res, rej) => {
    const el = document.createElement('img');
    el.onload = () => res(el);
    el.onerror = () => rej(new Error('decode failed'));
    el.src = objUrl;
  });
  const naturalWidth = img.naturalWidth;
  const naturalHeight = img.naturalHeight;

  let embedBytes: Uint8Array;
  let mimeType: 'image/jpeg' | 'image/png';

  if (isWebp) {
    // Convert to PNG for pdf-lib
    const cv = document.createElement('canvas');
    cv.width = naturalWidth; cv.height = naturalHeight;
    const ctx = cv.getContext('2d');
    if (!ctx) return null;
    ctx.drawImage(img, 0, 0);
    const pngBlob = await new Promise<Blob | null>((r) => cv.toBlob(r, 'image/png'));
    if (!pngBlob) return null;
    embedBytes = new Uint8Array(await pngBlob.arrayBuffer());
    mimeType = 'image/png';
  } else if (isPng) {
    embedBytes = new Uint8Array(buf);
    mimeType = 'image/png';
  } else {
    embedBytes = new Uint8Array(buf);
    mimeType = 'image/jpeg';
  }

  return { objectUrl: objUrl, mimeType, naturalWidth, naturalHeight, embedBytes };
}

// ─── Inline text editor overlay ──────────────────────────────────────────────

function InlineTextEditor({
  obj,
  pageScale,
  pageDims,
  onCommit,
  onClose,
}: {
  obj: TextObject;
  pageScale: number;
  pageDims: { widthPt: number; heightPt: number };
  onCommit: (text: string) => void;
  onClose: () => void;
}) {
  const taRef = useRef<HTMLTextAreaElement>(null);
  const committedRef = useRef(false);
  const { left, top, width, height } = pdfRectToScreen(obj.x, obj.y, obj.width, obj.height, pageScale, pageDims.heightPt);

  useEffect(() => {
    const el = taRef.current;
    if (!el) return;
    el.focus();
    el.setSelectionRange(el.value.length, el.value.length);
  }, []);

  const commit = (val: string) => {
    if (committedRef.current) return;
    committedRef.current = true;
    onCommit(val);
  };

  return (
    <textarea
      ref={taRef}
      defaultValue={obj.text}
      aria-label="Edit text inline"
      style={{
        position: 'absolute',
        left: left - 2,
        top: top - 2,
        width: Math.max(width + 4, 80),
        height: Math.max(height + 4, 24),
        minWidth: 80,
        minHeight: 24,
        fontSize: obj.fontSize * pageScale,
        fontFamily: obj.fontFamily === 'Times New Roman' ? 'Times New Roman, serif' : obj.fontFamily === 'Courier' ? 'Courier New, monospace' : 'Helvetica, Arial, sans-serif',
        fontWeight: obj.bold ? 'bold' : 'normal',
        fontStyle: obj.italic ? 'italic' : 'normal',
        textDecoration: obj.underline ? 'underline' : 'none',
        color: obj.color,
        textAlign: obj.align,
        lineHeight: 1.2,
        background: '#ffffff',
        border: '2px solid #2563eb',
        borderRadius: 3,
        padding: '2px 4px',
        resize: 'none',
        outline: 'none',
        zIndex: 20,
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}
      onBlur={(e) => { commit(e.target.value); onClose(); }}
      onKeyDown={(e) => {
        if (e.key === 'Escape') { onClose(); }
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); commit((e.target as HTMLTextAreaElement).value); onClose(); }
      }}
    />
  );
}

// ─── Inline editor for existing PDF text — ihatepdf-style resizable box ────────────────

function PdfTextInlineEditor({
  item,
  pageScale,
  pageDims,
  onCommit,
  onCancel,
}: {
  item: PdfTextItem;
  pageScale: number;
  pageDims: { widthPt: number; heightPt: number };
  onCommit: (text: string, widthPt: number, heightPt: number) => void;
  onCancel: () => void;
}) {
  const taRef = useRef<HTMLTextAreaElement>(null);
  const committedRef = useRef(false);

  const initialRect = pdfRectToScreen(
    item.x, item.y,
    Math.max(item.width, 120 / pageScale),
    Math.max(item.fontSize * 1.5, 24 / pageScale),
    pageScale, pageDims.heightPt,
  );
  const [boxLeft, setBoxLeft] = useState(initialRect.left);
  const [boxTop, setBoxTop] = useState(initialRect.top);
  const [boxW, setBoxW] = useState(Math.max(initialRect.width, 120));
  const [boxH, setBoxH] = useState(Math.max(initialRect.height, 24));

  const screenFontSize = item.fontSize * pageScale;

  const resizeRef = useRef<{
    handle: string; startX: number; startY: number;
    startL: number; startT: number; startW: number; startH: number;
  } | null>(null);

  useEffect(() => {
    const ta = taRef.current;
    if (!ta) return;
    ta.focus();
    ta.setSelectionRange(ta.value.length, ta.value.length);
  }, []);

  const commit = (val: string) => {
    if (committedRef.current) return;
    committedRef.current = true;
    onCommit(val, boxW / pageScale, boxH / pageScale);
  };

  const startResize = (handle: string, e: React.PointerEvent) => {
    e.stopPropagation(); e.preventDefault();
    resizeRef.current = { handle, startX: e.clientX, startY: e.clientY, startL: boxLeft, startT: boxTop, startW: boxW, startH: boxH };
    (e.target as Element).setPointerCapture(e.pointerId);
  };
  const onResizeMove = (e: React.PointerEvent) => {
    const r = resizeRef.current;
    if (!r) return;
    const dx = e.clientX - r.startX;
    const dy = e.clientY - r.startY;
    const minW = 40; const minH = screenFontSize + 4;
    let l = r.startL, t = r.startT, w = r.startW, h = r.startH;
    if (r.handle.includes('e')) w = Math.max(minW, r.startW + dx);
    if (r.handle.includes('s')) h = Math.max(minH, r.startH + dy);
    if (r.handle.includes('w')) { w = Math.max(minW, r.startW - dx); l = r.startL + (r.startW - w); }
    if (r.handle.includes('n')) { h = Math.max(minH, r.startH - dy); t = r.startT + (r.startH - h); }
    setBoxLeft(l); setBoxTop(t); setBoxW(w); setBoxH(h);
  };
  const onResizeUp = (e: React.PointerEvent) => {
    resizeRef.current = null;
    (e.target as Element).releasePointerCapture(e.pointerId);
  };

  const moveRef = useRef<{ startX: number; startY: number; startL: number; startT: number } | null>(null);
  const startMove = (e: React.PointerEvent) => {
    e.stopPropagation(); e.preventDefault();
    moveRef.current = { startX: e.clientX, startY: e.clientY, startL: boxLeft, startT: boxTop };
    (e.target as Element).setPointerCapture(e.pointerId);
  };
  const onMoveMove = (e: React.PointerEvent) => {
    const m = moveRef.current;
    if (!m) return;
    setBoxLeft(m.startL + e.clientX - m.startX);
    setBoxTop(m.startT + e.clientY - m.startY);
  };
  const onMoveUp = (e: React.PointerEvent) => {
    moveRef.current = null;
    (e.target as Element).releasePointerCapture(e.pointerId);
  };

  const hsz = 8;
  const handles: { id: string; style: React.CSSProperties }[] = [
    { id: 'nw', style: { top: -hsz/2, left: -hsz/2, cursor: 'nw-resize' } },
    { id: 'n',  style: { top: -hsz/2, left: '50%', transform: 'translateX(-50%)', cursor: 'n-resize' } },
    { id: 'ne', style: { top: -hsz/2, right: -hsz/2, cursor: 'ne-resize' } },
    { id: 'e',  style: { top: '50%', right: -hsz/2, transform: 'translateY(-50%)', cursor: 'e-resize' } },
    { id: 'se', style: { bottom: -hsz/2, right: -hsz/2, cursor: 'se-resize' } },
    { id: 's',  style: { bottom: -hsz/2, left: '50%', transform: 'translateX(-50%)', cursor: 's-resize' } },
    { id: 'sw', style: { bottom: -hsz/2, left: -hsz/2, cursor: 'sw-resize' } },
    { id: 'w',  style: { top: '50%', left: -hsz/2, transform: 'translateY(-50%)', cursor: 'w-resize' } },
  ];

  return (
    <>
      <div style={{ position: 'absolute', left: boxLeft, top: Math.max(0, boxTop - 38), display: 'flex', alignItems: 'center', gap: 4, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 6, boxShadow: '0 2px 8px rgba(0,0,0,0.12)', padding: '4px 6px', zIndex: 40, pointerEvents: 'all', whiteSpace: 'nowrap' }} onMouseDown={(e) => e.stopPropagation()}>
        <span style={{ fontSize: 11, color: '#64748b', fontFamily: 'sans-serif', paddingRight: 4 }}>{Math.round(item.fontSize)}pt</span>
        <div style={{ width: 1, height: 16, background: '#e2e8f0' }} />
        <button style={{ fontSize: 11, padding: '2px 8px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontFamily: 'sans-serif' }} onMouseDown={(e) => { e.preventDefault(); commit(taRef.current?.value ?? item.text); }}>Done</button>
        <button style={{ fontSize: 11, padding: '2px 6px', background: 'transparent', color: '#64748b', border: '1px solid #e2e8f0', borderRadius: 4, cursor: 'pointer', fontFamily: 'sans-serif' }} onMouseDown={(e) => { e.preventDefault(); onCancel(); }}>Cancel</button>
      </div>
      <div style={{ position: 'absolute', left: boxLeft, top: boxTop, width: boxW, height: boxH, border: '2px solid #2563eb', borderRadius: 2, boxShadow: '0 0 0 1px rgba(37,99,235,0.2)', boxSizing: 'border-box', zIndex: 30, background: 'transparent', pointerEvents: 'all' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 10, cursor: 'move', zIndex: 2 }} onPointerDown={startMove} onPointerMove={onMoveMove} onPointerUp={onMoveUp} />
        <textarea ref={taRef} defaultValue={item.text} aria-label="Edit PDF text"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', fontSize: screenFontSize, fontFamily: 'Helvetica, Arial, sans-serif', fontWeight: 'normal', lineHeight: 1.25, color: '#000000', background: '#ffffff', border: 'none', outline: 'none', padding: '2px 4px', margin: 0, resize: 'none', boxSizing: 'border-box', caretColor: '#2563eb', zIndex: 1 }}
          onKeyDown={(e) => { if (e.key === 'Escape') { e.preventDefault(); onCancel(); } if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); commit(e.currentTarget.value); } }}
        />
        {handles.map((h) => (
          <div key={h.id} style={{ position: 'absolute', width: hsz, height: hsz, background: '#2563eb', border: '2px solid white', borderRadius: 2, zIndex: 3, touchAction: 'none', ...h.style }} onPointerDown={(e) => startResize(h.id, e)} onPointerMove={onResizeMove} onPointerUp={onResizeUp} />
        ))}
      </div>
    </>
  );
}

// ─── Annotation comment edit modal (sticky note / callout) ────────────────────

function AnnotEditModal({
  obj,
  onSave,
  onClose,
}: {
  obj: StickyNoteObject | CalloutObject;
  onSave: (patch: Partial<StickyNoteObject> | Partial<CalloutObject>) => void;
  onClose: () => void;
}) {
  const isSticky = obj.type === 'sticky';
  const initComment = isSticky ? (obj as StickyNoteObject).comment : (obj as CalloutObject).text;
  const initColor = isSticky ? (obj as StickyNoteObject).color : (obj as CalloutObject).bgColor;
  const initFontSize = isSticky ? 9 : (obj as CalloutObject).fontSize;

  const [comment, setComment] = useState(initComment);
  const [color, setColor] = useState(initColor);
  const [fontSize, setFontSize] = useState(initFontSize);
  const [textColor, setTextColor] = useState(isSticky ? '#111111' : (obj as CalloutObject).color);
  const taRef = useRef<HTMLTextAreaElement>(null);
  useEffect(() => { taRef.current?.focus(); }, []);

  const handleSave = () => {
    if (isSticky) {
      onSave({ comment, color } as Partial<StickyNoteObject>);
    } else {
      onSave({ text: comment, bgColor: color, fontSize, color: textColor } as Partial<CalloutObject>);
    }
    onClose();
  };

  return (
    <div role="dialog" aria-modal="true" aria-label={isSticky ? 'Edit sticky note' : 'Edit callout'}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background: 'white', borderRadius: 12, padding: '1.5rem', width: '100%', maxWidth: 420, display: 'flex', flexDirection: 'column', gap: '0.75rem', boxShadow: '0 25px 50px rgba(0,0,0,0.3)' }}>
        <h2 className="text-base font-semibold text-gray-900">{isSticky ? 'Edit Sticky Note' : 'Edit Callout'}</h2>
        <textarea ref={taRef} value={comment} onChange={(e) => setComment(e.target.value)} rows={4}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Comment text"
          placeholder={isSticky ? 'Add a note…' : 'Callout text…'} />
        <div className="flex flex-wrap gap-3 items-center">
          <label className="flex items-center gap-1.5 text-xs text-gray-600">
            {isSticky ? 'Note color' : 'Background'}
            <input type="color" value={color} onChange={(e) => setColor(e.target.value)}
              className="w-8 h-7 rounded border border-gray-300 p-0.5 cursor-pointer" />
          </label>
          {!isSticky && (
            <>
              <label className="flex items-center gap-1.5 text-xs text-gray-600">
                Text color
                <input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)}
                  className="w-8 h-7 rounded border border-gray-300 p-0.5 cursor-pointer" />
              </label>
              <label className="flex items-center gap-1.5 text-xs text-gray-600">
                Size
                <input type="number" value={fontSize} onChange={(e) => setFontSize(Math.max(6, Math.min(72, Number(e.target.value))))}
                  min={6} max={72} className="w-14 rounded border border-gray-300 px-2 py-1 text-sm" />
              </label>
            </>
          )}
        </div>
        <div className="flex justify-end gap-2 pt-1">
          <button onClick={onClose} className="px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-50">Cancel</button>
          <button onClick={handleSave} className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700">Apply</button>
        </div>
      </div>
    </div>
  );
}

// ─── Contextual sidebar panel for selected object ─────────────────────────────

function SidebarPanel({
  obj,
  onUpdate,
  onDelete,
  onDuplicate,
  onBringForward,
  onSendBackward,
  onBringToFront,
  onSendToBack,
  onEditText,
  onEditNote,
  onReplaceImage,
}: {
  obj: EditorObject | null;
  onUpdate: (id: string, patch: Partial<EditorObject>) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onBringForward: (id: string) => void;
  onSendBackward: (id: string) => void;
  onBringToFront: (id: string) => void;
  onSendToBack: (id: string) => void;
  onEditText: (id: string) => void;
  onEditNote: (id: string) => void;
  onReplaceImage: (id: string, file: File) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!obj) {
    return (
      <div className="flex flex-col h-full">
        <div className="p-3 border-b border-gray-100 dark:border-gray-800">
          <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Properties</h3>
        </div>
        <div className="flex-1 flex items-center justify-center p-4">
          <p className="text-xs text-center text-gray-400 dark:text-gray-600">Select an object<br />to edit its properties</p>
        </div>
      </div>
    );
  }

  const renderStyleControls = () => {
    if (obj.type === 'text') {
      const txt = obj as TextObject;
      return (
        <div className="space-y-3">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Font</label>
            <select value={txt.fontFamily} onChange={(e) => onUpdate(txt.id, { fontFamily: e.target.value as FontFamily })} className="w-full rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-2 py-1.5 text-xs text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500" aria-label="Font family">
              <option value="Helvetica">Helvetica</option>
              <option value="Times New Roman">Times New Roman</option>
              <option value="Courier">Courier</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Size</label>
            <input type="number" value={txt.fontSize} onChange={(e) => onUpdate(txt.id, { fontSize: Math.max(6, Math.min(200, Number(e.target.value))) })} min={6} max={200} className="w-full rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-2 py-1.5 text-xs text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500" aria-label="Font size" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Style</label>
            <div className="flex gap-1.5">
              <button onClick={() => onUpdate(txt.id, { bold: !txt.bold })} className={`flex-1 py-1.5 rounded-md border text-xs font-bold ${txt.bold ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'}`} aria-pressed={txt.bold}>B</button>
              <button onClick={() => onUpdate(txt.id, { italic: !txt.italic })} className={`flex-1 py-1.5 rounded-md border text-xs italic ${txt.italic ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'}`} aria-pressed={txt.italic}>I</button>
              <button onClick={() => onUpdate(txt.id, { underline: !txt.underline })} className={`flex-1 py-1.5 rounded-md border text-xs underline ${txt.underline ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'}`} aria-pressed={txt.underline}>U</button>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Align</label>
            <div className="flex gap-1.5">
              {(['left', 'center', 'right'] as TextAlign[]).map((a) => (
                <button key={a} onClick={() => onUpdate(txt.id, { align: a })} className={`flex-1 py-1.5 rounded-md border text-xs ${txt.align === a ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`} aria-pressed={txt.align === a}>{a === 'left' ? '⬛' : a === 'center' ? '☰' : '⬜'}</button>
              ))}
            </div>
          </div>
          <div className="flex gap-2 items-center">
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Color</label>
            <input type="color" value={txt.color} onChange={(e) => onUpdate(txt.id, { color: e.target.value })} className="flex-1 h-8 rounded-md border border-gray-200 dark:border-gray-700 p-0.5 cursor-pointer" aria-label="Text color" />
          </div>
          <div className="space-y-1">
            <div className="flex justify-between">
              <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Opacity</label>
              <span className="text-xs text-gray-400">{Math.round(txt.opacity * 100)}%</span>
            </div>
            <input type="range" value={Math.round(txt.opacity * 100)} onChange={(e) => onUpdate(txt.id, { opacity: Number(e.target.value) / 100 })} min={10} max={100} className="w-full" />
          </div>
          <button onClick={() => onEditText(txt.id)} className="w-full py-2 rounded-md border border-blue-200 dark:border-blue-800 text-xs font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30">Edit Text</button>
        </div>
      );
    }

    if (obj.type === 'rect') {
      const r = obj as RectObject;
      return (
        <div className="space-y-3">
          <div className="flex gap-2 items-center">
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400 w-14">Border</label>
            <input type="color" value={r.borderColor} onChange={(e) => onUpdate(r.id, { borderColor: e.target.value } as Partial<RectObject>)} className="flex-1 h-8 rounded-md border border-gray-200 dark:border-gray-700 p-0.5 cursor-pointer" />
          </div>
          <div className="flex gap-2 items-center">
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400 w-14">Fill</label>
            <input type="color" value={r.fillColor} onChange={(e) => onUpdate(r.id, { fillColor: e.target.value } as Partial<RectObject>)} className="flex-1 h-8 rounded-md border border-gray-200 dark:border-gray-700 p-0.5 cursor-pointer" />
          </div>
          <div className="space-y-1">
            <div className="flex justify-between"><label className="text-xs font-medium text-gray-600 dark:text-gray-400">Fill opacity</label><span className="text-xs text-gray-400">{Math.round(r.fillOpacity * 100)}%</span></div>
            <input type="range" value={Math.round(r.fillOpacity * 100)} onChange={(e) => onUpdate(r.id, { fillOpacity: Number(e.target.value) / 100 } as Partial<RectObject>)} min={0} max={100} className="w-full" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Border width</label>
            <input type="number" value={r.borderWidth} onChange={(e) => onUpdate(r.id, { borderWidth: Math.max(0, Number(e.target.value)) } as Partial<RectObject>)} min={0} max={20} className="w-full rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500" />
          </div>
          <div className="space-y-1">
            <div className="flex justify-between"><label className="text-xs font-medium text-gray-600 dark:text-gray-400">Opacity</label><span className="text-xs text-gray-400">{Math.round(r.opacity * 100)}%</span></div>
            <input type="range" value={Math.round(r.opacity * 100)} onChange={(e) => onUpdate(r.id, { opacity: Number(e.target.value) / 100 } as Partial<RectObject>)} min={10} max={100} className="w-full" />
          </div>
        </div>
      );
    }

    if (obj.type === 'ellipse') {
      const ell = obj as EllipseObject;
      return (
        <div className="space-y-3">
          <div className="flex gap-2 items-center"><label className="text-xs font-medium text-gray-600 dark:text-gray-400 w-14">Border</label><input type="color" value={ell.borderColor} onChange={(e) => onUpdate(ell.id, { borderColor: e.target.value } as Partial<EllipseObject>)} className="flex-1 h-8 rounded-md border border-gray-200 dark:border-gray-700 p-0.5 cursor-pointer" /></div>
          <div className="flex gap-2 items-center"><label className="text-xs font-medium text-gray-600 dark:text-gray-400 w-14">Fill</label><input type="color" value={ell.fillColor} onChange={(e) => onUpdate(ell.id, { fillColor: e.target.value } as Partial<EllipseObject>)} className="flex-1 h-8 rounded-md border border-gray-200 dark:border-gray-700 p-0.5 cursor-pointer" /></div>
          <div className="space-y-1">
            <div className="flex justify-between"><label className="text-xs font-medium text-gray-600 dark:text-gray-400">Fill opacity</label><span className="text-xs text-gray-400">{Math.round(ell.fillOpacity * 100)}%</span></div>
            <input type="range" value={Math.round(ell.fillOpacity * 100)} onChange={(e) => onUpdate(ell.id, { fillOpacity: Number(e.target.value) / 100 } as Partial<EllipseObject>)} min={0} max={100} className="w-full" />
          </div>
          <div className="space-y-1.5"><label className="text-xs font-medium text-gray-600 dark:text-gray-400">Border width</label><input type="number" value={ell.borderWidth} onChange={(e) => onUpdate(ell.id, { borderWidth: Math.max(0, Number(e.target.value)) } as Partial<EllipseObject>)} min={0} max={20} className="w-full rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500" /></div>
        </div>
      );
    }

    if (obj.type === 'line' || obj.type === 'arrow') {
      const lo = obj as LineObject | ArrowObject;
      return (
        <div className="space-y-3">
          <div className="flex gap-2 items-center"><label className="text-xs font-medium text-gray-600 dark:text-gray-400 w-14">Color</label><input type="color" value={lo.color} onChange={(e) => onUpdate(lo.id, { color: e.target.value })} className="flex-1 h-8 rounded-md border border-gray-200 dark:border-gray-700 p-0.5 cursor-pointer" /></div>
          <div className="space-y-1.5"><label className="text-xs font-medium text-gray-600 dark:text-gray-400">Width</label><input type="number" value={lo.width} onChange={(e) => onUpdate(lo.id, { width: Math.max(1, Number(e.target.value)) })} min={1} max={20} className="w-full rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500" /></div>
          <div className="space-y-1">
            <div className="flex justify-between"><label className="text-xs font-medium text-gray-600 dark:text-gray-400">Opacity</label><span className="text-xs text-gray-400">{Math.round(lo.opacity * 100)}%</span></div>
            <input type="range" value={Math.round(lo.opacity * 100)} onChange={(e) => onUpdate(lo.id, { opacity: Number(e.target.value) / 100 })} min={10} max={100} className="w-full" />
          </div>
          {obj.type === 'arrow' && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Arrowhead</label>
              <select value={(lo as ArrowObject).arrowhead} onChange={(e) => onUpdate(lo.id, { arrowhead: e.target.value as ArrowheadStyle } as Partial<ArrowObject>)} className="w-full rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500">
                <option value="none">None</option>
                <option value="standard">Standard</option>
                <option value="filled">Filled</option>
              </select>
            </div>
          )}
        </div>
      );
    }

    if (obj.type === 'highlight' || obj.type === 'underline' || obj.type === 'strikethrough') {
      const ann = obj as AnnotationObject;
      return (
        <div className="space-y-3">
          <div className="flex gap-2 items-center"><label className="text-xs font-medium text-gray-600 dark:text-gray-400 w-14">Color</label><input type="color" value={ann.color} onChange={(e) => onUpdate(ann.id, { color: e.target.value })} className="flex-1 h-8 rounded-md border border-gray-200 dark:border-gray-700 p-0.5 cursor-pointer" /></div>
          <div className="space-y-1">
            <div className="flex justify-between"><label className="text-xs font-medium text-gray-600 dark:text-gray-400">Opacity</label><span className="text-xs text-gray-400">{Math.round(ann.opacity * 100)}%</span></div>
            <input type="range" value={Math.round(ann.opacity * 100)} onChange={(e) => onUpdate(ann.id, { opacity: Number(e.target.value) / 100 })} min={10} max={100} className="w-full" />
          </div>
          {(ann.type === 'underline' || ann.type === 'strikethrough') && (
            <div className="space-y-1.5"><label className="text-xs font-medium text-gray-600 dark:text-gray-400">Line width</label><input type="number" value={ann.lineWidth} onChange={(e) => onUpdate(ann.id, { lineWidth: Math.max(1, Number(e.target.value)) })} min={1} max={10} className="w-full rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500" /></div>
          )}
        </div>
      );
    }

    if (obj.type === 'image') {
      const img = obj as ImageObject;
      return (
        <div className="space-y-3">
          <div className="space-y-1">
            <div className="flex justify-between"><label className="text-xs font-medium text-gray-600 dark:text-gray-400">Opacity</label><span className="text-xs text-gray-400">{Math.round(img.opacity * 100)}%</span></div>
            <input type="range" value={Math.round(img.opacity * 100)} onChange={(e) => onUpdate(img.id, { opacity: Number(e.target.value) / 100 })} min={10} max={100} className="w-full" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Rotation</label>
            <input type="number" value={Math.round(img.rotation)} onChange={(e) => onUpdate(img.id, { rotation: ((Number(e.target.value) % 360) + 360) % 360 })} min={0} max={359} step={90} className="w-full rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500" />
          </div>
          <label className="block w-full py-2 rounded-md border border-gray-200 dark:border-gray-700 text-xs text-center text-gray-700 dark:text-gray-300 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
            Replace Image
            <input ref={fileInputRef} type="file" accept="image/jpeg,image/jpg,image/png,image/webp" className="sr-only" onChange={(e) => { const f = e.target.files?.[0]; if (f) onReplaceImage(img.id, f); }} />
          </label>
        </div>
      );
    }

    if (obj.type === 'stroke') {
      const st = obj as StrokeObject;
      return (
        <div className="space-y-3">
          <div className="flex gap-2 items-center"><label className="text-xs font-medium text-gray-600 dark:text-gray-400 w-14">Color</label><input type="color" value={st.color} onChange={(e) => onUpdate(st.id, { color: e.target.value })} className="flex-1 h-8 rounded-md border border-gray-200 dark:border-gray-700 p-0.5 cursor-pointer" /></div>
          <div className="space-y-1.5"><label className="text-xs font-medium text-gray-600 dark:text-gray-400">Width</label><input type="number" value={st.width} onChange={(e) => onUpdate(st.id, { width: Math.max(1, Number(e.target.value)) })} min={1} max={40} className="w-full rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500" /></div>
          <div className="space-y-1">
            <div className="flex justify-between"><label className="text-xs font-medium text-gray-600 dark:text-gray-400">Opacity</label><span className="text-xs text-gray-400">{Math.round(st.opacity * 100)}%</span></div>
            <input type="range" value={Math.round(st.opacity * 100)} onChange={(e) => onUpdate(st.id, { opacity: Number(e.target.value) / 100 })} min={10} max={100} className="w-full" />
          </div>
        </div>
      );
    }

    if (obj.type === 'whiteout') {
      const wo = obj as WhiteoutObject;
      return (
        <div className="space-y-3">
          <div className="flex gap-2 items-center"><label className="text-xs font-medium text-gray-600 dark:text-gray-400 w-14">Fill</label><input type="color" value={wo.fillColor} onChange={(e) => onUpdate(wo.id, { fillColor: e.target.value } as Partial<WhiteoutObject>)} className="flex-1 h-8 rounded-md border border-gray-200 dark:border-gray-700 p-0.5 cursor-pointer" /></div>
          <div className="space-y-1">
            <div className="flex justify-between"><label className="text-xs font-medium text-gray-600 dark:text-gray-400">Opacity</label><span className="text-xs text-gray-400">{Math.round(wo.fillOpacity * 100)}%</span></div>
            <input type="range" value={Math.round(wo.fillOpacity * 100)} onChange={(e) => onUpdate(wo.id, { fillOpacity: Number(e.target.value) / 100 } as Partial<WhiteoutObject>)} min={10} max={100} className="w-full" />
          </div>
          <div className="flex gap-2 items-center"><label className="text-xs font-medium text-gray-600 dark:text-gray-400 w-14">Border</label><input type="color" value={wo.borderColor} onChange={(e) => onUpdate(wo.id, { borderColor: e.target.value } as Partial<WhiteoutObject>)} className="flex-1 h-8 rounded-md border border-gray-200 dark:border-gray-700 p-0.5 cursor-pointer" /></div>
          <div className="space-y-1.5"><label className="text-xs font-medium text-gray-600 dark:text-gray-400">Border width</label><input type="number" value={wo.borderWidth} onChange={(e) => onUpdate(wo.id, { borderWidth: Math.max(0, Number(e.target.value)) } as Partial<WhiteoutObject>)} min={0} max={20} className="w-full rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500" /></div>
        </div>
      );
    }

    if (obj.type === 'sticky') {
      const sn = obj as StickyNoteObject;
      return (
        <div className="space-y-3">
          <div className="flex gap-2 items-center"><label className="text-xs font-medium text-gray-600 dark:text-gray-400 w-14">Color</label><input type="color" value={sn.color} onChange={(e) => onUpdate(sn.id, { color: e.target.value } as Partial<StickyNoteObject>)} className="flex-1 h-8 rounded-md border border-gray-200 dark:border-gray-700 p-0.5 cursor-pointer" /></div>
          <div className="space-y-1">
            <div className="flex justify-between"><label className="text-xs font-medium text-gray-600 dark:text-gray-400">Opacity</label><span className="text-xs text-gray-400">{Math.round(sn.opacity * 100)}%</span></div>
            <input type="range" value={Math.round(sn.opacity * 100)} onChange={(e) => onUpdate(sn.id, { opacity: Number(e.target.value) / 100 } as Partial<StickyNoteObject>)} min={20} max={100} className="w-full" />
          </div>
          <button onClick={() => onEditNote(sn.id)} className="w-full py-2 rounded-md border border-blue-200 dark:border-blue-800 text-xs font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30">Edit Note</button>
        </div>
      );
    }

    if (obj.type === 'callout') {
      const co = obj as CalloutObject;
      return (
        <div className="space-y-3">
          <div className="flex gap-2 items-center"><label className="text-xs font-medium text-gray-600 dark:text-gray-400 w-14">Bg</label><input type="color" value={co.bgColor} onChange={(e) => onUpdate(co.id, { bgColor: e.target.value } as Partial<CalloutObject>)} className="flex-1 h-8 rounded-md border border-gray-200 dark:border-gray-700 p-0.5 cursor-pointer" /></div>
          <div className="flex gap-2 items-center"><label className="text-xs font-medium text-gray-600 dark:text-gray-400 w-14">Text</label><input type="color" value={co.color} onChange={(e) => onUpdate(co.id, { color: e.target.value } as Partial<CalloutObject>)} className="flex-1 h-8 rounded-md border border-gray-200 dark:border-gray-700 p-0.5 cursor-pointer" /></div>
          <div className="flex gap-2 items-center"><label className="text-xs font-medium text-gray-600 dark:text-gray-400 w-14">Border</label><input type="color" value={co.borderColor} onChange={(e) => onUpdate(co.id, { borderColor: e.target.value } as Partial<CalloutObject>)} className="flex-1 h-8 rounded-md border border-gray-200 dark:border-gray-700 p-0.5 cursor-pointer" /></div>
          <div className="space-y-1.5"><label className="text-xs font-medium text-gray-600 dark:text-gray-400">Border width</label><input type="number" value={co.borderWidth} onChange={(e) => onUpdate(co.id, { borderWidth: Math.max(0, Number(e.target.value)) } as Partial<CalloutObject>)} min={0} max={10} className="w-full rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500" /></div>
          <div className="space-y-1.5"><label className="text-xs font-medium text-gray-600 dark:text-gray-400">Font size</label><input type="number" value={co.fontSize} onChange={(e) => onUpdate(co.id, { fontSize: Math.max(6, Math.min(72, Number(e.target.value))) } as Partial<CalloutObject>)} min={6} max={72} className="w-full rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500" /></div>
          <div className="space-y-1">
            <div className="flex justify-between"><label className="text-xs font-medium text-gray-600 dark:text-gray-400">Opacity</label><span className="text-xs text-gray-400">{Math.round(co.opacity * 100)}%</span></div>
            <input type="range" value={Math.round(co.opacity * 100)} onChange={(e) => onUpdate(co.id, { opacity: Number(e.target.value) / 100 } as Partial<CalloutObject>)} min={20} max={100} className="w-full" />
          </div>
          <button onClick={() => onEditNote(co.id)} className="w-full py-2 rounded-md border border-blue-200 dark:border-blue-800 text-xs font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30">Edit Callout</button>
        </div>
      );
    }

    return null;
  };

  const typeLabel: Record<string, string> = {
    text: 'Text', image: 'Image', rect: 'Rectangle', ellipse: 'Ellipse',
    line: 'Line', arrow: 'Arrow', highlight: 'Highlight', underline: 'Underline',
    strikethrough: 'Strikethrough', stroke: 'Drawing', whiteout: 'Whiteout',
    sticky: 'Sticky Note', callout: 'Callout',
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b border-gray-100 dark:border-gray-800">
        <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Properties</h3>
        <p className="mt-0.5 text-xs text-gray-700 dark:text-gray-300 font-medium">{typeLabel[obj.type] ?? obj.type}</p>
      </div>
      <div className="flex-1 overflow-y-auto p-3">
        {renderStyleControls()}
      </div>
      <div className="p-3 border-t border-gray-100 dark:border-gray-800 space-y-2">
        <div className="grid grid-cols-4 gap-1">
          <button onClick={() => onBringToFront(obj.id)} title="Bring to front" className="py-1.5 rounded-md border border-gray-200 dark:border-gray-700 text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800">⇑</button>
          <button onClick={() => onBringForward(obj.id)} title="Bring forward" className="py-1.5 rounded-md border border-gray-200 dark:border-gray-700 text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800">↑</button>
          <button onClick={() => onSendBackward(obj.id)} title="Send backward" className="py-1.5 rounded-md border border-gray-200 dark:border-gray-700 text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800">↓</button>
          <button onClick={() => onSendToBack(obj.id)} title="Send to back" className="py-1.5 rounded-md border border-gray-200 dark:border-gray-700 text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800">⇓</button>
        </div>
        <div className="flex gap-1.5">
          <button onClick={() => onDuplicate(obj.id)} className="flex-1 py-1.5 rounded-md border border-gray-200 dark:border-gray-700 text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800">Duplicate</button>
          <button onClick={() => onDelete(obj.id)} className="flex-1 py-1.5 rounded-md border border-red-200 dark:border-red-800 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20">Delete</button>
        </div>
      </div>
    </div>
  );
}

// ─── Drawing in-progress state ─────────────────────────────────────────────────

interface DrawState {
  startX: number; // screen px
  startY: number;
  currentX: number;
  currentY: number;
}

// ─── Default shape colors ─────────────────────────────────────────────────────

const DEFAULT_ANNOTATION_COLORS: Record<AnnotationType, string> = {
  highlight: '#ffff00',
  underline: '#0000ff',
  strikethrough: '#ff0000',
};

// ─── Main page ────────────────────────────────────────────────────────────────

export default function EditPdfPage() {
  const [pdfFile, setPdfFile] = useState<PdfFile | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pageInfos, setPageInfos] = useState<PageInfo[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [rendering, setRendering] = useState(false);

  const [editorState, setEditorState] = useState<EditorState>(createEditorState());
  const [history, setHistory] = useState<EditorState[]>([]);
  const [future, setFuture] = useState<EditorState[]>([]);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [toolMode, setToolMode] = useState<ToolMode>('select');
  const [textEditId, setTextEditId] = useState<string | null>(null);
  const [annotEditId, setAnnotEditId] = useState<string | null>(null);
  const [showAnnotPanel, setShowAnnotPanel] = useState(false);
  const [drawState, setDrawState] = useState<DrawState | null>(null);
  const [pdfTextItems, setPdfTextItems] = useState<PdfTextItem[]>([]);
  const [hoveredTextId, setHoveredTextId] = useState<string | null>(null);
  const [activePdfEdit, setActivePdfEdit] = useState<PdfTextItem | null>(null);

  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [saveResult, setSaveResult] = useState<EditOutcome | null>(null);
  const [zoom, setZoom] = useState(1.0);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pdfUrlRef = useRef<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [pageScale, setPageScale] = useState(1);
  const [pageDims, setPageDims] = useState({ widthPt: 595, heightPt: 842 });
  const imageInputRef = useRef<HTMLInputElement>(null);
  const strokeCanvasRef = useRef<HTMLCanvasElement>(null);
  const strokePointsRef = useRef<StrokePoint[]>([]);
  const [penColor, setPenColor] = useState('#e11d48');
  const [penWidth, setPenWidth] = useState(3);
  const pdfBytesRef = useRef<ArrayBuffer | null>(null);

  const revokePdfUrl = useCallback(() => {
    if (pdfUrlRef.current) {
      URL.revokeObjectURL(pdfUrlRef.current);
      pdfUrlRef.current = null;
    }
  }, []);

  useEffect(() => () => revokePdfUrl(), [revokePdfUrl]);

  // ─── History ─────────────────────────────────────────────────────────────────

  const pushHistory = useCallback((cur: EditorState) => {
    setHistory((prev) => [...prev.slice(-29), cur]);
    setFuture([]);
  }, []);

  const undo = useCallback(() => {
    setHistory((prev) => {
      if (prev.length === 0) return prev;
      const snap = prev[prev.length - 1];
      setFuture((f) => [editorState, ...f.slice(0, 29)]);
      setEditorState(snap);
      return prev.slice(0, -1);
    });
  }, [editorState]);

  const redo = useCallback(() => {
    setFuture((f) => {
      if (f.length === 0) return f;
      const snap = f[0];
      setHistory((h) => [...h.slice(-29), editorState]);
      setEditorState(snap);
      return f.slice(1);
    });
  }, [editorState]);

  const handleUpdate = useCallback((id: string, patch: Partial<EditorObject>) => {
    setEditorState((s) => updateObject(s, id, patch));
  }, []);

  const handleDelete = useCallback((id: string) => {
    setEditorState((s) => { pushHistory(s); return removeObject(s, id); });
    setSelectedId(null);
  }, [pushHistory]);

  // ─── Edit existing PDF text ───────────────────────────────────────────────────

  const handleEditPdfText = useCallback((item: PdfTextItem) => {
    setSelectedId(null);
    setActivePdfEdit(item);
  }, []);

  const handleCommitPdfEdit = useCallback((item: PdfTextItem, newText: string, newWidthPt: number, newHeightPt?: number) => {
    const pageIdx = currentPage - 1;
    const padX = 3;
    const padY = 3;
    // Cover height: use provided newHeightPt if the user resized the box, else fontSize + pad
    const coverH = newHeightPt ?? (item.fontSize + padY * 2);
    const boxW = Math.max(item.width, newWidthPt) + padX * 2;
    const cover: Omit<WhiteoutObject, 'zIndex'> = {
      id: crypto.randomUUID(),
      type: 'whiteout',
      pageIndex: pageIdx,
      x: item.x - padX,
      y: item.y - padY,
      width: boxW,
      height: coverH,
      fillColor: '#ffffff',
      fillOpacity: 1,
      borderColor: '#ffffff',
      borderWidth: 0,
      opacity: 1,
    };
    const textH = newHeightPt ?? (item.fontSize * 2 + padY);
    const textObj: Omit<TextObject, 'zIndex'> = {
      id: crypto.randomUUID(),
      type: 'text',
      pageIndex: pageIdx,
      x: item.x - padX,
      y: item.y - padY,
      width: newWidthPt + padX * 2,
      height: textH,
      text: newText,
      fontFamily: 'Helvetica',
      fontSize: item.fontSize,
      bold: false,
      italic: false,
      underline: false,
      color: '#000000',
      opacity: 1,
      align: 'left',
    };
    setEditorState((prev) => {
      pushHistory(prev);
      let s = addObject(prev, cover);
      s = addObject(s, textObj);
      return s;
    });
    setActivePdfEdit(null);
  }, [currentPage, pushHistory]);

  // ─── File selected ────────────────────────────────────────────────────────────

  const handleFileSelected = useCallback((files: PdfFile[]) => {
    const file = files[0];
    if (!file) return;
    revokePdfUrl();
    // Read raw bytes so pdfjs worker never needs to fetch a blob URL
    const reader = new FileReader();
    reader.onload = () => {
      pdfBytesRef.current = reader.result as ArrayBuffer;
      setPdfFile(file);
      setPdfUrl('loaded'); // non-null sentinel to trigger render effects
      setEditorState(createEditorState());
      setHistory([]); setFuture([]);
      setSelectedId(null); setSaveState('idle'); setSaveResult(null); setLoadError(null);
      setCurrentPage(1); setPageInfos([]);
    };
    reader.onerror = () => setLoadError('Failed to read PDF file.');
    reader.readAsArrayBuffer(file.file);
  }, [revokePdfUrl]);

  // ─── Render page ──────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!pdfUrl || !canvasRef.current || !pdfBytesRef.current) return;
    setRendering(true); setLoadError(null);
    const canvas = canvasRef.current;
    const data = pdfBytesRef.current;
    renderPageToCanvas(data, currentPage, canvas, zoom)
      .then(({ widthPt, heightPt, scale, cssWidth, cssHeight }) => {
        setPageScale(scale);
        setPageDims({ widthPt, heightPt });
        // canvasSize tracks CSS (logical) dimensions — overlays must match this, not physical pixels
        setCanvasSize({ width: cssWidth, height: cssHeight });
      })
      .catch((err) => setLoadError(`Failed to render page: ${String(err).slice(0, 80)}`))
      .finally(() => setRendering(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pdfUrl, currentPage, zoom]);

  // Load all page infos on first render
  useEffect(() => {
    if (!pdfUrl || pageInfos.length > 0 || !pdfBytesRef.current) return;
    const data = pdfBytesRef.current;
    import('pdfjs-dist').then(async (pdfjs) => {
      if (!pdfjs.GlobalWorkerOptions.workerPort) {
        pdfjs.GlobalWorkerOptions.workerPort = new Worker('/pdf.worker.min.mjs', { type: 'module' });
      }
      const doc = await pdfjs.getDocument({ data: data.slice(0), disableAutoFetch: true, wasmUrl: '/wasm/' }).promise;
      const count = doc.numPages;
      const infos: PageInfo[] = [];
      for (let i = 1; i <= count; i++) {
        const pg = await doc.getPage(i);
        const vp = pg.getViewport({ scale: 1, rotation: 0 });
        infos.push({ number: i, widthPt: vp.width, heightPt: vp.height, rotation: pg.rotate });
        pg.cleanup();
      }
      doc.cleanup();
      setPageInfos(infos);
    }).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pdfUrl]);

  // ─── Extract PDF text items only while the user is in text-edit mode ──────────
  // Keeping invisible hit targets for every glyph permanently mounted obscures the
  // original document and makes dense PDFs look like overlapping blue boxes.
  useEffect(() => {
    if (!pdfUrl || !pdfBytesRef.current || toolMode !== 'select') {
      setPdfTextItems([]);
      setHoveredTextId(null);
      return;
    }
    setPdfTextItems([]);
    const data = pdfBytesRef.current;
    let cancelled = false;
    extractPageTextItems(data, currentPage).then((items) => {
      if (!cancelled) setPdfTextItems(items);
    }).catch(() => {});
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pdfUrl, currentPage, toolMode]);

  // ─── Canvas pointer — shape/annotation drawing ────────────────────────────────

  const isDrawingTool = (m: ToolMode) =>
    m === 'rect' || m === 'ellipse' || m === 'line' || m === 'arrow' ||
    m === 'highlight' || m === 'underline' || m === 'strikethrough' || m === 'whiteout';

  const getCanvasRelative = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const handleCanvasPointerDown = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (toolMode === 'text') {
        // Text: place on click
        const canvas = canvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        const sx = e.clientX - rect.left;
        const sy = e.clientY - rect.top;
        const pdfPt = screenToPdfPoint(sx, sy, pageScale, pageDims.heightPt);
        const dw = 200 / pageScale;
        const dh = 50 / pageScale;
        const newObj: Omit<TextObject, 'zIndex'> = {
          id: crypto.randomUUID(),
          type: 'text',
          pageIndex: currentPage - 1,
          x: pdfPt.x, y: pdfPt.y - dh, width: dw, height: dh,
          text: 'Text',
          fontFamily: 'Helvetica',
          fontSize: 14,
          bold: false, italic: false, underline: false,
          color: '#000000', opacity: 1, align: 'left',
        };
        setEditorState((prev) => { pushHistory(prev); return addObject(prev, newObj); });
        setTimeout(() => {
          setEditorState((s) => {
            const id = s.objects[s.objects.length - 1]?.id;
            if (id) { setSelectedId(id); setTextEditId(id); }
            return s;
          });
        }, 0);
        setToolMode('select');
        return;
      }

      if (toolMode === 'sticky') {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        const sx = e.clientX - rect.left;
        const sy = e.clientY - rect.top;
        const pdfPt = screenToPdfPoint(sx, sy, pageScale, pageDims.heightPt);
        const noteW = 120 / pageScale;
        const noteH = 80 / pageScale;
        const newNote: Omit<StickyNoteObject, 'zIndex'> = {
          id: crypto.randomUUID(),
          type: 'sticky',
          pageIndex: currentPage - 1,
          x: pdfPt.x, y: pdfPt.y - noteH,
          width: noteW, height: noteH,
          comment: '',
          color: '#fef08a',
          opacity: 0.95,
        };
        setEditorState((prev) => { pushHistory(prev); return addObject(prev, newNote); });
        setTimeout(() => {
          setEditorState((s) => {
            const id = s.objects[s.objects.length - 1]?.id;
            if (id) { setSelectedId(id); setAnnotEditId(id); }
            return s;
          });
        }, 0);
        setToolMode('select');
        return;
      }

      if (toolMode === 'callout') {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        const sx = e.clientX - rect.left;
        const sy = e.clientY - rect.top;
        const pdfPt = screenToPdfPoint(sx, sy, pageScale, pageDims.heightPt);
        const bubbleW = 150 / pageScale;
        const bubbleH = 60 / pageScale;
        const newCallout: Omit<CalloutObject, 'zIndex'> = {
          id: crypto.randomUUID(),
          type: 'callout',
          pageIndex: currentPage - 1,
          x: pdfPt.x, y: pdfPt.y,
          width: bubbleW, height: bubbleH,
          tipX: pdfPt.x - 20 / pageScale, tipY: pdfPt.y - 20 / pageScale,
          text: '',
          fontSize: 11,
          color: '#111111',
          bgColor: '#ffffff',
          borderColor: '#2563eb',
          borderWidth: 1.5,
          opacity: 1,
        };
        setEditorState((prev) => { pushHistory(prev); return addObject(prev, newCallout); });
        setTimeout(() => {
          setEditorState((s) => {
            const id = s.objects[s.objects.length - 1]?.id;
            if (id) { setSelectedId(id); setAnnotEditId(id); }
            return s;
          });
        }, 0);
        setToolMode('select');
        return;
      }

      if (isDrawingTool(toolMode)) {
        e.preventDefault();
        const { x, y } = getCanvasRelative(e);
        setDrawState({ startX: x, startY: y, currentX: x, currentY: y });
        (e.target as Element).setPointerCapture(e.pointerId);
      }

      if (toolMode === 'pen') {
        e.preventDefault();
        const canvas = canvasRef.current;
        if (!canvas) return;
        (e.target as Element).setPointerCapture(e.pointerId);
        const { x, y } = getCanvasRelative(e);
        const pdfPt = screenToPdfPoint(x, y, pageScale, pageDims.heightPt);
        strokePointsRef.current = [{ x: pdfPt.x, y: pdfPt.y }];

        // Initialise the stroke canvas overlay to match the page canvas
        const sc = strokeCanvasRef.current;
        if (sc) {
          sc.width = canvas.width;
          sc.height = canvas.height;
          const ctx = sc.getContext('2d');
          if (ctx) {
            ctx.clearRect(0, 0, sc.width, sc.height);
            ctx.strokeStyle = penColor;
            ctx.lineWidth = penWidth;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.beginPath();
            ctx.moveTo(x, y);
          }
        }
      }
    },
    [toolMode, pageScale, pageDims, currentPage, pushHistory],
  );

  const handleCanvasPointerMove = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (drawState && isDrawingTool(toolMode)) {
        const { x, y } = getCanvasRelative(e);
        setDrawState((ds) => ds ? { ...ds, currentX: x, currentY: y } : null);
      }

      if (toolMode === 'pen' && strokePointsRef.current.length > 0) {
        const { x, y } = getCanvasRelative(e);
        const pdfPt = screenToPdfPoint(x, y, pageScale, pageDims.heightPt);
        strokePointsRef.current.push({ x: pdfPt.x, y: pdfPt.y });

        const sc = strokeCanvasRef.current;
        if (sc) {
          const ctx = sc.getContext('2d');
          if (ctx) {
            ctx.lineTo(x, y);
            ctx.stroke();
          }
        }
      }
    },
    [drawState, toolMode, pageScale, pageDims],
  );

  const handleCanvasPointerUp = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      (e.target as Element).releasePointerCapture(e.pointerId);

      // Pen: finalize stroke
      if (toolMode === 'pen') {
        const pts = strokePointsRef.current;
        strokePointsRef.current = [];

        // Clear stroke canvas overlay
        const sc = strokeCanvasRef.current;
        if (sc) {
          const ctx = sc.getContext('2d');
          if (ctx) ctx.clearRect(0, 0, sc.width, sc.height);
        }

        if (pts.length < 2) return;

        // Simplify: keep every Nth point to limit point count, always keep last
        const MAX_PTS = 300;
        let simplified = pts;
        if (pts.length > MAX_PTS) {
          const step = Math.ceil(pts.length / MAX_PTS);
          simplified = pts.filter((_, i) => i % step === 0);
          if (simplified[simplified.length - 1] !== pts[pts.length - 1]) {
            simplified.push(pts[pts.length - 1]);
          }
        }

        const newObj: Omit<StrokeObject, 'zIndex'> = {
          id: crypto.randomUUID(),
          type: 'stroke',
          pageIndex: currentPage - 1,
          points: simplified,
          color: penColor,
          width: penWidth,
          opacity: 1,
        };
        setEditorState((prev) => {
          pushHistory(prev);
          const next = addObject(prev, newObj);
          setSelectedId(next.objects[next.objects.length - 1].id);
          return next;
        });
        return;
      }

      if (!drawState || !isDrawingTool(toolMode)) return;

      const { startX, startY, currentX, currentY } = drawState;
      setDrawState(null);

      const minDist = 5;
      const dist = Math.hypot(currentX - startX, currentY - startY);
      if (dist < minDist) return; // ignore tiny draws

      const p1 = screenToPdfPoint(startX, startY, pageScale, pageDims.heightPt);
      const p2 = screenToPdfPoint(currentX, currentY, pageScale, pageDims.heightPt);

      let newObj: Omit<EditorObject, 'zIndex'>;

      if (toolMode === 'line') {
        newObj = { id: crypto.randomUUID(), type: 'line', pageIndex: currentPage - 1, x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y, color: '#000000', width: 2, opacity: 1 } as Omit<LineObject, 'zIndex'>;
      } else if (toolMode === 'arrow') {
        newObj = { id: crypto.randomUUID(), type: 'arrow', pageIndex: currentPage - 1, x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y, color: '#000000', width: 2, opacity: 1, arrowhead: 'filled' } as Omit<ArrowObject, 'zIndex'>;
      } else if (toolMode === 'ellipse') {
        const cx = (p1.x + p2.x) / 2;
        const cy = (p1.y + p2.y) / 2;
        const rx = Math.abs(p2.x - p1.x) / 2;
        const ry = Math.abs(p2.y - p1.y) / 2;
        newObj = { id: crypto.randomUUID(), type: 'ellipse', pageIndex: currentPage - 1, cx, cy, rx: Math.max(5, rx), ry: Math.max(5, ry), borderColor: '#000000', fillColor: '#ffffff', fillOpacity: 0, borderWidth: 2, borderOpacity: 1, opacity: 1 } as Omit<EllipseObject, 'zIndex'>;
      } else if (toolMode === 'whiteout') {
        const x = Math.min(p1.x, p2.x);
        const y = Math.min(p1.y, p2.y);
        const w = Math.abs(p2.x - p1.x);
        const h = Math.abs(p2.y - p1.y);
        newObj = { id: crypto.randomUUID(), type: 'whiteout', pageIndex: currentPage - 1, x, y, width: Math.max(5, w), height: Math.max(5, h), fillColor: '#ffffff', fillOpacity: 1, borderColor: '#cccccc', borderWidth: 0, opacity: 1 } as Omit<WhiteoutObject, 'zIndex'>;
      } else {
        // rect or annotations
        const x = Math.min(p1.x, p2.x);
        const y = Math.min(p1.y, p2.y);
        const w = Math.abs(p2.x - p1.x);
        const h = Math.abs(p2.y - p1.y);

        if (toolMode === 'rect') {
          newObj = { id: crypto.randomUUID(), type: 'rect', pageIndex: currentPage - 1, x, y, width: Math.max(5, w), height: Math.max(5, h), rotation: 0, borderColor: '#000000', fillColor: '#ffffff', fillOpacity: 0, borderWidth: 2, borderOpacity: 1, opacity: 1 } as Omit<RectObject, 'zIndex'>;
        } else {
          const annType = toolMode as AnnotationType;
          newObj = {
            id: crypto.randomUUID(),
            type: annType,
            pageIndex: currentPage - 1,
            x, y, width: Math.max(5, w), height: Math.max(5, h),
            color: DEFAULT_ANNOTATION_COLORS[annType],
            opacity: annType === 'highlight' ? 0.4 : 1,
            lineWidth: 2,
          } as Omit<AnnotationObject, 'zIndex'>;
        }
      }

      setEditorState((prev) => {
        pushHistory(prev);
        const next = addObject(prev, newObj);
        setSelectedId(next.objects[next.objects.length - 1].id);
        return next;
      });
      setToolMode('select');
    },
    [drawState, toolMode, pageScale, pageDims, currentPage, pushHistory, penColor, penWidth],
  );

  // ─── Image add ────────────────────────────────────────────────────────────────

  const handleImageFiles = useCallback(async (files: FileList | File[]) => {
    const arr = Array.from(files).slice(0, 5);
    for (const file of arr) {
      const decoded = await decodeImageFile(file).catch(() => null);
      if (!decoded) continue;
      const { objectUrl, mimeType, naturalWidth, naturalHeight, embedBytes } = decoded;
      const dw = pageDims.widthPt * 0.4;
      const aspect = naturalWidth / naturalHeight;
      const dh = dw / aspect;
      const newObj: Omit<ImageObject, 'zIndex'> = {
        id: crypto.randomUUID(),
        type: 'image',
        pageIndex: currentPage - 1,
        x: pageDims.widthPt / 2 - dw / 2,
        y: pageDims.heightPt / 2 - dh / 2,
        width: dw, height: dh,
        naturalWidth, naturalHeight,
        rotation: 0, objectUrl, mimeType, embedBytes, opacity: 1,
      };
      setEditorState((prev) => {
        pushHistory(prev);
        const next = addObject(prev, newObj);
        setSelectedId(next.objects[next.objects.length - 1].id);
        return next;
      });
    }
    setToolMode('select');
  }, [pageDims, currentPage, pushHistory]);

  // ─── Keyboard shortcuts ────────────────────────────────────────────────────────

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const ctrl = e.ctrlKey || e.metaKey;
      if (ctrl && e.key === 'z' && !e.shiftKey) { e.preventDefault(); undo(); }
      if (ctrl && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) { e.preventDefault(); redo(); }
      if (ctrl && e.key === 'd' && selectedId) {
        e.preventDefault();
        setEditorState((s) => { pushHistory(s); return duplicateObject(s, selectedId); });
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [undo, redo, selectedId, pushHistory]);

  // ─── Save ─────────────────────────────────────────────────────────────────────

  const handleSave = useCallback(async () => {
    if (!pdfFile) return;
    setSaveState('saving'); setSaveResult(null);
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;
    const { buildEditedPdf } = await import('@/lib/pdf/editPdf');
    const result = await buildEditedPdf(pdfFile, editorState, ac.signal);
    setSaveResult(result);
    setSaveState(result.success ? 'done' : 'error');
  }, [pdfFile, editorState]);

  const handleReset = useCallback(() => {
    revokePdfUrl();
    pdfBytesRef.current = null;
    setPdfFile(null); setPdfUrl(null); setPageInfos([]);
    setCurrentPage(1); setEditorState(createEditorState());
    setHistory([]); setFuture([]);
    setSelectedId(null); setSaveState('idle'); setSaveResult(null); setLoadError(null);
  }, [revokePdfUrl]);

  const handleReplaceImage = useCallback(async (id: string, file: File) => {
    const decoded = await decodeImageFile(file).catch(() => null);
    if (!decoded) return;
    const { objectUrl, mimeType, naturalWidth, naturalHeight, embedBytes } = decoded;
    const cur = editorState.objects.find((o) => o.id === id) as ImageObject | undefined;
    setEditorState((s) => { pushHistory(s); return updateObject(s, id, { objectUrl, mimeType, naturalWidth, naturalHeight, embedBytes, height: (cur?.width ?? 100) / (naturalWidth / naturalHeight) } as Partial<ImageObject>); });
  }, [editorState.objects, pushHistory]);

  const selectedObj = editorState.objects.find((o) => o.id === selectedId) ?? null;
  const pageCount = pageInfos.length || (pdfFile?.pageCount ?? 0);

  // ─── Draw ghost preview ────────────────────────────────────────────────────────

  const drawGhost = drawState && isDrawingTool(toolMode) ? (() => {
    const { startX, startY, currentX, currentY } = drawState;
    const left = Math.min(startX, currentX);
    const top = Math.min(startY, currentY);
    const w = Math.abs(currentX - startX);
    const h = Math.abs(currentY - startY);
    if (toolMode === 'line' || toolMode === 'arrow') {
      // SVG line ghost
      const svgW = Math.max(w + 20, 20);
      const svgH = Math.max(h + 20, 20);
      const sx = startX - Math.min(startX, currentX) + 10;
      const sy = startY - Math.min(startY, currentY) + 10;
      const ex = currentX - Math.min(startX, currentX) + 10;
      const ey = currentY - Math.min(startY, currentY) + 10;
      return (
        <svg
          style={{ position: 'absolute', left: Math.min(startX, currentX) - 10, top: Math.min(startY, currentY) - 10, width: svgW, height: svgH, pointerEvents: 'none' }}
          aria-hidden="true"
        >
          <line x1={sx} y1={sy} x2={ex} y2={ey} stroke="#2563eb" strokeWidth={2} strokeDasharray="4,3" />
        </svg>
      );
    }
    return (
      <div
        aria-hidden="true"
        style={{
          position: 'absolute', left, top, width: w, height: h,
          border: '2px dashed #2563eb',
          background: toolMode === 'highlight' ? 'rgba(255,255,0,0.3)' : 'rgba(37,99,235,0.05)',
          borderRadius: toolMode === 'ellipse' ? '50%' : 0,
          pointerEvents: 'none',
        }}
      />
    );
  })() : null;

  // ─── Render ───────────────────────────────────────────────────────────────────

  if (!pdfFile) {
    return (
      <PdfToolLayout title="PDF Editor" description="Add text, images, shapes, and annotations to any PDF. Everything stays in your browser.">
        <PdfDropzone onFilesSelected={handleFileSelected} />
        <p className="mt-4 text-xs text-center text-gray-400 dark:text-gray-600">
          Your PDF and any images are processed locally. They are never uploaded to our servers.
        </p>
      </PdfToolLayout>
    );
  }

  if (saveState === 'done' && saveResult?.success) {
    return (
      <PdfToolLayout title="PDF Editor" description="">
        <div className="rounded-xl border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/20 p-6 text-center space-y-4">
          <div className="text-green-600 dark:text-green-400 font-medium" role="status">✓ PDF edited successfully</div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {saveResult.pageCount} page{saveResult.pageCount !== 1 ? 's' : ''} · {formatFileSize(saveResult.sizeBytes)}
          </p>
          <div className="flex justify-center gap-3 flex-wrap">
            <PdfDownload blob={saveResult.blob} filename={saveResult.filename} />
            <button onClick={handleReset} className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">Edit another PDF</button>
          </div>
        </div>
      </PdfToolLayout>
    );
  }

  const toolBtn = (mode: ToolMode, label: string, title?: string) => (
    <button
      onClick={() => setToolMode(toolMode === mode ? 'select' : mode)}
      className={`px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${toolMode === mode ? 'bg-blue-600 text-white' : 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
      aria-pressed={toolMode === mode}
      title={title}
    >{label}</button>
  );

  return (
    <PdfToolLayout title="PDF Editor" description="Add text, images, shapes, and annotations. Nothing leaves your browser.">
      {/* Two-column layout: left = toolbar + canvas, right = sidebar */}
      <div className="pdf-editor-shell flex flex-col gap-4 lg:flex-row lg:items-start">
        {/* Left column */}
        <div className="pdf-editor-main flex-1 min-w-0 space-y-3">

          {/* Toolbar — two rows: tools top, actions bottom */}
          <div className="pdf-editor-toolbar rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 overflow-hidden shadow-sm">
            {/* Row 1: tool groups */}
            <div className="flex flex-wrap items-center gap-1 p-2 border-b border-gray-100 dark:border-gray-800">
              {toolBtn('select', 'Select')}
              <div className="h-4 w-px bg-gray-200 dark:bg-gray-700 mx-0.5" />
              {toolBtn('text', 'Text')}
              <button onClick={() => imageInputRef.current?.click()} className="px-2.5 py-1.5 rounded-lg text-xs font-medium border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800" title="Add image">Image</button>
              <input ref={imageInputRef} type="file" accept="image/jpeg,image/jpg,image/png,image/webp" multiple className="sr-only" aria-label="Select image files" onChange={(e) => e.target.files && handleImageFiles(e.target.files)} />
              <div className="h-4 w-px bg-gray-200 dark:bg-gray-700 mx-0.5" />
              {toolBtn('rect', 'Rect')}
              {toolBtn('ellipse', 'Ellipse')}
              {toolBtn('line', 'Line')}
              {toolBtn('arrow', 'Arrow')}
              <div className="h-4 w-px bg-gray-200 dark:bg-gray-700 mx-0.5" />
              {toolBtn('highlight', 'Highlight')}
              {toolBtn('underline', 'Underline')}
              {toolBtn('strikethrough', 'Strike')}
              <div className="h-4 w-px bg-gray-200 dark:bg-gray-700 mx-0.5" />
              {toolBtn('pen', 'Draw')}
              <input type="color" value={penColor} onChange={(e) => setPenColor(e.target.value)} className="w-6 h-6 p-0.5 rounded border border-gray-300 cursor-pointer" aria-label="Pen color" title="Pen color" />
              <input type="number" value={penWidth} onChange={(e) => setPenWidth(Math.max(1, Math.min(40, Number(e.target.value))))} min={1} max={40} className="w-9 rounded border border-gray-300 dark:border-gray-600 px-1 py-0.5 text-xs bg-white dark:bg-gray-900" aria-label="Pen width" title="Pen width" />
              <div className="h-4 w-px bg-gray-200 dark:bg-gray-700 mx-0.5" />
              {toolBtn('whiteout', 'Whiteout')}
              {toolBtn('sticky', 'Note')}
              {toolBtn('callout', 'Callout')}
            </div>
            {/* Row 2: undo/redo + zoom + actions */}
            <div className="flex items-center gap-1.5 px-2 py-1.5">
              <button onClick={undo} disabled={history.length === 0} className="px-2 py-1 rounded text-xs border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800" aria-label="Undo" title="Undo (Ctrl+Z)">↩ Undo</button>
              <button onClick={redo} disabled={future.length === 0} className="px-2 py-1 rounded text-xs border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800" aria-label="Redo" title="Redo (Ctrl+Y)">↪ Redo</button>
              <div className="h-4 w-px bg-gray-200 dark:bg-gray-700 mx-0.5" />
              <button onClick={() => setZoom((z) => Math.max(0.5, parseFloat((z - 0.25).toFixed(2))))} className="px-2 py-1 rounded text-xs border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800" aria-label="Zoom out">−</button>
              <span className="text-xs text-gray-500 dark:text-gray-400 w-10 text-center tabular-nums select-none">{Math.round(zoom * 100)}%</span>
              <button onClick={() => setZoom((z) => Math.min(3, parseFloat((z + 0.25).toFixed(2))))} className="px-2 py-1 rounded text-xs border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800" aria-label="Zoom in">+</button>
              <button onClick={() => setZoom(1)} className="px-2 py-1 rounded text-xs border border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800" aria-label="Reset zoom">Fit</button>
              <div className="ml-auto flex items-center gap-1.5">
                <button onClick={handleReset} className="px-3 py-1 rounded text-xs border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800">Close</button>
                <button
                  onClick={handleSave}
                  disabled={saveState === 'saving' || editorState.objects.length === 0}
                  className="px-4 py-1 rounded text-xs font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {saveState === 'saving' ? 'Generating…' : 'Download PDF'}
                </button>
              </div>
            </div>
          </div>

          {/* Mode hint */}
          {toolMode === 'select' && pdfTextItems.length > 0 && (
            <p className="text-xs text-gray-500 dark:text-gray-400 px-1" role="status">
              Click existing text to edit it inline. Double-click added text boxes to edit.
            </p>
          )}
          {toolMode !== 'select' && (
            <p className="text-xs text-blue-600 dark:text-blue-400 px-1" role="status">
              {toolMode === 'text' ? 'Click to place a text box.'
              : toolMode === 'pen' ? 'Draw on the page. Release to finish.'
              : toolMode === 'sticky' ? 'Click to place a sticky note.'
              : toolMode === 'callout' ? 'Click to place a text callout.'
              : `Draw on the page to add ${toolMode}.`}
            </p>
          )}
          {toolMode === 'whiteout' && (
            <p className="text-xs text-amber-700 dark:text-amber-400 px-1 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg py-1.5" role="note">
              Whiteout visually covers content. For permanent removal of sensitive information, use Redact PDF.
            </p>
          )}

          {/* Error */}
          {(loadError || (saveState === 'error' && saveResult && !saveResult.success)) && (
            <div role="alert" className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20 px-4 py-3 text-sm text-red-700 dark:text-red-400">
              {loadError ?? (saveResult && !saveResult.success ? saveResult.error : '')}
            </div>
          )}

          {/* Page navigation */}
          {pageCount > 1 && (
            <div className="flex items-center gap-2 justify-center" role="navigation" aria-label="Page navigation">
              <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage <= 1} className="px-3 py-1 rounded-lg border border-gray-300 dark:border-gray-600 text-sm disabled:opacity-40" aria-label="Previous page">←</button>
              <span className="text-sm text-gray-600 dark:text-gray-400" aria-live="polite">Page {currentPage} of {pageCount}</span>
              <button onClick={() => setCurrentPage((p) => Math.min(pageCount, p + 1))} disabled={currentPage >= pageCount} className="px-3 py-1 rounded-lg border border-gray-300 dark:border-gray-600 text-sm disabled:opacity-40" aria-label="Next page">→</button>
            </div>
          )}

          {/* Canvas area */}
          <div className="pdf-editor-canvas relative mx-auto w-fit max-w-full border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden shadow-md bg-white">
            {rendering && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-900/80 z-10">
                <span className="text-sm text-gray-500" role="status">Loading page…</span>
              </div>
            )}
            <canvas
              ref={canvasRef}
              style={{ display: 'block', cursor: toolMode === 'text' ? 'text' : (isDrawingTool(toolMode) || toolMode === 'pen') ? 'crosshair' : 'default', touchAction: (isDrawingTool(toolMode) || toolMode === 'pen') ? 'none' : 'auto' }}
              onPointerDown={handleCanvasPointerDown}
              onPointerMove={handleCanvasPointerMove}
              onPointerUp={handleCanvasPointerUp}
              aria-label={`PDF page ${currentPage}`}
              role="img"
            />

        {/* Shape/annotation previews */}
        {editorState.objects
          .filter((o) => o.pageIndex === currentPage - 1)
          .sort((a, b) => a.zIndex - b.zIndex)
          .map((obj) => {
            if (obj.type === 'image') {
              const img = obj as ImageObject;
              const r = pdfRectToScreen(img.x, img.y, img.width, img.height, pageScale, pageDims.heightPt);
              return (
                <img key={obj.id} src={img.objectUrl} alt="" aria-hidden="true"
                  style={{ position: 'absolute', left: r.left, top: r.top, width: r.width, height: r.height, opacity: img.opacity, transform: `rotate(${img.rotation}deg)`, transformOrigin: 'center', pointerEvents: 'none', objectFit: 'fill' }} />
              );
            }
            if (obj.type === 'text') {
              if (obj.id === textEditId) return null;
              const txt = obj as TextObject;
              const r = pdfRectToScreen(txt.x, txt.y, txt.width, txt.height, pageScale, pageDims.heightPt);
              return (
                <div key={obj.id} aria-hidden="true"
                  style={{ position: 'absolute', left: r.left, top: r.top, width: r.width, height: r.height, opacity: txt.opacity, fontSize: txt.fontSize * pageScale, fontFamily: txt.fontFamily, fontWeight: txt.bold ? 'bold' : 'normal', fontStyle: txt.italic ? 'italic' : 'normal', textDecoration: txt.underline ? 'underline' : 'none', color: txt.color, textAlign: txt.align, pointerEvents: 'none', overflow: 'hidden', whiteSpace: 'pre-wrap', lineHeight: 1.2 }}>
                  {txt.text}
                </div>
              );
            }
            if (obj.type === 'rect') {
              const ro = obj as RectObject;
              const r = pdfRectToScreen(ro.x, ro.y, ro.width, ro.height, pageScale, pageDims.heightPt);
              return (
                <div key={obj.id} aria-hidden="true"
                  style={{ position: 'absolute', left: r.left, top: r.top, width: r.width, height: r.height, opacity: ro.opacity, background: ro.fillOpacity > 0 ? `${ro.fillColor}${Math.round(ro.fillOpacity * 255).toString(16).padStart(2, '0')}` : 'transparent', border: ro.borderWidth > 0 ? `${ro.borderWidth}px solid ${ro.borderColor}` : 'none', transform: `rotate(${ro.rotation}deg)`, transformOrigin: 'center', pointerEvents: 'none', boxSizing: 'border-box' }} />
              );
            }
            if (obj.type === 'ellipse') {
              const ell = obj as EllipseObject;
              const r = pdfRectToScreen(ell.cx - ell.rx, ell.cy - ell.ry, ell.rx * 2, ell.ry * 2, pageScale, pageDims.heightPt);
              return (
                <div key={obj.id} aria-hidden="true"
                  style={{ position: 'absolute', left: r.left, top: r.top, width: r.width, height: r.height, opacity: ell.opacity, background: ell.fillOpacity > 0 ? `${ell.fillColor}${Math.round(ell.fillOpacity * 255).toString(16).padStart(2, '0')}` : 'transparent', border: ell.borderWidth > 0 ? `${ell.borderWidth}px solid ${ell.borderColor}` : 'none', borderRadius: '50%', pointerEvents: 'none', boxSizing: 'border-box' }} />
              );
            }
            if (obj.type === 'line' || obj.type === 'arrow') {
              const lo = obj as LineObject | ArrowObject;
              const p1s = { x: lo.x1 * pageScale, y: (pageDims.heightPt - lo.y1) * pageScale };
              const p2s = { x: lo.x2 * pageScale, y: (pageDims.heightPt - lo.y2) * pageScale };
              const minX = Math.min(p1s.x, p2s.x) - 10;
              const minY = Math.min(p1s.y, p2s.y) - 10;
              const svgW = Math.abs(p2s.x - p1s.x) + 20;
              const svgH = Math.abs(p2s.y - p1s.y) + 20;
              const dx = p1s.x - minX;
              const dy = p1s.y - minY;
              const ex = p2s.x - minX;
              const ey = p2s.y - minY;
              const dxArrow = p2s.x - p1s.x;
              const dyArrow = p2s.y - p1s.y;
              const len = Math.sqrt(dxArrow * dxArrow + dyArrow * dyArrow);
              return (
                <svg key={obj.id} aria-hidden="true"
                  style={{ position: 'absolute', left: minX, top: minY, width: Math.max(svgW, 4), height: Math.max(svgH, 4), pointerEvents: 'none', overflow: 'visible' }}>
                  <line x1={dx} y1={dy} x2={ex} y2={ey} stroke={lo.color} strokeWidth={lo.width} opacity={lo.opacity} />
                  {obj.type === 'arrow' && (lo as ArrowObject).arrowhead !== 'none' && len > 0 && (() => {
                    const ux = dxArrow / len;
                    const uy = dyArrow / len;
                    const sz = Math.max(lo.width * 4, 10);
                    const px = -uy; const py = ux;
                    const b1x = ex - ux * sz + px * sz * 0.4;
                    const b1y = ey - uy * sz + py * sz * 0.4;
                    const b2x = ex - ux * sz - px * sz * 0.4;
                    const b2y = ey - uy * sz - py * sz * 0.4;
                    return (
                      <>
                        <line x1={ex} y1={ey} x2={b1x} y2={b1y} stroke={lo.color} strokeWidth={lo.width} opacity={lo.opacity} />
                        <line x1={ex} y1={ey} x2={b2x} y2={b2y} stroke={lo.color} strokeWidth={lo.width} opacity={lo.opacity} />
                      </>
                    );
                  })()}
                </svg>
              );
            }
            // annotations
            if (obj.type === 'highlight' || obj.type === 'underline' || obj.type === 'strikethrough') {
              const ann = obj as AnnotationObject;
              const r = pdfRectToScreen(ann.x, ann.y, ann.width, ann.height, pageScale, pageDims.heightPt);
              if (ann.type === 'highlight') {
                return <div key={obj.id} aria-hidden="true" style={{ position: 'absolute', left: r.left, top: r.top, width: r.width, height: r.height, background: ann.color, opacity: ann.opacity, pointerEvents: 'none' }} />;
              }
              if (ann.type === 'underline') {
                return <div key={obj.id} aria-hidden="true" style={{ position: 'absolute', left: r.left, top: r.top + r.height - ann.lineWidth, width: r.width, height: ann.lineWidth, background: ann.color, opacity: ann.opacity, pointerEvents: 'none' }} />;
              }
              // strikethrough
              return <div key={obj.id} aria-hidden="true" style={{ position: 'absolute', left: r.left, top: r.top + r.height / 2 - ann.lineWidth / 2, width: r.width, height: ann.lineWidth, background: ann.color, opacity: ann.opacity, pointerEvents: 'none' }} />;
            }
            if (obj.type === 'stroke') {
              const st = obj as StrokeObject;
              if (st.points.length < 2) return null;
              let minPx = Infinity, minPy = Infinity, maxPx = -Infinity, maxPy = -Infinity;
              for (const pt of st.points) {
                const sp = { x: pt.x * pageScale, y: (pageDims.heightPt - pt.y) * pageScale };
                if (sp.x < minPx) minPx = sp.x;
                if (sp.y < minPy) minPy = sp.y;
                if (sp.x > maxPx) maxPx = sp.x;
                if (sp.y > maxPy) maxPy = sp.y;
              }
              const pad = 4;
              const svgLeft = minPx - pad;
              const svgTop = minPy - pad;
              const svgW = maxPx - minPx + pad * 2;
              const svgH = maxPy - minPy + pad * 2;
              const pts = st.points.map((pt) => {
                const sp = { x: pt.x * pageScale - svgLeft, y: (pageDims.heightPt - pt.y) * pageScale - svgTop };
                return `${sp.x},${sp.y}`;
              }).join(' ');
              return (
                <svg key={obj.id} aria-hidden="true" style={{ position: 'absolute', left: svgLeft, top: svgTop, width: Math.max(svgW, 4), height: Math.max(svgH, 4), pointerEvents: 'none', overflow: 'visible' }}>
                  <polyline points={pts} stroke={st.color} strokeWidth={st.width} strokeLinecap="round" strokeLinejoin="round" fill="none" opacity={st.opacity} />
                </svg>
              );
            }
            if (obj.type === 'whiteout') {
              const wo = obj as WhiteoutObject;
              const r = pdfRectToScreen(wo.x, wo.y, wo.width, wo.height, pageScale, pageDims.heightPt);
              return (
                <div key={obj.id} aria-hidden="true"
                  style={{ position: 'absolute', left: r.left, top: r.top, width: r.width, height: r.height, background: wo.fillColor, opacity: wo.fillOpacity * wo.opacity, border: wo.borderWidth > 0 ? `${wo.borderWidth}px solid ${wo.borderColor}` : 'none', pointerEvents: 'none', boxSizing: 'border-box' }} />
              );
            }
            if (obj.type === 'sticky') {
              const sn = obj as StickyNoteObject;
              const r = pdfRectToScreen(sn.x, sn.y, sn.width, sn.height, pageScale, pageDims.heightPt);
              const foldPx = 10;
              return (
                <div key={obj.id} aria-hidden="true"
                  style={{ position: 'absolute', left: r.left, top: r.top, width: r.width, height: r.height, background: sn.color, opacity: sn.opacity, pointerEvents: 'none', boxSizing: 'border-box', borderRadius: 2, overflow: 'hidden', fontSize: Math.max(8, 9 * pageScale), fontFamily: 'Helvetica, sans-serif', color: '#111', padding: '4px 6px', lineHeight: 1.3, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                  {sn.comment || <span style={{ opacity: 0.4, fontStyle: 'italic' }}>Note…</span>}
                  <div aria-hidden="true" style={{ position: 'absolute', top: 0, right: 0, width: foldPx, height: foldPx, background: `linear-gradient(135deg, transparent 50%, rgba(0,0,0,0.15) 50%)` }} />
                </div>
              );
            }
            if (obj.type === 'callout') {
              const co = obj as CalloutObject;
              const r = pdfRectToScreen(co.x, co.y, co.width, co.height, pageScale, pageDims.heightPt);
              const tipS = { x: co.tipX * pageScale, y: (pageDims.heightPt - co.tipY) * pageScale };
              const bubbleCx = r.left + r.width / 2;
              const bubbleCy = r.top + r.height / 2;
              const svgLeft = Math.min(r.left, tipS.x) - 2;
              const svgTop = Math.min(r.top, tipS.y) - 2;
              const svgW = Math.max(r.left + r.width, tipS.x) - svgLeft + 4;
              const svgH = Math.max(r.top + r.height, tipS.y) - svgTop + 4;
              return (
                <div key={obj.id} aria-hidden="true" style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
                  {/* Pointer line */}
                  <svg style={{ position: 'absolute', left: svgLeft, top: svgTop, width: svgW, height: svgH, overflow: 'visible', pointerEvents: 'none' }}>
                    <line x1={bubbleCx - svgLeft} y1={bubbleCy - svgTop} x2={tipS.x - svgLeft} y2={tipS.y - svgTop} stroke={co.borderColor} strokeWidth={Math.max(co.borderWidth, 1)} opacity={co.opacity} />
                  </svg>
                  {/* Bubble */}
                  <div style={{ position: 'absolute', left: r.left, top: r.top, width: r.width, height: r.height, background: co.bgColor, border: `${co.borderWidth}px solid ${co.borderColor}`, borderRadius: 6, opacity: co.opacity, boxSizing: 'border-box', fontSize: Math.max(8, co.fontSize * pageScale), fontFamily: 'Helvetica, sans-serif', color: co.color, padding: '4px 6px', lineHeight: 1.3, overflow: 'hidden', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                    {co.text || <span style={{ opacity: 0.4, fontStyle: 'italic' }}>Callout…</span>}
                  </div>
                </div>
              );
            }
            return null;
          })}

        {/* Pen stroke canvas overlay — drawn into by pointer events, never triggers React re-renders per point */}
        <canvas
          ref={strokeCanvasRef}
          aria-hidden="true"
          style={{ position: 'absolute', left: 0, top: 0, pointerEvents: 'none', display: toolMode === 'pen' ? 'block' : 'none' }}
        />

        {/* Drawing ghost */}
        {drawGhost}

        {/* Editor handles overlay */}
        {canvasSize.width > 0 && (
          <EditorOverlay
            objects={editorState.objects}
            pageIndex={currentPage - 1}
            pageWidthPt={pageDims.widthPt}
            pageHeightPt={pageDims.heightPt}
            scale={pageScale}
            selectedId={textEditId ? null : selectedId}
            onSelect={setSelectedId}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
            onTextEdit={(id) => setTextEditId(id)}
            onAnnotEdit={(id) => setAnnotEditId(id)}
            canvasWidth={canvasSize.width}
            canvasHeight={canvasSize.height}
          />
        )}

        {/* Existing PDF text hit targets are active only while editing. */}
        {toolMode === 'select' && pdfTextItems.map((item) => {
          const r = pdfRectToScreen(item.x, item.y, item.width, item.fontSize, pageScale, pageDims.heightPt);
          const isActive = activePdfEdit?.id === item.id;
          if (isActive) {
            return (
              <PdfTextInlineEditor
                key={item.id}
                item={item}
                pageScale={pageScale}
                pageDims={pageDims}
                onCommit={(text, widthPt, heightPt) => handleCommitPdfEdit(item, text, widthPt, heightPt)}
                onCancel={() => setActivePdfEdit(null)}
              />
            );
          }
          return (
            <div
              key={item.id}
              title="Click to edit this text"
              style={{
                position: 'absolute',
                left: r.left,
                top: r.top,
                width: Math.max(r.width, 3),
                height: Math.max(r.height, 5),
                cursor: 'text',
                background: 'transparent',
                border: hoveredTextId === item.id ? '1px solid rgba(37,99,235,.85)' : '1px solid transparent',
                borderRadius: 2,
                zIndex: 5,
                boxSizing: 'border-box',
                transition: 'border-color .12s ease, background-color .12s ease',
              }}
              onMouseEnter={() => setHoveredTextId(item.id)}
              onMouseLeave={() => setHoveredTextId(null)}
              onClick={() => { setHoveredTextId(null); handleEditPdfText(item); }}
            />
          );
        })}

        {/* Inline text editor for added TextObjects */}
        {textEditId && (() => {
          const obj = editorState.objects.find((o) => o.id === textEditId);
          if (!obj || obj.type !== 'text') return null;
          return (
            <InlineTextEditor
              obj={obj as TextObject}
              pageScale={pageScale}
              pageDims={pageDims}
              onCommit={(text) => {
                setEditorState((s) => { pushHistory(s); return updateObject(s, textEditId, { text }); });
              }}
              onClose={() => setTextEditId(null)}
            />
          );
        })()}
      </div>

          {/* Object count summary */}
          {editorState.objects.length > 0 && (
            <p className="text-xs text-gray-500 dark:text-gray-400 px-1">
              {editorState.objects.filter((o) => o.type === 'text').length} text,{' '}
              {editorState.objects.filter((o) => o.type === 'image').length} image,{' '}
              {editorState.objects.filter((o) => o.type === 'rect' || o.type === 'ellipse' || o.type === 'line' || o.type === 'arrow').length} shape,{' '}
              {editorState.objects.filter((o) => o.type === 'highlight' || o.type === 'underline' || o.type === 'strikethrough').length} mark,{' '}
              {editorState.objects.filter((o) => o.type === 'stroke').length} stroke,{' '}
              {editorState.objects.filter((o) => o.type === 'whiteout').length} whiteout,{' '}
              {editorState.objects.filter((o) => o.type === 'sticky' || o.type === 'callout').length} note
              {' '}across {new Set(editorState.objects.map((o) => o.pageIndex)).size} page{new Set(editorState.objects.map((o) => o.pageIndex)).size !== 1 ? 's' : ''}
            </p>
          )}

        </div>{/* end left column */}

        {/* Right sidebar */}
        <div className="pdf-editor-sidebar w-full lg:w-72 lg:shrink-0 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 overflow-hidden shadow-sm lg:sticky lg:top-4" style={{ minHeight: 240 }}>
          <SidebarPanel
            obj={selectedObj}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
            onDuplicate={(id) => setEditorState((s) => { pushHistory(s); return duplicateObject(s, id); })}
            onBringForward={(id) => setEditorState((s) => bringForward(s, id))}
            onSendBackward={(id) => setEditorState((s) => sendBackward(s, id))}
            onBringToFront={(id) => setEditorState((s) => bringToFront(s, id))}
            onSendToBack={(id) => setEditorState((s) => sendToBack(s, id))}
            onEditText={(id) => setTextEditId(id)}
            onEditNote={(id) => setAnnotEditId(id)}
            onReplaceImage={handleReplaceImage}
          />
        </div>
      </div>{/* end two-column flex */}

      {/* Annotation edit modal (sticky/callout) */}
      {annotEditId && (() => {
        const obj = editorState.objects.find((o) => o.id === annotEditId);
        if (!obj || (obj.type !== 'sticky' && obj.type !== 'callout')) { setAnnotEditId(null); return null; }
        return (
          <AnnotEditModal
            obj={obj as StickyNoteObject | CalloutObject}
            onSave={(patch) => {
              setEditorState((s) => { pushHistory(s); return updateObject(s, annotEditId, patch as Partial<EditorObject>); });
            }}
            onClose={() => setAnnotEditId(null)}
          />
        );
      })()}

      {/* Annotation panel */}
      {showAnnotPanel && (() => {
        const annotations = editorState.objects.filter((o) => o.type === 'sticky' || o.type === 'callout');
        return (
          <div className="rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/20 p-3 space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">Annotations ({annotations.length})</h3>
              <button onClick={() => setShowAnnotPanel(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-xs px-1">✕</button>
            </div>
            {annotations.length === 0 && (
              <p className="text-xs text-gray-500 dark:text-gray-400">No annotations yet. Use Note or Callout tools to add comments.</p>
            )}
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {annotations.map((obj) => {
                const sn = obj as StickyNoteObject;
                const co = obj as CalloutObject;
                const isSticky = obj.type === 'sticky';
                const text = isSticky ? sn.comment : co.text;
                const preview = text.slice(0, 60) + (text.length > 60 ? '…' : '');
                const pageNum = obj.pageIndex + 1;
                return (
                  <div key={obj.id}
                    className={`flex items-start gap-2 rounded-lg border px-2 py-1.5 cursor-pointer text-xs ${selectedId === obj.id ? 'border-blue-400 bg-blue-50 dark:bg-blue-950/30' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                    onClick={() => { setCurrentPage(pageNum); setTimeout(() => setSelectedId(obj.id), 0); }}
                  >
                    <span className="shrink-0 mt-0.5">{isSticky ? '📝' : '💬'}</span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-700 dark:text-gray-300 capitalize">{obj.type === 'sticky' ? 'Note' : 'Callout'}</span>
                        <span className="text-gray-400 dark:text-gray-500">p.{pageNum}</span>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 truncate">{preview || <span className="italic opacity-50">empty</span>}</p>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <button
                        onClick={(e) => { e.stopPropagation(); setCurrentPage(pageNum); setTimeout(() => { setSelectedId(obj.id); setAnnotEditId(obj.id); }, 0); }}
                        className="rounded px-1 py-0.5 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40"
                        aria-label="Edit annotation"
                      >Edit</button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(obj.id); }}
                        className="rounded px-1 py-0.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
                        aria-label="Delete annotation"
                      >Del</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}
    </PdfToolLayout>
  );
}
