'use client';

import { useCallback, useRef } from 'react';
import type {
  EditorObject, TextObject, ImageObject,
  RectObject, EllipseObject, LineObject, ArrowObject, AnnotationObject,
} from '@/lib/pdf/editPdf';
import { pdfToScreenPoint } from '@/lib/pdf/editPdf';

// ─── Handle types ─────────────────────────────────────────────────────────────

type HandleId =
  | 'move'
  | 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w'
  | 'rotate'
  | 'p1' | 'p2'; // for lines/arrows

// ─── Coordinate helpers ───────────────────────────────────────────────────────

export function pdfRectToScreen(
  x: number, y: number, w: number, h: number,
  scale: number, pageHeightPt: number,
): { left: number; top: number; width: number; height: number } {
  const topPt = pdfToScreenPoint(x, y + h, scale, pageHeightPt);
  return { left: topPt.x, top: topPt.y, width: w * scale, height: h * scale };
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface EditorOverlayProps {
  objects: EditorObject[];
  pageIndex: number;
  pageWidthPt: number;
  pageHeightPt: number;
  scale: number;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onUpdate: (id: string, patch: Partial<EditorObject>) => void;
  onDelete: (id: string) => void;
  onTextEdit?: (id: string) => void;
  canvasWidth: number;
  canvasHeight: number;
}

const MIN_SIZE = 12;

// ─── Box handle component ─────────────────────────────────────────────────────

function BoxHandles({
  obj,
  rect,
  scale,
  isSelected,
  showRotate,
  onSelect,
  onUpdate,
  onDelete,
  onTextEdit,
}: {
  obj: EditorObject;
  rect: { left: number; top: number; width: number; height: number };
  scale: number;
  isSelected: boolean;
  showRotate: boolean;
  onSelect: (id: string | null) => void;
  onUpdate: (id: string, patch: Partial<EditorObject>) => void;
  onDelete: (id: string) => void;
  onTextEdit?: (id: string) => void;
}) {
  type BoxObj = TextObject | ImageObject | RectObject;
  const dragStateRef = useRef<{
    handle: HandleId;
    startX: number;
    startY: number;
    startObj: { x: number; y: number; width: number; height: number };
    rotateCenter?: { cx: number; cy: number };
    startAngle?: number;
    startRotation?: number;
  } | null>(null);

  const handlePointerDown = useCallback(
    (handle: HandleId, e: React.PointerEvent) => {
      e.stopPropagation();
      e.preventDefault();
      if (!isSelected) onSelect(obj.id);
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      let startAngle: number | undefined;
      let startRotation: number | undefined;
      if (handle === 'rotate') {
        const dx = e.clientX - cx;
        const dy = e.clientY - cy;
        startAngle = Math.atan2(dy, dx);
        startRotation = (obj as { rotation?: number }).rotation ?? 0;
      }
      const boxObj = obj as BoxObj;
      dragStateRef.current = {
        handle,
        startX: e.clientX,
        startY: e.clientY,
        startObj: { x: boxObj.x, y: boxObj.y, width: boxObj.width, height: boxObj.height },
        rotateCenter: { cx, cy },
        startAngle,
        startRotation,
      };
      (e.target as Element).setPointerCapture(e.pointerId);
    },
    [isSelected, obj, onSelect, rect],
  );

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    const ds = dragStateRef.current;
    if (!ds) return;
    e.preventDefault();
    const dx = (e.clientX - ds.startX) / scale;
    const dy = -(e.clientY - ds.startY) / scale;
    const { x, y, width, height } = ds.startObj;

    if (ds.handle === 'rotate' && ds.startAngle !== undefined && ds.startRotation !== undefined && ds.rotateCenter) {
      const curDx = e.clientX - ds.rotateCenter.cx;
      const curDy = e.clientY - ds.rotateCenter.cy;
      const delta = (Math.atan2(curDy, curDx) - ds.startAngle) * (180 / Math.PI);
      onUpdate(obj.id, { rotation: ((ds.startRotation + delta) % 360 + 360) % 360 } as Partial<EditorObject>);
      return;
    }
    if (ds.handle === 'move') { onUpdate(obj.id, { x: x + dx, y: y + dy }); return; }

    const maintainAspect = obj.type === 'image';
    const aspect = width / (height || 1);
    let nx = x, ny = y, nw = width, nh = height;
    const minPt = MIN_SIZE / scale;

    switch (ds.handle) {
      case 'se': nw = Math.max(minPt, width + dx); nh = maintainAspect ? nw / aspect : Math.max(minPt, height - dy); break;
      case 'sw': nw = Math.max(minPt, width - dx); nx = x + (width - nw); nh = maintainAspect ? nw / aspect : Math.max(minPt, height - dy); break;
      case 'ne': nw = Math.max(minPt, width + dx); if (maintainAspect) { nh = nw / aspect; ny = y + (height - nh); } else { nh = Math.max(minPt, height + dy); ny = y + (height - nh); } break;
      case 'nw': nw = Math.max(minPt, width - dx); nx = x + (width - nw); if (maintainAspect) { nh = nw / aspect; ny = y + (height - nh); } else { nh = Math.max(minPt, height + dy); ny = y + (height - nh); } break;
      case 'e': nw = Math.max(minPt, width + dx); break;
      case 'w': nw = Math.max(minPt, width - dx); nx = x + (width - nw); break;
      case 'n': nh = Math.max(minPt, height + dy); ny = y + (height - nh); break;
      case 's': nh = Math.max(minPt, height - dy); break;
    }
    onUpdate(obj.id, { x: nx, y: ny, width: nw, height: nh });
  }, [obj, onUpdate, scale]);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    dragStateRef.current = null;
    (e.target as Element).releasePointerCapture(e.pointerId);
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!isSelected) return;
    const step = e.shiftKey ? 10 : 1;
    const d = step / scale;
    switch (e.key) {
      case 'ArrowLeft': e.preventDefault(); onUpdate(obj.id, { x: (obj as BoxObj).x - d }); break;
      case 'ArrowRight': e.preventDefault(); onUpdate(obj.id, { x: (obj as BoxObj).x + d }); break;
      case 'ArrowUp': e.preventDefault(); onUpdate(obj.id, { y: (obj as BoxObj).y + d }); break;
      case 'ArrowDown': e.preventDefault(); onUpdate(obj.id, { y: (obj as BoxObj).y - d }); break;
      case 'Delete': case 'Backspace': e.preventDefault(); onDelete(obj.id); break;
    }
  }, [isSelected, obj, onDelete, onUpdate, scale]);

  const label = obj.type === 'text'
    ? `Text: ${(obj as TextObject).text.slice(0, 30)}`
    : obj.type === 'image' ? 'Image'
    : obj.type === 'rect' ? 'Rectangle'
    : obj.type === 'highlight' ? 'Highlight'
    : obj.type === 'underline' ? 'Underline'
    : obj.type === 'strikethrough' ? 'Strikethrough'
    : 'Ellipse';

  const cornerHandles: { id: HandleId; style: React.CSSProperties }[] = isSelected ? [
    { id: 'nw', style: { top: -5, left: -5, cursor: 'nw-resize' } },
    { id: 'n',  style: { top: -5, left: '50%', transform: 'translateX(-50%)', cursor: 'n-resize' } },
    { id: 'ne', style: { top: -5, right: -5, cursor: 'ne-resize' } },
    { id: 'e',  style: { top: '50%', right: -5, transform: 'translateY(-50%)', cursor: 'e-resize' } },
    { id: 'se', style: { bottom: -5, right: -5, cursor: 'se-resize' } },
    { id: 's',  style: { bottom: -5, left: '50%', transform: 'translateX(-50%)', cursor: 's-resize' } },
    { id: 'sw', style: { bottom: -5, left: -5, cursor: 'sw-resize' } },
    { id: 'w',  style: { top: '50%', left: -5, transform: 'translateY(-50%)', cursor: 'w-resize' } },
  ] : [];

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={label}
      aria-selected={isSelected}
      style={{
        position: 'absolute',
        left: rect.left, top: rect.top, width: rect.width, height: rect.height,
        outline: isSelected ? '2px solid #2563eb' : '1px dashed rgba(100,149,237,0.4)',
        boxSizing: 'border-box',
        cursor: 'move',
        userSelect: 'none',
        touchAction: 'none',
      }}
      onPointerDown={(e) => { if (e.target === e.currentTarget) handlePointerDown('move', e); }}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onClick={(e) => { e.stopPropagation(); onSelect(obj.id); }}
      onDoubleClick={() => { if (obj.type === 'text') onTextEdit?.(obj.id); }}
      onKeyDown={handleKeyDown}
    >
      {cornerHandles.map((h) => (
        <div key={h.id} style={{ position: 'absolute', width: 10, height: 10, background: '#2563eb', border: '2px solid white', borderRadius: 2, ...h.style }} onPointerDown={(e) => handlePointerDown(h.id, e)} />
      ))}
      {showRotate && isSelected && (
        <div title="Rotate" style={{ position: 'absolute', top: -28, left: '50%', transform: 'translateX(-50%)', width: 18, height: 18, background: '#2563eb', border: '2px solid white', borderRadius: '50%', cursor: 'grab', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onPointerDown={(e) => handlePointerDown('rotate', e)}>
          <svg width="10" height="10" viewBox="0 0 12 12" fill="white" aria-hidden="true"><path d="M6 1A5 5 0 1 0 11 6h-1.5A3.5 3.5 0 1 1 6 2.5V1z"/><path d="M5 0l2 2.5L5 5V0z"/></svg>
        </div>
      )}
      <div style={{ position: 'absolute', inset: 0 }} onPointerDown={(e) => handlePointerDown('move', e)} />
    </div>
  );
}

