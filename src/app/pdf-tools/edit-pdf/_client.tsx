'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { PdfToolLayout } from '@/components/pdf/PdfToolLayout';

type Tool = 'select' | 'text' | 'highlight' | 'rect' | 'line';
type Mark = {
  id: string;
  type: Exclude<Tool, 'select'>;
  page: number;
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
  color: string;
  fontSize: number;
};
type Point = { x: number; y: number };
type RenderInfo = { width: number; height: number; pageWidth: number; pageHeight: number; scale: number };

const SCALE = 1.25;
const COLORS = ['#ef4444', '#2563eb', '#16a34a', '#f59e0b', '#111827'];

function hexRgb(hex: string) {
  const value = hex.replace('#', '');
  return rgb(parseInt(value.slice(0, 2), 16) / 255, parseInt(value.slice(2, 4), 16) / 255, parseInt(value.slice(4, 6), 16) / 255);
}

function screenBox(mark: Mark, info: RenderInfo) {
  return {
    left: mark.x * info.scale,
    top: (info.pageHeight - mark.y - mark.height) * info.scale,
    width: Math.max(2, mark.width * info.scale),
    height: Math.max(2, mark.height * info.scale),
  };
}

export default function EditPdfClient() {
  const [file, setFile] = useState<File | null>(null);
  const [fileBytes, setFileBytes] = useState<ArrayBuffer | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [page, setPage] = useState(1);
  const [renderInfo, setRenderInfo] = useState<RenderInfo | null>(null);
  const [tool, setTool] = useState<Tool>('select');
  const [marks, setMarks] = useState<Mark[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [history, setHistory] = useState<Mark[][]>([]);
  const [future, setFuture] = useState<Mark[][]>([]);
  const [color, setColor] = useState('#ef4444');
  const [fontSize, setFontSize] = useState(18);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [dragDraft, setDragDraft] = useState<{ start: Point; end: Point } | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragRef = useRef<{ id: string; start: Point; x: number; y: number } | null>(null);
  const drawRef = useRef<{ start: Point; type: Tool } | null>(null);

  const commitMarks = useCallback((next: Mark[]) => {
    setHistory((old) => [...old.slice(-39), marks]);
    setFuture([]);
    setMarks(next);
  }, [marks]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!fileBytes) return;
      try {
        const pdfjs = await import('pdfjs-dist');
        if (!pdfjs.GlobalWorkerOptions.workerPort) {
          pdfjs.GlobalWorkerOptions.workerPort = new Worker('/pdf.worker.min.mjs', { type: 'module' });
        }
        const task = pdfjs.getDocument({ data: fileBytes.slice(0), disableAutoFetch: true });
        const doc = await task.promise;
        if (cancelled) { await doc.destroy(); return; }
        setPageCount(doc.numPages);
        const pdfPage = await doc.getPage(page);
        const viewport = pdfPage.getViewport({ scale: SCALE });
        const unitViewport = pdfPage.getViewport({ scale: 1 });
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) { await doc.destroy(); return; }
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = Math.floor(viewport.width * dpr);
        canvas.height = Math.floor(viewport.height * dpr);
        canvas.style.width = viewport.width + 'px';
        canvas.style.height = viewport.height + 'px';
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        await pdfPage.render({ canvas, canvasContext: ctx, viewport }).promise;
        if (!cancelled) {
          setRenderInfo({ width: viewport.width, height: viewport.height, pageWidth: unitViewport.width, pageHeight: unitViewport.height, scale: SCALE });
        }
        pdfPage.cleanup();
        await doc.destroy();
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Unable to render this PDF.');
      }
    }
    void load();
    return () => { cancelled = true; };
  }, [fileBytes, page]);

  const chooseFile = async (picked: File | undefined) => {
    if (!picked) return;
    setError('');
    if (!picked.name.toLowerCase().endsWith('.pdf') || picked.size === 0) {
      setError('Choose a valid, non-empty PDF file.');
      return;
    }
    if (picked.size > 100 * 1024 * 1024) {
      setError('This editor supports PDFs up to 100 MB.');
      return;
    }
    try {
      const bytes = await picked.arrayBuffer();
      setFile(picked);
      setFileBytes(bytes);
      setPage(1);
      setPageCount(0);
      setMarks([]);
      setHistory([]);
      setFuture([]);
      setSelectedId(null);
      setRenderInfo(null);
    } catch {
      setError('Could not read this PDF file.');
    }
  };

  const getPoint = (event: React.PointerEvent): Point | null => {
    const stage = stageRef.current;
    if (!stage || !renderInfo) return null;
    const rect = stage.getBoundingClientRect();
    return {
      x: Math.max(0, Math.min(renderInfo.pageWidth, (event.clientX - rect.left) / renderInfo.scale)),
      y: Math.max(0, Math.min(renderInfo.pageHeight, renderInfo.pageHeight - (event.clientY - rect.top) / renderInfo.scale)),
    };
  };

  const onStagePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!file || !renderInfo) return;
    const point = getPoint(event);
    if (!point) return;
    if (tool === 'text') {
      const mark: Mark = { id: crypto.randomUUID(), type: 'text', page: page - 1, x: point.x, y: point.y - fontSize, width: 180, height: fontSize * 1.8, text: 'Type your text', color, fontSize };
      commitMarks([...marks, mark]);
      setSelectedId(mark.id);
      setTool('select');
      return;
    }
    if (tool === 'rect' || tool === 'highlight' || tool === 'line') {
      drawRef.current = { start: point, type: tool };
      setDragDraft({ start: point, end: point });
      (event.currentTarget as HTMLDivElement).setPointerCapture(event.pointerId);
      return;
    }
    const target = (event.target as HTMLElement).closest('[data-mark-id]') as HTMLElement | null;
    const id = target?.dataset.markId;
    if (id) {
      const mark = marks.find((item) => item.id === id);
      if (!mark) return;
      setSelectedId(id);
      dragRef.current = { id, start: point, x: mark.x, y: mark.y };
      (event.currentTarget as HTMLDivElement).setPointerCapture(event.pointerId);
    } else {
      setSelectedId(null);
    }
  };

  const onStagePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const point = getPoint(event);
    if (!point) return;
    if (drawRef.current) {
      setDragDraft({ start: drawRef.current.start, end: point });
      return;
    }
    if (dragRef.current) {
      const drag = dragRef.current;
      setMarks((old) => old.map((mark) => mark.id === drag.id
        ? { ...mark, x: Math.max(0, Math.min(renderInfo.pageWidth - mark.width, drag.x + point.x - drag.start.x)), y: Math.max(0, Math.min(renderInfo.pageHeight - mark.height, drag.y + point.y - drag.start.y)) }
        : mark));
    }
  };

  const finishPointer = (event: React.PointerEvent<HTMLDivElement>) => {
    const point = getPoint(event);
    if (drawRef.current && point) {
      const drawing = drawRef.current;
      const left = Math.min(drawing.start.x, point.x);
      const bottom = Math.min(drawing.start.y, point.y);
      const width = Math.max(2, Math.abs(point.x - drawing.start.x));
      const height = Math.max(2, Math.abs(point.y - drawing.start.y));
      const mark: Mark = {
        id: crypto.randomUUID(), type: drawing.type as Mark['type'], page: page - 1,
        x: drawing.type === 'line' ? drawing.start.x : left,
        y: drawing.type === 'line' ? drawing.start.y : bottom,
        width: drawing.type === 'line' ? point.x - drawing.start.x : width,
        height: drawing.type === 'line' ? point.y - drawing.start.y : height,
        text: '', color, fontSize,
      };
      commitMarks([...marks, mark]);
      setSelectedId(mark.id);
    } else if (dragRef.current) {
      setHistory((old) => [...old.slice(-39), marks]);
      setFuture([]);
    }
    drawRef.current = null;
    dragRef.current = null;
    setDragDraft(null);
  };

  const selected = marks.find((mark) => mark.id === selectedId) ?? null;
  const updateSelected = (patch: Partial<Mark>) => {
    if (!selected) return;
    commitMarks(marks.map((mark) => mark.id === selected.id ? { ...mark, ...patch } : mark));
  };

  const undo = () => {
    if (!history.length) return;
    setFuture((old) => [marks, ...old]);
    setMarks(history[history.length - 1]);
    setHistory((old) => old.slice(0, -1));
    setSelectedId(null);
  };
  const redo = () => {
    if (!future.length) return;
    setHistory((old) => [...old, marks]);
    setMarks(future[0]);
    setFuture((old) => old.slice(1));
    setSelectedId(null);
  };

  const download = async () => {
    if (!fileBytes || busy) return;
    setBusy(true);
    setError('');
    try {
      const pdf = await PDFDocument.load(fileBytes.slice(0));
      const helvetica = await pdf.embedFont(StandardFonts.Helvetica);
      const pages = pdf.getPages();
      for (const mark of marks) {
        const target = pages[mark.page];
        if (!target) continue;
        const c = hexRgb(mark.color);
        if (mark.type === 'text') {
          target.drawText(mark.text, { x: mark.x, y: mark.y, size: mark.fontSize, font: helvetica, color: c, maxWidth: Math.max(10, mark.width), lineHeight: mark.fontSize * 1.25 });
        } else if (mark.type === 'rect') {
          target.drawRectangle({ x: mark.x, y: mark.y, width: mark.width, height: mark.height, borderColor: c, borderWidth: 1.5, color: rgb(1, 1, 1), opacity: 0, borderOpacity: 1 });
        } else if (mark.type === 'highlight') {
          target.drawRectangle({ x: mark.x, y: mark.y, width: mark.width, height: mark.height, color: c, opacity: 0.28, borderWidth: 0 });
        } else if (mark.type === 'line') {
          target.drawLine({ start: { x: mark.x, y: mark.y }, end: { x: mark.x + mark.width, y: mark.y + mark.height }, thickness: 2, color: c });
        }
      }
      const bytes = await pdf.save();
      const blob = new Blob([bytes as BlobPart], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = (file?.name ?? 'document.pdf').replace(/\.pdf$/i, '') + '-edited.pdf';
      anchor.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 1500);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not export this PDF. It may be password-protected.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <PdfToolLayout title="PDF Editor" description="Add text, highlights, rectangles, and lines to a PDF. Files are processed locally in your browser.">
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-gray-200 bg-white p-3 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <input ref={fileInputRef} type="file" accept="application/pdf,.pdf" className="hidden" onChange={(event) => { void chooseFile(event.target.files?.[0]); event.currentTarget.value = ''; }} />
          <button type="button" onClick={() => fileInputRef.current?.click()} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">{file ? 'Replace PDF' : 'Open PDF'}</button>
          {file && <span className="max-w-52 truncate text-sm text-gray-600 dark:text-gray-300" title={file.name}>{file.name}</span>}
          <span className="mx-1 hidden h-7 border-l border-gray-200 sm:block" />
          {(['select', 'text', 'highlight', 'rect', 'line'] as Tool[]).map((value) => (
            <button key={value} type="button" disabled={!file} onClick={() => { setTool(value); setSelectedId(null); }} aria-pressed={tool === value} className={'rounded-lg border px-3 py-2 text-sm capitalize ' + (tool === value ? 'border-blue-600 bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300' : 'border-gray-200 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800')}>{value === 'rect' ? 'Rectangle' : value}</button>
          ))}
          <label className="flex items-center gap-2 text-xs text-gray-500">Color <input type="color" value={color} onChange={(event) => setColor(event.target.value)} className="h-8 w-9 cursor-pointer rounded border-0 bg-transparent p-0" /></label>
          <label className="flex items-center gap-2 text-xs text-gray-500">Text size <input type="number" min={6} max={96} value={fontSize} onChange={(event) => setFontSize(Math.max(6, Math.min(96, Number(event.target.value) || 18)))} className="w-16 rounded border border-gray-300 px-2 py-1.5 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white" /></label>
          <div className="ml-auto flex gap-2">
            <button type="button" onClick={undo} disabled={!history.length} className="rounded-lg border border-gray-200 px-3 py-2 text-sm disabled:opacity-40 dark:border-gray-700">Undo</button>
            <button type="button" onClick={redo} disabled={!future.length} className="rounded-lg border border-gray-200 px-3 py-2 text-sm disabled:opacity-40 dark:border-gray-700">Redo</button>
            <button type="button" onClick={() => { if (confirm('Remove all edits from this session?')) { commitMarks([]); setSelectedId(null); } }} disabled={!marks.length} className="rounded-lg border border-gray-200 px-3 py-2 text-sm disabled:opacity-40 dark:border-gray-700">Clear</button>
            <button type="button" onClick={() => void download()} disabled={!file || busy} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50">{busy ? 'Exporting…' : 'Download PDF'}</button>
          </div>
        </div>

        {error && <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-200">{error}</div>}
        {!file && <button type="button" onClick={() => fileInputRef.current?.click()} className="flex min-h-64 w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-white p-8 text-center hover:border-blue-400 dark:border-gray-700 dark:bg-gray-900"><span className="text-lg font-semibold text-gray-800 dark:text-gray-100">Open a PDF to start editing</span><span className="mt-2 text-sm text-gray-500">Select a PDF up to 100 MB. Nothing is uploaded.</span></button>}

        {file && <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_250px]">
          <div className="min-w-0 overflow-auto rounded-xl border border-gray-200 bg-gray-100 p-3 dark:border-gray-700 dark:bg-gray-800">
            <div className="mb-3 flex items-center justify-center gap-3">
              <button type="button" onClick={() => setPage((value) => Math.max(1, value - 1))} disabled={page <= 1} className="rounded border border-gray-300 bg-white px-3 py-1.5 text-sm disabled:opacity-40 dark:border-gray-600 dark:bg-gray-900">Previous</button>
              <span className="text-sm text-gray-600 dark:text-gray-300">Page {page} {pageCount ? 'of ' + pageCount : ''}</span>
              <button type="button" onClick={() => setPage((value) => Math.min(pageCount, value + 1))} disabled={!pageCount || page >= pageCount} className="rounded border border-gray-300 bg-white px-3 py-1.5 text-sm disabled:opacity-40 dark:border-gray-600 dark:bg-gray-900">Next</button>
            </div>
            <div className="flex justify-center">
              <div ref={stageRef} onPointerDown={onStagePointerDown} onPointerMove={onStagePointerMove} onPointerUp={finishPointer} onPointerCancel={finishPointer} className="relative shrink-0 bg-white shadow-lg" style={{ width: renderInfo?.width ?? 'auto', height: renderInfo?.height ?? 'auto', touchAction: 'none', cursor: tool === 'select' ? 'default' : 'crosshair' }}>
                <canvas ref={canvasRef} className="block" />
                {renderInfo && marks.filter((mark) => mark.page === page - 1).map((mark) => {
                  const box = screenBox(mark, renderInfo);
                  const active = selectedId === mark.id;
                  const common: React.CSSProperties = { position: 'absolute', left: box.left, top: box.top, width: box.width, height: box.height, boxSizing: 'border-box', cursor: tool === 'select' ? 'move' : 'default', outline: active ? '2px solid #2563eb' : 'none', touchAction: 'none' };
                  if (mark.type === 'text') return <textarea key={mark.id} data-mark-id={mark.id} aria-label="Added PDF text" value={mark.text} onChange={(event) => commitMarks(marks.map((item) => item.id === mark.id ? { ...item, text: event.target.value } : item))} onFocus={() => setSelectedId(mark.id)} onPointerDown={(event) => { if (tool === 'select') { event.stopPropagation(); const point = getPoint(event); if (point) { setSelectedId(mark.id); dragRef.current = { id: mark.id, start: point, x: mark.x, y: mark.y }; } } }} style={{ ...common, border: '1px dashed ' + mark.color, background: 'rgba(255,255,255,.78)', color: mark.color, fontSize: mark.fontSize * renderInfo.scale, lineHeight: 1.25, padding: 2, resize: 'both', overflow: 'auto' }} />;
                  if (mark.type === 'highlight') return <div key={mark.id} data-mark-id={mark.id} onClick={() => setSelectedId(mark.id)} style={{ ...common, background: mark.color, opacity: 0.3, border: active ? '1px solid #2563eb' : '1px solid transparent' }} />;
                  if (mark.type === 'rect') return <div key={mark.id} data-mark-id={mark.id} onClick={() => setSelectedId(mark.id)} style={{ ...common, border: '2px solid ' + mark.color, background: 'transparent' }} />;
                  return <svg key={mark.id} data-mark-id={mark.id} onClick={() => setSelectedId(mark.id)} style={{ position: 'absolute', left: Math.min(mark.x, mark.x + mark.width) * renderInfo.scale, top: (renderInfo.pageHeight - Math.max(mark.y, mark.y + mark.height)) * renderInfo.scale, width: Math.max(2, Math.abs(mark.width) * renderInfo.scale), height: Math.max(2, Math.abs(mark.height) * renderInfo.scale), overflow: 'visible', pointerEvents: 'auto' }}><line x1={mark.width < 0 ? Math.abs(mark.width) * renderInfo.scale : 0} y1={mark.height > 0 ? 0 : Math.abs(mark.height) * renderInfo.scale} x2={mark.width < 0 ? 0 : Math.abs(mark.width) * renderInfo.scale} y2={mark.height > 0 ? Math.abs(mark.height) * renderInfo.scale : 0} stroke={mark.color} strokeWidth="2" /></svg>;
                })}
                {renderInfo && dragDraft && tool !== 'text' && (() => {
                  const left = Math.min(dragDraft.start.x, dragDraft.end.x) * renderInfo.scale;
                  const top = (renderInfo.pageHeight - Math.max(dragDraft.start.y, dragDraft.end.y)) * renderInfo.scale;
                  const width = Math.max(2, Math.abs(dragDraft.end.x - dragDraft.start.x) * renderInfo.scale);
                  const height = Math.max(2, Math.abs(dragDraft.end.y - dragDraft.start.y) * renderInfo.scale);
                  if (tool === 'line') {
                    const x1 = (dragDraft.start.x - Math.min(dragDraft.start.x, dragDraft.end.x)) * renderInfo.scale;
                    const x2 = (dragDraft.end.x - Math.min(dragDraft.start.x, dragDraft.end.x)) * renderInfo.scale;
                    const y1 = (Math.max(dragDraft.start.y, dragDraft.end.y) - dragDraft.start.y) * renderInfo.scale;
                    const y2 = (Math.max(dragDraft.start.y, dragDraft.end.y) - dragDraft.end.y) * renderInfo.scale;
                    return <svg aria-hidden="true" style={{ position: 'absolute', left, top, width, height, overflow: 'visible', pointerEvents: 'none' }}><line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth="2" strokeDasharray="5 3" /></svg>;
                  }
                  return <div aria-hidden="true" style={{ position: 'absolute', left, top, width, height, border: tool === 'highlight' ? 'none' : '2px dashed ' + color, background: tool === 'highlight' ? color : 'transparent', opacity: tool === 'highlight' ? 0.3 : 1, pointerEvents: 'none' }} />;
                })()}
              </div>
            </div>
          </div>
          <aside className="h-fit rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Properties</h2>
            {!selected && <p className="mt-3 text-sm text-gray-500">Select an added object to edit its properties.</p>}
            {selected && <div className="mt-3 space-y-3">
              <p className="text-xs uppercase tracking-wide text-gray-500">{selected.type}</p>
              {selected.type === 'text' && <>
                <label className="block text-xs text-gray-500">Text<textarea value={selected.text} onChange={(event) => updateSelected({ text: event.target.value })} rows={4} className="mt-1 w-full rounded border border-gray-300 p-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white" /></label>
                <label className="block text-xs text-gray-500">Font size (pt)<input type="number" min={6} max={96} value={selected.fontSize} onChange={(event) => { const size = Math.max(6, Math.min(96, Number(event.target.value) || 18)); updateSelected({ fontSize: size, height: Math.max(12, size * 1.8) }); }} className="mt-1 w-full rounded border border-gray-300 p-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white" /></label>
                <label className="block text-xs text-gray-500">Text box width (pt)<input type="number" min={20} max={1200} value={Math.round(selected.width)} onChange={(event) => updateSelected({ width: Math.max(20, Math.min(1200, Number(event.target.value) || 180)) })} className="mt-1 w-full rounded border border-gray-300 p-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white" /></label>
                <label className="block text-xs text-gray-500">Text box height (pt)<input type="number" min={12} max={1200} value={Math.round(selected.height)} onChange={(event) => updateSelected({ height: Math.max(12, Math.min(1200, Number(event.target.value) || 32)) })} className="mt-1 w-full rounded border border-gray-300 p-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white" /></label>
              </>}
              <label className="block text-xs text-gray-500">Color<input type="color" value={selected.color} onChange={(event) => updateSelected({ color: event.target.value })} className="mt-1 h-9 w-full rounded border border-gray-300 p-1 dark:border-gray-700" /></label>
              <button type="button" onClick={() => { commitMarks(marks.filter((mark) => mark.id !== selected.id)); setSelectedId(null); }} className="w-full rounded-lg border border-red-200 px-3 py-2 text-sm text-red-600 hover:bg-red-50">Delete object</button>
              <p className="text-xs text-gray-500">Drag the object on the page to reposition it. Changes are embedded when you download.</p>
            </div>}
          </aside>
        </div>}
        <p className="text-xs text-gray-500">This editor adds new text and annotations over the original page. It does not rewrite existing PDF text. Files stay on your device.</p>
      </div>
    </PdfToolLayout>
  );
}
