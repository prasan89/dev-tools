'use client';

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

const PREVIEW_MAX_W = 760;
const PREVIEW_MAX_H = 900;

async function renderPageToCanvas(
  pdfData: ArrayBuffer,
  pageNumber: number,
  canvas: HTMLCanvasElement,
): Promise<{ widthPt: number; heightPt: number; rotation: number; scale: number }> {
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
  const scale = Math.min(PREVIEW_MAX_W / widthPt, PREVIEW_MAX_H / heightPt, 2);
  const viewport = page.getViewport({ scale, rotation });
  canvas.width = Math.floor(viewport.width);
  canvas.height = Math.floor(viewport.height);
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    await page.render({ canvas, canvasContext: ctx, viewport }).promise;
  }
  page.cleanup();
  doc.cleanup();
  return { widthPt, heightPt, rotation, scale };
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
    // pdfjs returns Y from bottom; item.height is the glyph height
    const itemH = (item as { height?: number }).height ?? fontSize;
    const y = t[5] - itemH; // bottom of bounding box in PDF coords
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

// ─── Text edit modal ──────────────────────────────────────────────────────────

function TextEditModal({
  obj, onSave, onClose,
}: { obj: TextObject; onSave: (p: Partial<TextObject>) => void; onClose: () => void }) {
  const [text, setText] = useState(obj.text);
  const [fontSize, setFontSize] = useState(obj.fontSize);
  const [fontFamily, setFontFamily] = useState<FontFamily>(obj.fontFamily);
  const [bold, setBold] = useState(obj.bold);
  const [italic, setItalic] = useState(obj.italic);
  const [underline, setUnderline] = useState(obj.underline);
  const [color, setColor] = useState(obj.color);
  const [align, setAlign] = useState<TextAlign>(obj.align);
  const [opacity, setOpacity] = useState(obj.opacity);
  const taRef = useRef<HTMLTextAreaElement>(null);
  useEffect(() => { taRef.current?.focus(); }, []);

  return (
    <div role="dialog" aria-modal="true" aria-label="Edit text"
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background: 'white', borderRadius: 12, padding: '1.5rem', width: '100%', maxWidth: 480, display: 'flex', flexDirection: 'column', gap: '0.75rem', boxShadow: '0 25px 50px rgba(0,0,0,0.3)' }}>
        <h2 className="text-base font-semibold text-gray-900">Edit Text</h2>
        <textarea ref={taRef} value={text} onChange={(e) => setText(e.target.value)} rows={4}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Text content" />
        <div className="flex flex-wrap gap-2 items-center">
          <select value={fontFamily} onChange={(e) => setFontFamily(e.target.value as FontFamily)} className="rounded border border-gray-300 px-2 py-1 text-sm" aria-label="Font family">
            <option value="Helvetica">Helvetica</option>
            <option value="Times New Roman">Times New Roman</option>
            <option value="Courier">Courier</option>
          </select>
          <div className="flex items-center gap-1">
            <label className="text-xs text-gray-600">Size:</label>
            <input type="number" value={fontSize} onChange={(e) => setFontSize(Math.max(6, Math.min(200, Number(e.target.value))))} min={6} max={200} className="w-16 rounded border border-gray-300 px-2 py-1 text-sm" aria-label="Font size" />
          </div>
          <button onClick={() => setBold(!bold)} className={`px-2 py-1 rounded border text-sm font-bold ${bold ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 text-gray-700'}`} aria-pressed={bold}>B</button>
          <button onClick={() => setItalic(!italic)} className={`px-2 py-1 rounded border text-sm italic ${italic ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 text-gray-700'}`} aria-pressed={italic}>I</button>
          <button onClick={() => setUnderline(!underline)} className={`px-2 py-1 rounded border text-sm underline ${underline ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 text-gray-700'}`} aria-pressed={underline}>U</button>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          {(['left', 'center', 'right'] as TextAlign[]).map((a) => (
            <button key={a} onClick={() => setAlign(a)} className={`px-2 py-1 rounded border text-xs ${align === a ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 text-gray-600'}`} aria-pressed={align === a}>{a.charAt(0).toUpperCase() + a.slice(1)}</button>
          ))}
          <div className="flex items-center gap-1">
            <label className="text-xs text-gray-600">Color:</label>
            <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-8 h-7 rounded border border-gray-300 p-0.5 cursor-pointer" aria-label="Text color" />
          </div>
          <div className="flex items-center gap-1">
            <label className="text-xs text-gray-600">Opacity:</label>
            <input type="range" value={Math.round(opacity * 100)} onChange={(e) => setOpacity(Number(e.target.value) / 100)} min={10} max={100} className="w-20" />
            <span className="text-xs text-gray-500">{Math.round(opacity * 100)}%</span>
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-1">
          <button onClick={onClose} className="px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-50">Cancel</button>
          <button onClick={() => { onSave({ text, fontSize, fontFamily, bold, italic, underline, color, align, opacity }); onClose(); }}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700">Apply</button>
        </div>
      </div>
    </div>
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