// ─── Line/Arrow handle component ──────────────────────────────────────────────

function LineHandles({
  obj,
  scale,
  pageHeightPt,
  isSelected,
  onSelect,
  onUpdate,
  onDelete,
}: {
  obj: LineObject | ArrowObject;
  scale: number;
  pageHeightPt: number;
  isSelected: boolean;
  onSelect: (id: string | null) => void;
  onUpdate: (id: string, patch: Partial<EditorObject>) => void;
  onDelete: (id: string) => void;
}) {
  const dragStateRef = useRef<{
    handle: HandleId;
    startX: number; startY: number;
    startObj: { x1: number; y1: number; x2: number; y2: number };
  } | null>(null);

  const p1 = pdfToScreenPoint(obj.x1, obj.y1, scale, pageHeightPt);
  const p2 = pdfToScreenPoint(obj.x2, obj.y2, scale, pageHeightPt);

  // Bounding box of the line for click detection
  const minX = Math.min(p1.x, p2.x) - 8;
  const minY = Math.min(p1.y, p2.y) - 8;
  const maxX = Math.max(p1.x, p2.x) + 8;
  const maxY = Math.max(p1.y, p2.y) + 8;

  const handlePointerDown = useCallback((handle: HandleId, e: React.PointerEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!isSelected) onSelect(obj.id);
    dragStateRef.current = {
      handle,
      startX: e.clientX, startY: e.clientY,
      startObj: { x1: obj.x1, y1: obj.y1, x2: obj.x2, y2: obj.y2 },
    };
    (e.target as Element).setPointerCapture(e.pointerId);
  }, [isSelected, obj, onSelect]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    const ds = dragStateRef.current;
    if (!ds) return;
    e.preventDefault();
    const dx = (e.clientX - ds.startX) / scale;
    const dy = -(e.clientY - ds.startY) / scale;
    const { x1, y1, x2, y2 } = ds.startObj;
    if (ds.handle === 'move') {
      onUpdate(obj.id, { x1: x1 + dx, y1: y1 + dy, x2: x2 + dx, y2: y2 + dy });
    } else if (ds.handle === 'p1') {
      onUpdate(obj.id, { x1: x1 + dx, y1: y1 + dy });
    } else if (ds.handle === 'p2') {
      onUpdate(obj.id, { x2: x2 + dx, y2: y2 + dy });
    }
  }, [obj, onUpdate, scale]);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    dragStateRef.current = null;
    (e.target as Element).releasePointerCapture(e.pointerId);
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!isSelected) return;
    const step = (e.shiftKey ? 10 : 1) / scale;
    let dx = 0, dy = 0;
    if (e.key === 'ArrowLeft') { e.preventDefault(); dx = -step; }
    else if (e.key === 'ArrowRight') { e.preventDefault(); dx = step; }
    else if (e.key === 'ArrowUp') { e.preventDefault(); dy = step; }
    else if (e.key === 'ArrowDown') { e.preventDefault(); dy = -step; }
    else if (e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); onDelete(obj.id); return; }
    if (dx || dy) onUpdate(obj.id, { x1: obj.x1 + dx, y1: obj.y1 + dy, x2: obj.x2 + dx, y2: obj.y2 + dy });
  }, [isSelected, obj, onDelete, onUpdate, scale]);

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={obj.type === 'arrow' ? 'Arrow' : 'Line'}
      aria-selected={isSelected}
      style={{ position: 'absolute', left: minX, top: minY, width: maxX - minX, height: maxY - minY, cursor: 'move', userSelect: 'none', touchAction: 'none' }}
      onPointerDown={(e) => handlePointerDown('move', e)}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onClick={(e) => { e.stopPropagation(); onSelect(obj.id); }}
      onKeyDown={handleKeyDown}
    >
      {isSelected && (
        <>
          {/* P1 handle */}
          <div
            style={{ position: 'absolute', left: p1.x - minX - 5, top: p1.y - minY - 5, width: 10, height: 10, background: '#2563eb', border: '2px solid white', borderRadius: '50%', cursor: 'crosshair' }}
            onPointerDown={(e) => handlePointerDown('p1', e)}
          />
          {/* P2 handle */}
          <div
            style={{ position: 'absolute', left: p2.x - minX - 5, top: p2.y - minY - 5, width: 10, height: 10, background: '#2563eb', border: '2px solid white', borderRadius: '50%', cursor: 'crosshair' }}
            onPointerDown={(e) => handlePointerDown('p2', e)}
          />
        </>
      )}
    </div>
  );
}

