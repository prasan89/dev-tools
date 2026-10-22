'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { ImageToolLayout } from '@/components/image-tools/ImageToolLayout';
import { ImageDropzone } from '@/components/image-tools/ImageDropzone';
import { ImageDownloadButton } from '@/components/image-tools/ImageDownloadButton';
import {
  cropImage,
  formatFileSize,
  outputFilename,
  createObjectUrl,
  revokeObjectUrl,
  inspectImage,
} from '@/lib/image-tools/engine';
import type { CropResult, ImageFormat } from '@/lib/image-tools/types';

const ASPECT_PRESETS = [
  { label: 'Free', value: null },
  { label: '1:1', value: 1 },
  { label: '4:3', value: 4 / 3 },
  { label: '16:9', value: 16 / 9 },
  { label: '3:2', value: 3 / 2 },
  { label: '2:3', value: 2 / 3 },
];

interface CropSelection {
  x: number; // 0–1 relative to display canvas
  y: number;
  w: number;
  h: number;
}

interface ImageState {
  file: File;
  previewUrl: string;
  naturalW: number;
  naturalH: number;
  result?: CropResult;
  outputUrl?: string;
}

// ─── Crop canvas component ────────────────────────────────────────────────────

interface CropCanvasProps {
  previewUrl: string;
  naturalW: number;
  naturalH: number;
  aspectRatio: number | null;
  selection: CropSelection | null;
  onSelectionChange: (sel: CropSelection) => void;
}

function clampSelection(selection: CropSelection): CropSelection {
  const w = Math.max(0, Math.min(1, selection.w));
  const h = Math.max(0, Math.min(1, selection.h));
  return {
    x: Math.max(0, Math.min(selection.x, 1 - w)),
    y: Math.max(0, Math.min(selection.y, 1 - h)),
    w,
    h,
  };
}

function selectionFromDrag(
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  naturalW: number,
  naturalH: number,
  aspectRatio: number | null,
): CropSelection {
  const left = Math.min(startX, endX);
  const top = Math.min(startY, endY);
  let width = Math.abs(endX - startX);
  let height = Math.abs(endY - startY);

  if (aspectRatio) {
    // aspectRatio is expressed in output pixels, not display-canvas units.
    const displayRatio = (naturalH / naturalW) * aspectRatio;
    if (width / Math.max(height, 0.0001) > displayRatio) {
      height = width / displayRatio;
    } else {
      width = height * displayRatio;
    }
  }

  width = Math.max(0.005, Math.min(width, 1));
  height = Math.max(0.005, Math.min(height, 1));
  const x = Math.min(left, 1 - width);
  const y = Math.min(top, 1 - height);

  // Refit a preset selection to the canvas bounds without changing its ratio.
  if (aspectRatio) {
    const displayRatio = (naturalH / naturalW) * aspectRatio;
    let fittedW = width;
    let fittedH = height;
    if (x + fittedW > 1) {
      fittedW = 1 - x;
      fittedH = fittedW / displayRatio;
    }
    if (y + fittedH > 1) {
      fittedH = 1 - y;
      fittedW = fittedH * displayRatio;
    }
    width = Math.max(0.005, fittedW);
    height = Math.max(0.005, fittedH);
  }

  return clampSelection({ x, y, w: width, h: height });
}

