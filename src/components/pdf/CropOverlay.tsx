'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { CropRect } from '@/lib/pdf/crop';

// ─── Handle IDs ───────────────────────────────────────────────────────────────

type HandleId =
  | 'nw' | 'n' | 'ne'
  | 'w'            | 'e'
  | 'sw' | 's' | 'se'
  | 'move';

// ─── Props ────────────────────────────────────────────────────────────────────

export interface CropOverlayProps {
  /** Container width in px (matches rendered page width) */
  containerW: number;
  /** Container height in px (matches rendered page height) */
  containerH: number;
  /**
   * Crop rect in px-space (0,0 = top-left of container).
   * x/y = distance from left/top; w/h = size.
   */
  cropPx: { x: number; y: number; w: number; h: number };
  aspectRatio: number | null; // null = free
  onCropChange: (next: { x: number; y: number; w: number; h: number }) => void;
  onCropCommit: (next: { x: number; y: number; w: number; h: number }) => void;
}

const MIN_SIZE = 10;

export function CropOverlay({
  containerW,
  containerH,
  cropPx,
  aspectRatio,
  onCropChange,
  onCropCommit,
}: CropOverlayProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const dragState = useRef<{
    handle: HandleId;
    startX: number; startY: number;
    startCrop: typeof cropPx;
  } | null>(null);

  // Keyboard nudge for the crop box
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    const step = e.shiftKey ? 10 : 1;
    const { x, y, w, h } = cropPx;
    let nx = x, ny = y, nw = w, nh = h;
    switch (e.key) {
      case 'ArrowLeft':  nx = Math.max(0, x - step); break;
      case 'ArrowRight': nx = Math.min(containerW - w, x + step); break;
      case 'ArrowUp':    ny = Math.max(0, y - step); break;
      case 'ArrowDown':  ny = Math.min(containerH - h, y + step); break;
      default: return;
    }
    e.preventDefault();
    const next = { x: nx, y: ny, w: nw, h: nh };
    onCropChange(next);
    onCropCommit(next);
  }, [cropPx, containerW, containerH, onCropChange, onCropCommit]);

  const getPointerPos = (e: MouseEvent | TouchEvent) => {
    const el = overlayRef.current;
    if (!el) return { px: 0, py: 0 };
    const rect = el.getBoundingClientRect();
    const client = 'touches' in e ? e.touches[0] : e;
    return {
      px: client.clientX - rect.left,
      py: client.clientY - rect.top,
    };
  };

  const applyAspectRatio = useCallback((r: typeof cropPx): typeof cropPx => {
    if (!aspectRatio) return r;
    let { x, y, w, h } = r;
    h = w / aspectRatio;
    if (y + h > containerH) { h = containerH - y; w = h * aspectRatio; }
    if (x + w > containerW) { w = containerW - x; h = w / aspectRatio; }
    w = Math.max(MIN_SIZE, w);
    h = Math.max(MIN_SIZE, h);
    return { x, y, w, h };
  }, [aspectRatio, containerW, containerH]);

  const applyDrag = useCallback((e: MouseEvent | TouchEvent) => {
    const ds = dragState.current;
    if (!ds) return;
    const { px, py } = getPointerPos(e);
    const dx = px - ds.startX;
    const dy = py - ds.startY;
    const { x: sx, y: sy, w: sw, h: sh } = ds.startCrop;

    let nx = sx, ny = sy, nw = sw, nh = sh;

    if (ds.handle === 'move') {
      nx = Math.max(0, Math.min(containerW - sw, sx + dx));
      ny = Math.max(0, Math.min(containerH - sh, sy + dy));
    } else {
      if (ds.handle.includes('e')) { nw = Math.max(MIN_SIZE, Math.min(containerW - sx, sw + dx)); }
      if (ds.handle.includes('w')) { nx = Math.max(0, Math.min(sx + sw - MIN_SIZE, sx + dx)); nw = sw - (nx - sx); }
      if (ds.handle.includes('s')) { nh = Math.max(MIN_SIZE, Math.min(containerH - sy, sh + dy)); }
      if (ds.handle.includes('n')) { ny = Math.max(0, Math.min(sy + sh - MIN_SIZE, sy + dy)); nh = sh - (ny - sy); }
    }

    let next = { x: nx, y: ny, w: nw, h: nh };
    if (aspectRatio && ds.handle !== 'move') {
      next = applyAspectRatio(next);
    }
    onCropChange(next);
  }, [containerW, containerH, aspectRatio, applyAspectRatio, onCropChange]);

  useEffect(() => {
    const onMove = (e: MouseEvent | TouchEvent) => applyDrag(e);
    const onUp = (e: MouseEvent | TouchEvent) => {
      if (!dragState.current) return;
      applyDrag(e);
      const ds = dragState.current;
      dragState.current = null;
      // Commit final state
      const { px, py } = getPointerPos(e as MouseEvent);
      const dx = px - ds.startX;
      const dy = py - ds.startY;
      const { x: sx, y: sy, w: sw, h: sh } = ds.startCrop;
      let nx = sx, ny = sy, nw = sw, nh = sh;
      if (ds.handle === 'move') {
        nx = Math.max(0, Math.min(containerW - sw, sx + dx));
        ny = Math.max(0, Math.min(containerH - sh, sy + dy));
      } else {
        if (ds.handle.includes('e')) { nw = Math.max(MIN_SIZE, Math.min(containerW - sx, sw + dx)); }
        if (ds.handle.includes('w')) { nx = Math.max(0, Math.min(sx + sw - MIN_SIZE, sx + dx)); nw = sw - (nx - sx); }
        if (ds.handle.includes('s')) { nh = Math.max(MIN_SIZE, Math.min(containerH - sy, sh + dy)); }
        if (ds.handle.includes('n')) { ny = Math.max(0, Math.min(sy + sh - MIN_SIZE, sy + dy)); nh = sh - (ny - sy); }
      }
      let next = { x: nx, y: ny, w: nw, h: nh };
      if (aspectRatio && ds.handle !== 'move') next = applyAspectRatio(next);
      onCropCommit(next);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onUp);
    };
  }, [applyDrag, applyAspectRatio, aspectRatio, containerW, containerH, onCropCommit]);

  const startDrag = (handle: HandleId) => (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const el = overlayRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const client = 'touches' in e ? e.touches[0] : e;
    dragState.current = {
      handle,
      startX: client.clientX - rect.left,
      startY: client.clientY - rect.top,
      startCrop: { ...cropPx },
    };
  };

  const { x, y, w, h } = cropPx;
  const HANDLE_SIZE = 10;

  const handles: { id: HandleId; style: React.CSSProperties; cursor: string; ariaLabel: string }[] = [
    { id: 'nw', style: { top: -HANDLE_SIZE/2, left: -HANDLE_SIZE/2 }, cursor: 'nw-resize', ariaLabel: 'Resize top-left' },
    { id: 'n',  style: { top: -HANDLE_SIZE/2, left: w/2-HANDLE_SIZE/2 }, cursor: 'n-resize', ariaLabel: 'Resize top' },
    { id: 'ne', style: { top: -HANDLE_SIZE/2, right: -HANDLE_SIZE/2 }, cursor: 'ne-resize', ariaLabel: 'Resize top-right' },
    { id: 'w',  style: { top: h/2-HANDLE_SIZE/2, left: -HANDLE_SIZE/2 }, cursor: 'w-resize', ariaLabel: 'Resize left' },
    { id: 'e',  style: { top: h/2-HANDLE_SIZE/2, right: -HANDLE_SIZE/2 }, cursor: 'e-resize', ariaLabel: 'Resize right' },
    { id: 'sw', style: { bottom: -HANDLE_SIZE/2, left: -HANDLE_SIZE/2 }, cursor: 'sw-resize', ariaLabel: 'Resize bottom-left' },
    { id: 's',  style: { bottom: -HANDLE_SIZE/2, left: w/2-HANDLE_SIZE/2 }, cursor: 's-resize', ariaLabel: 'Resize bottom' },
    { id: 'se', style: { bottom: -HANDLE_SIZE/2, right: -HANDLE_SIZE/2 }, cursor: 'se-resize', ariaLabel: 'Resize bottom-right' },
  ];

  return (
    <div
      ref={overlayRef}
      className="absolute inset-0 overflow-hidden"
      style={{ width: containerW, height: containerH }}
      aria-label="Crop overlay"
    >
      {/* Dark vignette outside crop box */}
      {/* Top */}
      <div className="absolute bg-black/40 pointer-events-none" style={{ top: 0, left: 0, right: 0, height: y }} />
      {/* Bottom */}
      <div className="absolute bg-black/40 pointer-events-none" style={{ top: y + h, left: 0, right: 0, bottom: 0 }} />
      {/* Left */}
      <div className="absolute bg-black/40 pointer-events-none" style={{ top: y, left: 0, width: x, height: h }} />
      {/* Right */}
      <div className="absolute bg-black/40 pointer-events-none" style={{ top: y, left: x + w, right: 0, height: h }} />

      {/* Crop box */}
      <div
        className="absolute border-2 border-white box-border"
        style={{ left: x, top: y, width: w, height: h, cursor: 'move' }}
        role="slider"
        aria-label="Crop region — drag to move, use arrow keys to nudge"
        tabIndex={0}
        onMouseDown={startDrag('move')}
        onTouchStart={startDrag('move')}
        onKeyDown={handleKeyDown}
      >
        {/* Rule-of-thirds grid lines */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute border-t border-white/30" style={{ top: '33.33%', left: 0, right: 0 }} />
          <div className="absolute border-t border-white/30" style={{ top: '66.66%', left: 0, right: 0 }} />
          <div className="absolute border-l border-white/30" style={{ left: '33.33%', top: 0, bottom: 0 }} />
          <div className="absolute border-l border-white/30" style={{ left: '66.66%', top: 0, bottom: 0 }} />
        </div>

        {/* Corner/edge handles */}
        {handles.map((h) => (
          <div
            key={h.id}
            className="absolute bg-white rounded-sm shadow-sm"
            style={{ width: HANDLE_SIZE, height: HANDLE_SIZE, cursor: h.cursor, ...h.style, zIndex: 10 }}
            role="button"
            aria-label={h.ariaLabel}
            tabIndex={-1}
            onMouseDown={startDrag(h.id)}
            onTouchStart={startDrag(h.id)}
          />
        ))}

        {/* Dimensions badge */}
        <div className="absolute -bottom-7 left-0 pointer-events-none">
          <span className="text-xs bg-black/70 text-white px-1.5 py-0.5 rounded whitespace-nowrap select-none">
            {Math.round(w)} × {Math.round(h)} px
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Coordinate conversion helpers ────────────────────────────────────────────

/**
 * Convert a pixel-space crop rect (top-left origin) to PDF-point-space (bottom-left origin).
 * scale = containerPxWidth / pagePointWidth
 */
export function pxCropToPdfCrop(
  pxCrop: { x: number; y: number; w: number; h: number },
  scale: number,
  pageH: number, // in points
): CropRect {
  const x = pxCrop.x / scale;
  const w = pxCrop.w / scale;
  const h = pxCrop.h / scale;
  // PDF Y = pageH - (px_y + px_h)
  const y = pageH - (pxCrop.y + pxCrop.h) / scale;
  return { x, y, w, h };
}

/**
 * Convert a PDF-point-space crop rect to pixel-space (top-left origin).
 */
export function pdfCropToPxCrop(
  pdfCrop: CropRect,
  scale: number,
  pageH: number, // in points
): { x: number; y: number; w: number; h: number } {
  const x = pdfCrop.x * scale;
  const w = pdfCrop.w * scale;
  const h = pdfCrop.h * scale;
  const y = (pageH - pdfCrop.y - pdfCrop.h) * scale;
  return { x, y, w, h };
}