// ─── Ellipse handle ────────────────────────────────────────────────────────────

function EllipseHandles({
  obj,
  scale,
  pageHeightPt,
  isSelected,
  onSelect,
  onUpdate,
  onDelete,
}: {
  obj: EllipseObject;
  scale: number;
  pageHeightPt: number;
  isSelected: boolean;
  onSelect: (id: string | null) => void;
  onUpdate: (id: string, patch: Partial<EditorObject>) => void;
  onDelete: (id: string) => void;
}) {
  // Convert ellipse bounding box to screen
  const x = obj.cx - obj.rx;
  const y = obj.cy - obj.ry;
  const w = obj.rx * 2;
  const h = obj.ry * 2;
  const rect = pdfRectToScreen(x, y, w, h, scale, pageHeightPt);

  const dragStateRef = useRef<{
    handle: HandleId;
    startX: number; startY: number;
    startEll: { cx: number; cy: number; rx: number; ry: number };
  } | null>(null);

  const handlePointerDown = useCallback((handle: HandleId, e: React.PointerEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!isSelected) onSelect(obj.id);
    dragStateRef.current = {
      handle,
      startX: e.clientX, startY: e.clientY,
      startEll: { cx: obj.cx, cy: obj.cy, rx: obj.rx, ry: obj.ry },
    };
    (e.target as Element).setPointerCapture(e.pointerId);
  }, [isSelected, obj, onSelect]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    const ds = dragStateRef.current;
    if (!ds) return;
    e.preventDefault();
    const dx = (e.clientX - ds.startX) / scale;
    const dy = -(e.clientY - ds.startY) / scale;
    const { cx, cy, rx, ry } = ds.startEll;
    const minR = MIN_SIZE / scale / 2;

    if (ds.handle === 'move') {
      onUpdate(obj.id, { cx: cx + dx, cy: cy + dy });
    } else if (ds.handle === 'e' || ds.handle === 'w') {
      const newRx = Math.max(minR, rx + (ds.handle === 'e' ? dx : -dx));
      onUpdate(obj.id, { rx: newRx });
    } else if (ds.handle === 'n' || ds.handle === 's') {
      const newRy = Math.max(minR, ry + (ds.handle === 'n' ? dy : -dy));
      onUpdate(obj.id, { ry: newRy });
    } else {
      // Corner handles — resize both
      const newRx = Math.max(minR, rx + Math.abs(dx) * (ds.handle.includes('e') ? 1 : -1));
      const newRy = Math.max(minR, ry + Math.abs(dy) * (ds.handle.includes('n') ? 1 : -1));
      onUpdate(obj.id, { rx: newRx, ry: newRy });
    }
  }, [obj, onUpdate, scale]);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    dragStateRef.current = null;
    (e.target as Element).releasePointerCapture(e.pointerId);
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!isSelected) return;
    const step = (e.shiftKey ? 10 : 1) / scale;
    if (e.key === 'ArrowLeft') { e.preventDefault(); onUpdate(obj.id, { cx: obj.cx - step }); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); onUpdate(obj.id, { cx: obj.cx + step }); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); onUpdate(obj.id, { cy: obj.cy + step }); }
    else if (e.key === 'ArrowDown') { e.preventDefault(); onUpdate(obj.id, { cy: obj.cy - step }); }
    else if (e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); onDelete(obj.id); }
  }, [isSelected, obj, onDelete, onUpdate, scale]);

  const cornerHandles: { id: HandleId; style: React.CSSProperties }[] = isSelected ? [
    { id: 'nw', style: { top: -5, left: -5, cursor: 'nw-resize' } },
    { id: 'n',  style: { top: -5, left: '50%', transform: 'translateX(-50%)', cursor: 'n-resize' } },
    { id: 'ne', style: { top: -5, right: -5, cursor: 'ne-resize' } },
    { id: 'e',  style: { top: '50%', right: -5, transform: 'translateY(-50%)', cursor: 'e-resize' } },
    { id: 'se', style: { bottom: -5, right: -5, cursor: 'se-resize' } },
    { id: 's',  style: { bottom: -5, left: '50%', transform: 'translateX(-50%)', cursor: 's-resize' } },
    { id: 'sw', style: { bottom: -5, left: -5, cursor: 'sw-resize' } },
    { id: 'w',  style: { top: '50%', left: -5, transform: 'translateY(-50%)', cursor: 'w-resize' } },
  ] : [];

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="Ellipse"
      aria-selected={isSelected}
      style={{
        position: 'absolute',
        left: rect.left, top: rect.top, width: rect.width, height: rect.height,
        outline: isSelected ? '2px solid #2563eb' : '1px dashed rgba(100,149,237,0.4)',
        borderRadius: '50%',
        boxSizing: 'border-box',
        cursor: 'move',
        userSelect: 'none',
        touchAction: 'none',
      }}
      onPointerDown={(e) => { if (e.target === e.currentTarget) handlePointerDown('move', e); }}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onClick={(e) => { e.stopPropagation(); onSelect(obj.id); }}
      onKeyDown={handleKeyDown}
    >
      {cornerHandles.map((h) => (
        <div key={h.id} style={{ position: 'absolute', width: 10, height: 10, background: '#2563eb', border: '2px solid white', borderRadius: 2, ...h.style }} onPointerDown={(e) => handlePointerDown(h.id, e)} />
      ))}
      <div style={{ position: 'absolute', inset: 0 }} onPointerDown={(e) => handlePointerDown('move', e)} />
    </div>
  );
}