function CropCanvas({
  previewUrl,
  naturalW,
  naturalH,
  aspectRatio,
  selection,
  onSelectionChange,
}: CropCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const selectionRef = useRef<CropSelection | null>(selection);
  const dragging = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    mode: 'draw' | 'move';
    initial: CropSelection | null;
  } | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    selectionRef.current = selection;
  }, [selection]);

  const drawOverlay = useCallback((sel: CropSelection | null) => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !img || !ctx || !img.complete || !img.naturalWidth) return;

    const cw = canvas.width;
    const ch = canvas.height;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, cw, ch);
    ctx.drawImage(img, 0, 0, cw, ch);

    if (!sel) return;

    const x = sel.x * cw;
    const y = sel.y * ch;
    const w = sel.w * cw;
    const h = sel.h * ch;
    ctx.save();
    ctx.fillStyle = 'rgba(10, 10, 18, 0.52)';
    ctx.fillRect(0, 0, cw, ch);
    ctx.clearRect(x, y, w, h);
    ctx.drawImage(img, x / cw * img.naturalWidth, y / ch * img.naturalHeight,
      w / cw * img.naturalWidth, h / ch * img.naturalHeight, x, y, w, h);
    ctx.strokeStyle = '#7c3aed';
    ctx.lineWidth = Math.max(1.5, (window.devicePixelRatio || 1) * 1.25);
    ctx.strokeRect(x, y, w, h);

    ctx.strokeStyle = 'rgba(255,255,255,.5)';
    ctx.lineWidth = Math.max(1, window.devicePixelRatio || 1);
    for (let i = 1; i < 3; i += 1) {
      ctx.beginPath();
      ctx.moveTo(x + (w * i) / 3, y);
      ctx.lineTo(x + (w * i) / 3, y + h);
      ctx.moveTo(x, y + (h * i) / 3);
      ctx.lineTo(x + w, y + (h * i) / 3);
      ctx.stroke();
    }
    const handle = 7 * (window.devicePixelRatio || 1);
    ctx.fillStyle = '#7c3aed';
    [[x, y], [x + w - handle, y], [x, y + h - handle], [x + w - handle, y + h - handle]].forEach(([hx, hy]) => {
      ctx.fillRect(hx, hy, handle, handle);
    });
    ctx.restore();
  }, []);

  useEffect(() => {
    let cancelled = false;
    const img = new Image();
    img.onload = () => {
      if (cancelled) return;
      imgRef.current = img;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const cssWidth = canvas.clientWidth || Math.min(naturalW, 900);
      const cssHeight = (cssWidth * naturalH) / naturalW;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.style.aspectRatio = `${naturalW} / ${naturalH}`;
      canvas.style.height = `${cssHeight}px`;
      canvas.width = Math.max(1, Math.round(cssWidth * dpr));
      canvas.height = Math.max(1, Math.round(cssHeight * dpr));
      drawOverlay(selectionRef.current);
      setReady(true);
    };
    img.onerror = () => {
      if (!cancelled) setReady(false);
    };
    img.src = previewUrl;
    return () => {
      cancelled = true;
      img.onload = null;
      img.onerror = null;
    };
  }, [previewUrl, naturalW, naturalH, drawOverlay]);

  useEffect(() => {
    if (!ready) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Update the backing bitmap on resize; coordinate calculations remain in CSS pixels.
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const nextW = Math.max(1, Math.round(rect.width * dpr));
      const nextH = Math.max(1, Math.round(rect.height * dpr));
      if (canvas.width !== nextW || canvas.height !== nextH) {
        canvas.width = nextW;
        canvas.height = nextH;
      }
      drawOverlay(selectionRef.current);
    };
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    resize();
    return () => observer.disconnect();
  }, [ready, drawOverlay]);

  useEffect(() => {
    drawOverlay(selection);
    selectionRef.current = selection;
  }, [selection, drawOverlay]);

  const pointerToRelative = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    if (!rect.width || !rect.height) return { x: 0, y: 0 };
    return {
      x: Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width)),
      y: Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height)),
    };
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!ready || event.button !== 0) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    const point = pointerToRelative(event);
    const current = selectionRef.current;
    const inside = current &&
      point.x >= current.x && point.x <= current.x + current.w &&
      point.y >= current.y && point.y <= current.y + current.h;
    dragging.current = {
      pointerId: event.pointerId,
      startX: point.x,
      startY: point.y,
      mode: inside ? 'move' : 'draw',
      initial: current ? { ...current } : null,
    };
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const drag = dragging.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    event.preventDefault();
    const point = pointerToRelative(event);
    let next: CropSelection;
    if (drag.mode === 'move' && drag.initial) {
      next = clampSelection({
        ...drag.initial,
        x: drag.initial.x + point.x - drag.startX,
        y: drag.initial.y + point.y - drag.startY,
      });
    } else {
      next = selectionFromDrag(drag.startX, drag.startY, point.x, point.y, naturalW, naturalH, aspectRatio);
    }
    selectionRef.current = next;
    drawOverlay(next);
  };

  const finishPointer = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const drag = dragging.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const point = pointerToRelative(event);
    dragging.current = null;
    let next: CropSelection;
    if (drag.mode === 'move' && drag.initial) {
      next = clampSelection({
        ...drag.initial,
        x: drag.initial.x + point.x - drag.startX,
        y: drag.initial.y + point.y - drag.startY,
      });
    } else {
      next = selectionFromDrag(drag.startX, drag.startY, point.x, point.y, naturalW, naturalH, aspectRatio);
    }
    selectionRef.current = next;
    drawOverlay(next);
    onSelectionChange(next);
  };

  return (
    <div className="w-full">
      <canvas
        ref={canvasRef}
        className="block w-full max-w-full rounded-lg cursor-crosshair touch-none select-none"
        style={{ maxHeight: '60vh' }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={finishPointer}
        onPointerCancel={finishPointer}
        aria-label="Crop selection canvas — drag to select or move the crop area"
        role="img"
        tabIndex={0}
      />
      {!ready && <p className="mt-2 text-xs text-gray-500" role="status">Loading image preview…</p>}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function CropClient() {
  const [imgState, setImgState] = useState<ImageState | null>(null);
  const [selection, setSelection] = useState<CropSelection | null>(null);
  const [aspectPreset, setAspectPreset] = useState<number | null>(null);
  const [outputFormat, setOutputFormat] = useState<ImageFormat>('jpeg');
  const [cropX, setCropX] = useState('');
  const [cropY, setCropY] = useState('');
  const [cropW, setCropW] = useState('');
  const [cropH, setCropH] = useState('');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  const cleanup = useCallback(() => {
    setImgState((current) => {
      if (current) {
        revokeObjectUrl(current.previewUrl);
        if (current.outputUrl) revokeObjectUrl(current.outputUrl);
      }
      return null;
    });
    setSelection(null);
    setCropX('');
    setCropY('');
    setCropW('');
    setCropH('');
    setError('');
  }, []);

  useEffect(() => () => {
    if (imgState) {
      revokeObjectUrl(imgState.previewUrl);
      if (imgState.outputUrl) revokeObjectUrl(imgState.outputUrl);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleFiles = useCallback(async (incoming: File[]) => {
    const f = incoming[0];
    if (!f) return;
    if (imgState) {
      revokeObjectUrl(imgState.previewUrl);
      if (imgState.outputUrl) revokeObjectUrl(imgState.outputUrl);
    }
    const url = createObjectUrl(f);
    try {
      const info = await inspectImage(f);
      setImgState({ file: f, previewUrl: url, naturalW: info.width, naturalH: info.height });
      setSelection(null);
      setOutputFormat(info.format);
      setError('');
    } catch (e) {
      revokeObjectUrl(url);
      setError(e instanceof Error ? e.message : 'Failed to read image.');
    }
  }, [imgState]);

  const syncCoordsFromSelection = useCallback(
    (sel: CropSelection | null) => {
      if (!sel || !imgState) return;
      const { naturalW: nw, naturalH: nh } = imgState;
      setCropX(String(Math.round(sel.x * nw)));
      setCropY(String(Math.round(sel.y * nh)));
      setCropW(String(Math.round(sel.w * nw)));
      setCropH(String(Math.round(sel.h * nh)));
    },
    [imgState],
  );

  const handleSelectionChange = useCallback(
    (sel: CropSelection) => {
      setSelection(sel);
      syncCoordsFromSelection(sel);
    },
    [syncCoordsFromSelection],
  );

  const applyNumericCoords = useCallback(() => {
    if (!imgState) return;
    const { naturalW: nw, naturalH: nh } = imgState;
    const x = parseInt(cropX, 10);
    const y = parseInt(cropY, 10);
    const w = parseInt(cropW, 10);
    const h = parseInt(cropH, 10);
    if ([x, y, w, h].some(isNaN) || w <= 0 || h <= 0) {
      setError('Invalid crop coordinates.');
      return;
    }
    if (x + w > nw || y + h > nh) {
      setError('Crop area exceeds image bounds.');
      return;
    }
    setError('');
    setSelection({ x: x / nw, y: y / nh, w: w / nw, h: h / nh });
  }, [cropX, cropY, cropW, cropH, imgState]);

  const handleCrop = useCallback(async () => {
    if (!imgState || !selection) return;
    setProcessing(true);
    setError('');
    const { naturalW: nw, naturalH: nh } = imgState;
    try {
      const result = await cropImage(imgState.file, {
        x: Math.round(selection.x * nw),
        y: Math.round(selection.y * nh),
        width: Math.max(1, Math.round(selection.w * nw)),
        height: Math.max(1, Math.round(selection.h * nh)),
        outputFormat,
      });
      const outputUrl = createObjectUrl(result.blob);
      if (imgState.outputUrl) revokeObjectUrl(imgState.outputUrl);
      setImgState((prev) => prev ? { ...prev, result, outputUrl } : prev);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Crop failed.');
    }
    setProcessing(false);
  }, [imgState, selection, outputFormat]);

  const selectionPx = useMemo(() => {
    if (!selection || !imgState) return null;
    return {
      x: Math.round(selection.x * imgState.naturalW),
      y: Math.round(selection.y * imgState.naturalH),
      w: Math.round(selection.w * imgState.naturalW),
      h: Math.round(selection.h * imgState.naturalH),
    };
  }, [selection, imgState]);

  return (
    <ImageToolLayout
      title="Crop Image"
      description="Select a crop area interactively or enter exact pixel coordinates. Supports freeform and preset aspect ratios."
    >
      {!imgState ? (
        <ImageDropzone onFiles={handleFiles} multiple={false} />
      ) : (
        <div className="space-y-4">
          {/* Canvas */}
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 overflow-hidden">
            <CropCanvas
              previewUrl={imgState.previewUrl}
              naturalW={imgState.naturalW}
              naturalH={imgState.naturalH}
              aspectRatio={aspectPreset}
              selection={selection}
              onSelectionChange={handleSelectionChange}
            />
            <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
              {imgState.naturalW} × {imgState.naturalH}px original · drag to select crop area
              {selectionPx && (
                <> · selection: {selectionPx.w}×{selectionPx.h}px at ({selectionPx.x}, {selectionPx.y})</>
              )}
            </p>
          </div>

          {/* Controls */}
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5 space-y-5">
            {/* Aspect ratio presets */}
            <div>
              <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Aspect ratio</p>
              <div className="flex flex-wrap gap-2">
                {ASPECT_PRESETS.map((p) => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => setAspectPreset(p.value)}
                    className={`rounded-md border-2 px-3 py-1 text-xs font-medium transition-all ${
                      aspectPreset === p.value
                        ? 'border-violet-500 bg-violet-50 dark:bg-violet-950/30 text-violet-700 dark:text-violet-300'
                        : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-violet-300 dark:hover:border-violet-700'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Numeric coords */}
            <div>
              <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Exact coordinates (pixels)</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'cx', label: 'X', val: cropX, set: setCropX },
                  { id: 'cy', label: 'Y', val: cropY, set: setCropY },
                  { id: 'cw', label: 'Width', val: cropW, set: setCropW },
                  { id: 'ch', label: 'Height', val: cropH, set: setCropH },
                ].map(({ id, label, val, set }) => (
                  <div key={id}>
                    <label htmlFor={id} className="block text-xs text-gray-500 mb-1">{label}</label>
                    <input
                      id={id}
                      type="number"
                      min={0}
                      value={val}
                      onChange={(e) => set(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                    />
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={applyNumericCoords}
                className="mt-2 text-xs text-violet-600 dark:text-violet-400 hover:underline"
              >
                Apply coordinates
              </button>
            </div>

            {/* Output format */}
            <div>
              <label htmlFor="cropFmt" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Output format</label>
              <select
                id="cropFmt"
                value={outputFormat}
                onChange={(e) => setOutputFormat(e.target.value as ImageFormat)}
                className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              >
                <option value="jpeg">JPEG</option>
                <option value="png">PNG</option>
                <option value="webp">WebP</option>
              </select>
            </div>
          </div>

          {error && (
            <p className="text-xs text-red-600 dark:text-red-400 rounded-lg bg-red-50 dark:bg-red-950/20 px-4 py-3 border border-red-200 dark:border-red-800" role="alert">{error}</p>
          )}

          {/* Result preview */}
          {imgState.result && imgState.outputUrl && (
            <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 space-y-3">
              <p className="text-xs font-medium text-gray-700 dark:text-gray-300">Result preview</p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imgState.outputUrl}
                alt="Cropped image preview"
                className="max-w-full rounded-lg border border-gray-100 dark:border-gray-700"
                style={{ maxHeight: '40vh' }}
              />
              <p className="text-xs text-gray-500">
                {imgState.result.outputWidth} × {imgState.result.outputHeight}px · {formatFileSize(imgState.result.blob.size)}
              </p>
              <ImageDownloadButton
                url={imgState.outputUrl}
                filename={outputFilename(imgState.file.name, imgState.result.format, '_cropped')}
                label="Download cropped image"
                size={formatFileSize(imgState.result.blob.size)}
              />
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            {selection && !processing && (
              <button
                type="button"
                onClick={handleCrop}
                className="rounded-lg bg-violet-600 hover:bg-violet-700 text-white px-5 py-2.5 text-sm font-medium transition-colors"
              >
                Crop image
              </button>
            )}
            {processing && (
              <div className="flex items-center gap-2 text-sm text-gray-500" role="status">
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-violet-600 border-t-transparent" aria-hidden="true" />
                Processing…
              </div>
            )}
            {!selection && (
              <p className="text-xs text-gray-400 self-center">Drag on the image to select a crop area.</p>
            )}
            <button
              type="button"
              onClick={() => { setSelection(null); syncCoordsFromSelection(null); }}
              className="rounded-lg text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 px-5 py-2.5 text-sm transition-colors"
            >
              Reset selection
            </button>
            <button
              type="button"
              onClick={cleanup}
              className="rounded-lg text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 px-5 py-2.5 text-sm transition-colors"
            >
              Load different image
            </button>
          </div>
        </div>
      )}
    </ImageToolLayout>
  );
}