// ─── Contextual style panel for selected object ────────────────────────────────

function StylePanel({
  obj,
  onUpdate,
}: {
  obj: EditorObject;
  onUpdate: (id: string, patch: Partial<EditorObject>) => void;
}) {
  if (obj.type === 'rect') {
    const r = obj as RectObject;
    return (
      <div className="flex flex-wrap gap-2 items-center px-1 py-1 text-xs">
        <span className="text-gray-500 font-medium">Rectangle:</span>
        <label className="flex items-center gap-1">Border <input type="color" value={r.borderColor} onChange={(e) => onUpdate(r.id, { borderColor: e.target.value } as Partial<RectObject>)} className="w-7 h-6 p-0.5 rounded border border-gray-300 cursor-pointer" /></label>
        <label className="flex items-center gap-1">Fill <input type="color" value={r.fillColor} onChange={(e) => onUpdate(r.id, { fillColor: e.target.value } as Partial<RectObject>)} className="w-7 h-6 p-0.5 rounded border border-gray-300 cursor-pointer" /></label>
        <label className="flex items-center gap-1">Fill opacity
          <input type="range" value={Math.round(r.fillOpacity * 100)} onChange={(e) => onUpdate(r.id, { fillOpacity: Number(e.target.value) / 100 } as Partial<RectObject>)} min={0} max={100} className="w-16" />
        </label>
        <label className="flex items-center gap-1">Border W
          <input type="number" value={r.borderWidth} onChange={(e) => onUpdate(r.id, { borderWidth: Math.max(0, Number(e.target.value)) } as Partial<RectObject>)} min={0} max={20} className="w-12 rounded border border-gray-300 px-1 py-0.5" />
        </label>
        <label className="flex items-center gap-1">Opacity
          <input type="range" value={Math.round(r.opacity * 100)} onChange={(e) => onUpdate(r.id, { opacity: Number(e.target.value) / 100 } as Partial<RectObject>)} min={10} max={100} className="w-16" />
        </label>
      </div>
    );
  }

  if (obj.type === 'ellipse') {
    const ell = obj as EllipseObject;
    return (
      <div className="flex flex-wrap gap-2 items-center px-1 py-1 text-xs">
        <span className="text-gray-500 font-medium">Ellipse:</span>
        <label className="flex items-center gap-1">Border <input type="color" value={ell.borderColor} onChange={(e) => onUpdate(ell.id, { borderColor: e.target.value } as Partial<EllipseObject>)} className="w-7 h-6 p-0.5 rounded border border-gray-300 cursor-pointer" /></label>
        <label className="flex items-center gap-1">Fill <input type="color" value={ell.fillColor} onChange={(e) => onUpdate(ell.id, { fillColor: e.target.value } as Partial<EllipseObject>)} className="w-7 h-6 p-0.5 rounded border border-gray-300 cursor-pointer" /></label>
        <label className="flex items-center gap-1">Fill opacity
          <input type="range" value={Math.round(ell.fillOpacity * 100)} onChange={(e) => onUpdate(ell.id, { fillOpacity: Number(e.target.value) / 100 } as Partial<EllipseObject>)} min={0} max={100} className="w-16" />
        </label>
        <label className="flex items-center gap-1">Border W
          <input type="number" value={ell.borderWidth} onChange={(e) => onUpdate(ell.id, { borderWidth: Math.max(0, Number(e.target.value)) } as Partial<EllipseObject>)} min={0} max={20} className="w-12 rounded border border-gray-300 px-1 py-0.5" />
        </label>
      </div>
    );
  }

  if (obj.type === 'line' || obj.type === 'arrow') {
    const lo = obj as LineObject | ArrowObject;
    return (
      <div className="flex flex-wrap gap-2 items-center px-1 py-1 text-xs">
        <span className="text-gray-500 font-medium">{obj.type === 'arrow' ? 'Arrow' : 'Line'}:</span>
        <label className="flex items-center gap-1">Color <input type="color" value={lo.color} onChange={(e) => onUpdate(lo.id, { color: e.target.value })} className="w-7 h-6 p-0.5 rounded border border-gray-300 cursor-pointer" /></label>
        <label className="flex items-center gap-1">Width
          <input type="number" value={lo.width} onChange={(e) => onUpdate(lo.id, { width: Math.max(1, Number(e.target.value)) })} min={1} max={20} className="w-12 rounded border border-gray-300 px-1 py-0.5" />
        </label>
        <label className="flex items-center gap-1">Opacity
          <input type="range" value={Math.round(lo.opacity * 100)} onChange={(e) => onUpdate(lo.id, { opacity: Number(e.target.value) / 100 })} min={10} max={100} className="w-16" />
        </label>
        {obj.type === 'arrow' && (
          <label className="flex items-center gap-1">Head
            <select value={(lo as ArrowObject).arrowhead} onChange={(e) => onUpdate(lo.id, { arrowhead: e.target.value as ArrowheadStyle } as Partial<ArrowObject>)} className="rounded border border-gray-300 px-1 py-0.5 text-xs">
              <option value="none">None</option>
              <option value="standard">Standard</option>
              <option value="filled">Filled</option>
            </select>
          </label>
        )}
      </div>
    );
  }

  if (obj.type === 'highlight' || obj.type === 'underline' || obj.type === 'strikethrough') {
    const ann = obj as AnnotationObject;
    const label = obj.type === 'highlight' ? 'Highlight' : obj.type === 'underline' ? 'Underline' : 'Strikethrough';
    return (
      <div className="flex flex-wrap gap-2 items-center px-1 py-1 text-xs">
        <span className="text-gray-500 font-medium">{label}:</span>
        <label className="flex items-center gap-1">Color <input type="color" value={ann.color} onChange={(e) => onUpdate(ann.id, { color: e.target.value })} className="w-7 h-6 p-0.5 rounded border border-gray-300 cursor-pointer" /></label>
        <label className="flex items-center gap-1">Opacity
          <input type="range" value={Math.round(ann.opacity * 100)} onChange={(e) => onUpdate(ann.id, { opacity: Number(e.target.value) / 100 })} min={10} max={100} className="w-16" />
        </label>
        {(ann.type === 'underline' || ann.type === 'strikethrough') && (
          <label className="flex items-center gap-1">Line W
            <input type="number" value={ann.lineWidth} onChange={(e) => onUpdate(ann.id, { lineWidth: Math.max(1, Number(e.target.value)) })} min={1} max={10} className="w-12 rounded border border-gray-300 px-1 py-0.5" />
          </label>
        )}
      </div>
    );
  }

  if (obj.type === 'image') {
    const img = obj as ImageObject;
    return (
      <div className="flex flex-wrap gap-2 items-center px-1 py-1 text-xs">
        <span className="text-gray-500 font-medium">Image:</span>
        <label className="flex items-center gap-1">Opacity
          <input type="range" value={Math.round(img.opacity * 100)} onChange={(e) => onUpdate(img.id, { opacity: Number(e.target.value) / 100 })} min={10} max={100} className="w-16" />
        </label>
        <label className="flex items-center gap-1">Rotation
          <input type="number" value={Math.round(img.rotation)} onChange={(e) => onUpdate(img.id, { rotation: ((Number(e.target.value) % 360) + 360) % 360 })} min={0} max={359} step={90} className="w-16 rounded border border-gray-300 px-1 py-0.5" />°
        </label>
      </div>
    );
  }

  if (obj.type === 'stroke') {
    const st = obj as StrokeObject;
    return (
      <div className="flex flex-wrap gap-2 items-center px-1 py-1 text-xs">
        <span className="text-gray-500 font-medium">Stroke:</span>
        <label className="flex items-center gap-1">Color <input type="color" value={st.color} onChange={(e) => onUpdate(st.id, { color: e.target.value })} className="w-7 h-6 p-0.5 rounded border border-gray-300 cursor-pointer" /></label>
        <label className="flex items-center gap-1">Width
          <input type="number" value={st.width} onChange={(e) => onUpdate(st.id, { width: Math.max(1, Number(e.target.value)) })} min={1} max={40} className="w-12 rounded border border-gray-300 px-1 py-0.5" />
        </label>
        <label className="flex items-center gap-1">Opacity
          <input type="range" value={Math.round(st.opacity * 100)} onChange={(e) => onUpdate(st.id, { opacity: Number(e.target.value) / 100 })} min={10} max={100} className="w-16" />
        </label>
      </div>
    );
  }

  if (obj.type === 'whiteout') {
    const wo = obj as WhiteoutObject;
    return (
      <div className="flex flex-wrap gap-2 items-center px-1 py-1 text-xs">
        <span className="text-gray-500 font-medium">Whiteout:</span>
        <label className="flex items-center gap-1">Fill <input type="color" value={wo.fillColor} onChange={(e) => onUpdate(wo.id, { fillColor: e.target.value } as Partial<WhiteoutObject>)} className="w-7 h-6 p-0.5 rounded border border-gray-300 cursor-pointer" /></label>
        <label className="flex items-center gap-1">Opacity
          <input type="range" value={Math.round(wo.fillOpacity * 100)} onChange={(e) => onUpdate(wo.id, { fillOpacity: Number(e.target.value) / 100 } as Partial<WhiteoutObject>)} min={10} max={100} className="w-16" />
        </label>
        <label className="flex items-center gap-1">Border <input type="color" value={wo.borderColor} onChange={(e) => onUpdate(wo.id, { borderColor: e.target.value } as Partial<WhiteoutObject>)} className="w-7 h-6 p-0.5 rounded border border-gray-300 cursor-pointer" /></label>
        <label className="flex items-center gap-1">Border W
          <input type="number" value={wo.borderWidth} onChange={(e) => onUpdate(wo.id, { borderWidth: Math.max(0, Number(e.target.value)) } as Partial<WhiteoutObject>)} min={0} max={20} className="w-12 rounded border border-gray-300 px-1 py-0.5" />
        </label>
      </div>
    );
  }

  if (obj.type === 'sticky') {
    const sn = obj as StickyNoteObject;
    return (
      <div className="flex flex-wrap gap-2 items-center px-1 py-1 text-xs">
        <span className="text-gray-500 font-medium">Sticky Note:</span>
        <label className="flex items-center gap-1">Color <input type="color" value={sn.color} onChange={(e) => onUpdate(sn.id, { color: e.target.value } as Partial<StickyNoteObject>)} className="w-7 h-6 p-0.5 rounded border border-gray-300 cursor-pointer" /></label>
        <label className="flex items-center gap-1">Opacity
          <input type="range" value={Math.round(sn.opacity * 100)} onChange={(e) => onUpdate(sn.id, { opacity: Number(e.target.value) / 100 } as Partial<StickyNoteObject>)} min={20} max={100} className="w-16" />
        </label>
      </div>
    );
  }

  if (obj.type === 'callout') {
    const co = obj as CalloutObject;
    return (
      <div className="flex flex-wrap gap-2 items-center px-1 py-1 text-xs">
        <span className="text-gray-500 font-medium">Callout:</span>
        <label className="flex items-center gap-1">Bg <input type="color" value={co.bgColor} onChange={(e) => onUpdate(co.id, { bgColor: e.target.value } as Partial<CalloutObject>)} className="w-7 h-6 p-0.5 rounded border border-gray-300 cursor-pointer" /></label>
        <label className="flex items-center gap-1">Text <input type="color" value={co.color} onChange={(e) => onUpdate(co.id, { color: e.target.value } as Partial<CalloutObject>)} className="w-7 h-6 p-0.5 rounded border border-gray-300 cursor-pointer" /></label>
        <label className="flex items-center gap-1">Border <input type="color" value={co.borderColor} onChange={(e) => onUpdate(co.id, { borderColor: e.target.value } as Partial<CalloutObject>)} className="w-7 h-6 p-0.5 rounded border border-gray-300 cursor-pointer" /></label>
        <label className="flex items-center gap-1">Border W
          <input type="number" value={co.borderWidth} onChange={(e) => onUpdate(co.id, { borderWidth: Math.max(0, Number(e.target.value)) } as Partial<CalloutObject>)} min={0} max={10} className="w-12 rounded border border-gray-300 px-1 py-0.5" />
        </label>
        <label className="flex items-center gap-1">Size
          <input type="number" value={co.fontSize} onChange={(e) => onUpdate(co.id, { fontSize: Math.max(6, Math.min(72, Number(e.target.value))) } as Partial<CalloutObject>)} min={6} max={72} className="w-12 rounded border border-gray-300 px-1 py-0.5" />
        </label>
        <label className="flex items-center gap-1">Opacity
          <input type="range" value={Math.round(co.opacity * 100)} onChange={(e) => onUpdate(co.id, { opacity: Number(e.target.value) / 100 } as Partial<CalloutObject>)} min={20} max={100} className="w-16" />
        </label>
      </div>
    );
  }

  return null;
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

  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [saveResult, setSaveResult] = useState<EditOutcome | null>(null);

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
    // Cover the original text with a white rectangle, then add an editable text object
    const coverId = crypto.randomUUID();
    const textId = crypto.randomUUID();
    const pageIdx = currentPage - 1;
    const padding = 1; // small padding to fully cover the glyph
    const cover: Omit<WhiteoutObject, 'zIndex'> = {
      id: coverId,
      type: 'whiteout',
      pageIndex: pageIdx,
      x: item.x - padding,
      y: item.y - padding,
      width: item.width + padding * 2,
      height: item.height + padding * 2,
      fillColor: '#ffffff',
      fillOpacity: 1,
      borderColor: '#ffffff',
      borderWidth: 0,
      opacity: 1,
    };
    const textObj: Omit<TextObject, 'zIndex'> = {
      id: textId,
      type: 'text',
      pageIndex: pageIdx,
      x: item.x - padding,
      y: item.y - padding,
      width: item.width + padding * 2,
      height: item.height + padding * 2,
      text: item.text,
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
    setTimeout(() => {
      setSelectedId(textId);
      setTextEditId(textId);
    }, 0);
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
    renderPageToCanvas(data, currentPage, canvas)
      .then(({ widthPt, heightPt, scale }) => {
        setPageScale(scale);
        setPageDims({ widthPt, heightPt });
        setCanvasSize({ width: canvas.width, height: canvas.height });
      })
      .catch((err) => setLoadError(`Failed to render page: ${String(err).slice(0, 80)}`))
      .finally(() => setRendering(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pdfUrl, currentPage]);

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

  // ─── Extract PDF text items for current page ──────────────────────────────────

  useEffect(() => {
    if (!pdfUrl || !pdfBytesRef.current) return;
    setPdfTextItems([]);
    const data = pdfBytesRef.current;
    let cancelled = false;
    extractPageTextItems(data, currentPage).then((items) => {
      if (!cancelled) setPdfTextItems(items);
    }).catch(() => {});
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pdfUrl, currentPage]);

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
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1.5 p-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        {toolBtn('select', 'Select')}
        <div className="h-4 w-px bg-gray-200 dark:bg-gray-700" />
        {toolBtn('text', 'Text', 'Click to place text box')}
        <button onClick={() => imageInputRef.current?.click()} className="px-2.5 py-1.5 rounded-lg text-xs font-medium border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">Image</button>
        <input ref={imageInputRef} type="file" accept="image/jpeg,image/jpg,image/png,image/webp" multiple className="sr-only" aria-label="Select image files" onChange={(e) => e.target.files && handleImageFiles(e.target.files)} />
        <div className="h-4 w-px bg-gray-200 dark:bg-gray-700" />
        {toolBtn('rect', '□ Rect', 'Draw rectangle')}
        {toolBtn('ellipse', '○ Ellipse', 'Draw ellipse')}
        {toolBtn('line', '╱ Line', 'Draw line')}
        {toolBtn('arrow', '→ Arrow', 'Draw arrow')}
        <div className="h-4 w-px bg-gray-200 dark:bg-gray-700" />
        {toolBtn('highlight', '🟡 Highlight', 'Draw highlight')}
        {toolBtn('underline', '‾ Underline', 'Draw underline')}
        {toolBtn('strikethrough', '̶S̶ Strike', 'Draw strikethrough')}
        <div className="h-4 w-px bg-gray-200 dark:bg-gray-700" />
        {toolBtn('pen', '✏ Draw', 'Freehand drawing')}
        <label className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400" title="Pen color">
          <input type="color" value={penColor} onChange={(e) => setPenColor(e.target.value)} className="w-6 h-6 p-0.5 rounded border border-gray-300 cursor-pointer" aria-label="Pen color" />
        </label>
        <label className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400" title="Pen width">
          <input type="number" value={penWidth} onChange={(e) => setPenWidth(Math.max(1, Math.min(40, Number(e.target.value))))} min={1} max={40} className="w-10 rounded border border-gray-300 dark:border-gray-600 px-1 py-0.5 text-xs bg-white dark:bg-gray-900" aria-label="Pen width" />
        </label>
        <div className="h-4 w-px bg-gray-200 dark:bg-gray-700" />
        {toolBtn('whiteout', '⬜ Whiteout', 'Draw whiteout cover')}
        <div className="h-4 w-px bg-gray-200 dark:bg-gray-700" />
        {toolBtn('sticky', '📝 Note', 'Click to place a sticky note')}
        {toolBtn('callout', '💬 Callout', 'Click to place a text callout')}
        <button
          onClick={() => setShowAnnotPanel((v) => !v)}
          className={`px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${showAnnotPanel ? 'bg-amber-100 text-amber-800 border border-amber-300' : 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
          title="Annotation panel"
          aria-pressed={showAnnotPanel}
        >
          Annotations
        </button>
        <div className="h-4 w-px bg-gray-200 dark:bg-gray-700" />
        <button onClick={undo} disabled={history.length === 0} className="px-2 py-1.5 rounded-lg text-xs border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 disabled:opacity-40" aria-label="Undo">↩</button>
        <button onClick={redo} disabled={future.length === 0} className="px-2 py-1.5 rounded-lg text-xs border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 disabled:opacity-40" aria-label="Redo">↪</button>
        {selectedObj && (
          <>
            <div className="h-4 w-px bg-gray-200 dark:bg-gray-700" />
            {selectedObj.type === 'text' && <button onClick={() => setTextEditId(selectedId)} className="px-2 py-1.5 rounded-lg text-xs border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300">Edit Text</button>}
            {(selectedObj.type === 'sticky' || selectedObj.type === 'callout') && <button onClick={() => setAnnotEditId(selectedId)} className="px-2 py-1.5 rounded-lg text-xs border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300">Edit Note</button>}
            <button onClick={() => setEditorState((s) => { pushHistory(s); return duplicateObject(s, selectedId!); })} className="px-2 py-1.5 rounded-lg text-xs border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300">Dup</button>
            <button onClick={() => setEditorState((s) => bringForward(s, selectedId!))} className="px-2 py-1.5 rounded-lg text-xs border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300" title="Bring Forward">↑</button>
            <button onClick={() => setEditorState((s) => sendBackward(s, selectedId!))} className="px-2 py-1.5 rounded-lg text-xs border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300" title="Send Backward">↓</button>
            <button onClick={() => setEditorState((s) => bringToFront(s, selectedId!))} className="px-2 py-1.5 rounded-lg text-xs border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300" title="Bring to Front">⇑</button>
            <button onClick={() => setEditorState((s) => sendToBack(s, selectedId!))} className="px-2 py-1.5 rounded-lg text-xs border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300" title="Send to Back">⇓</button>
            <button onClick={() => handleDelete(selectedId!)} className="px-2 py-1.5 rounded-lg text-xs border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400">Del</button>
            {selectedObj.type === 'image' && (
              <label className="px-2 py-1.5 rounded-lg text-xs border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 cursor-pointer">
                Replace
                <input type="file" accept="image/jpeg,image/jpg,image/png,image/webp" className="sr-only" onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file || !selectedId) return;
                  const decoded = await decodeImageFile(file).catch(() => null);
                  if (!decoded) return;
                  const { objectUrl, mimeType, naturalWidth, naturalHeight, embedBytes } = decoded;
                  const cur = editorState.objects.find((o) => o.id === selectedId) as ImageObject | undefined;
                  setEditorState((s) => { pushHistory(s); return updateObject(s, selectedId, { objectUrl, mimeType, naturalWidth, naturalHeight, embedBytes, height: (cur?.width ?? 100) / (naturalWidth / naturalHeight) } as Partial<ImageObject>); });
                }} />
              </label>
            )}
          </>
        )}
        <div className="ml-auto flex gap-1.5">
          <button onClick={handleReset} className="px-3 py-1.5 rounded-lg text-xs border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400">Close</button>
          <button
            onClick={handleSave}
            disabled={saveState === 'saving' || editorState.objects.length === 0}
            className="px-4 py-1.5 rounded-lg text-xs font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {saveState === 'saving' ? 'Generating…' : 'Download PDF'}
          </button>
        </div>
      </div>

      {/* Style panel for selected object */}
      {selectedObj && (
        <div className="rounded-lg border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 px-2 py-1">
          <StylePanel obj={selectedObj} onUpdate={handleUpdate} />
        </div>
      )}

      {/* Mode hint */}
      {toolMode === 'select' && pdfTextItems.length > 0 && (
        <p className="text-xs text-gray-500 dark:text-gray-400 px-1" role="status">
          Hover over existing text to highlight it, then click to edit it.
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
      {/* Whiteout notice */}
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
      <div className="relative inline-block border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm bg-white">
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
            selectedId={selectedId}
            onSelect={setSelectedId}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
            onTextEdit={(id) => setTextEditId(id)}
            onAnnotEdit={(id) => setAnnotEditId(id)}
            canvasWidth={canvasSize.width}
            canvasHeight={canvasSize.height}
          />
        )}

        {/* PDF text item click targets — shown in Select mode to allow editing existing text */}
        {toolMode === 'select' && pdfTextItems.map((item) => {
          const r = pdfRectToScreen(item.x, item.y, item.width, item.height, pageScale, pageDims.heightPt);
          const isHovered = hoveredTextId === item.id;
          return (
            <div
              key={item.id}
              title={`Click to edit: "${item.text.slice(0, 40)}${item.text.length > 40 ? '…' : ''}"`}
              style={{
                position: 'absolute',
                left: r.left - 2,
                top: r.top - 2,
                width: r.width + 4,
                height: r.height + 4,
                cursor: 'text',
                background: isHovered ? 'rgba(59,130,246,0.15)' : 'transparent',
                border: isHovered ? '1px solid rgba(59,130,246,0.5)' : '1px solid transparent',
                borderRadius: 2,
                zIndex: 5,
              }}
              onMouseEnter={() => setHoveredTextId(item.id)}
              onMouseLeave={() => setHoveredTextId(null)}
              onClick={() => { setHoveredTextId(null); handleEditPdfText(item); }}
            />
          );
        })}
      </div>

      {/* Object count summary */}
      {editorState.objects.length > 0 && (
        <p className="text-xs text-gray-500 dark:text-gray-400 px-1">
          {editorState.objects.filter((o) => o.type === 'text').length} text, {' '}
          {editorState.objects.filter((o) => o.type === 'image').length} image, {' '}
          {editorState.objects.filter((o) => o.type === 'rect' || o.type === 'ellipse' || o.type === 'line' || o.type === 'arrow').length} shape, {' '}
          {editorState.objects.filter((o) => o.type === 'highlight' || o.type === 'underline' || o.type === 'strikethrough').length} mark, {' '}
          {editorState.objects.filter((o) => o.type === 'stroke').length} stroke, {' '}
          {editorState.objects.filter((o) => o.type === 'whiteout').length} whiteout, {' '}
          {editorState.objects.filter((o) => o.type === 'sticky' || o.type === 'callout').length} note
          {' '}across {new Set(editorState.objects.map((o) => o.pageIndex)).size} page{new Set(editorState.objects.map((o) => o.pageIndex)).size !== 1 ? 's' : ''}
        </p>
      )}

      {/* Text edit modal */}
      {textEditId && (() => {
        const obj = editorState.objects.find((o) => o.id === textEditId);
        if (!obj || obj.type !== 'text') { setTextEditId(null); return null; }
        return (
          <TextEditModal
            obj={obj as TextObject}
            onSave={(patch) => {
              setEditorState((s) => { pushHistory(s); return updateObject(s, textEditId, patch as Partial<EditorObject>); });
            }}
            onClose={() => setTextEditId(null)}
          />
        );
      })()}

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