// ─── Main overlay ─────────────────────────────────────────────────────────────

export function EditorOverlay({
  objects,
  pageIndex,
  pageWidthPt,
  pageHeightPt,
  scale,
  selectedId,
  onSelect,
  onUpdate,
  onDelete,
  onTextEdit,
  canvasWidth,
  canvasHeight,
}: EditorOverlayProps) {
  const pageObjects = objects
    .filter((o) => o.pageIndex === pageIndex)
    .sort((a, b) => a.zIndex - b.zIndex);

  void pageWidthPt;

  return (
    <div
      role="presentation"
      style={{ position: 'absolute', left: 0, top: 0, width: canvasWidth, height: canvasHeight, pointerEvents: 'none', overflow: 'hidden' }}
      onClick={() => onSelect(null)}
    >
      {pageObjects.map((obj) => {
        const key = obj.id;
        const isSelected = obj.id === selectedId;

        if (obj.type === 'line' || obj.type === 'arrow') {
          return (
            <div key={key} style={{ pointerEvents: 'all' }}>
              <LineHandles
                obj={obj as LineObject | ArrowObject}
                scale={scale}
                pageHeightPt={pageHeightPt}
                isSelected={isSelected}
                onSelect={onSelect}
                onUpdate={onUpdate}
                onDelete={onDelete}
              />
            </div>
          );
        }

        if (obj.type === 'ellipse') {
          return (
            <div key={key} style={{ pointerEvents: 'all' }}>
              <EllipseHandles
                obj={obj as EllipseObject}
                scale={scale}
                pageHeightPt={pageHeightPt}
                isSelected={isSelected}
                onSelect={onSelect}
                onUpdate={onUpdate}
                onDelete={onDelete}
              />
            </div>
          );
        }

        // text, image, rect, annotation — all use bounding box handles
        const boxObj = obj as TextObject | ImageObject | RectObject | AnnotationObject;
        const rect = pdfRectToScreen(boxObj.x, boxObj.y, boxObj.width, boxObj.height, scale, pageHeightPt);
        const showRotate = obj.type === 'image' || obj.type === 'rect';

        return (
          <div key={key} style={{ pointerEvents: 'all' }}>
            <BoxHandles
              obj={obj}
              rect={rect}
              scale={scale}
              isSelected={isSelected}
              showRotate={showRotate}
              onSelect={onSelect}
              onUpdate={onUpdate}
              onDelete={onDelete}
              onTextEdit={onTextEdit}
            />
          </div>
        );
      })}
    </div>
  );
}
