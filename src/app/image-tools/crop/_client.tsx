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
  const dragging = useRef<{
    startX: number;
    startY: number;
    mode: 'draw' | 'move';
    initSel?: CropSelection;
    initMX?: number;
    initMY?: number;
  } | null>(null);

  function drawOverlay(
    ctx: CanvasRenderingContext2D,
    cw: number,
    ch: number,
    sel: CropSelection | null,
  ) {
    const img = imgRef.current;
    if (!img) return;
    ctx.clearRect(0, 0, cw, ch);
    ctx.drawImage(img, 0, 0, cw, ch);
    if (sel) {
      const x = sel.x * cw;
      const y = sel.y * ch;
      const w = sel.w * cw;
      const h = sel.h * ch;
      ctx.fillStyle = 'rgba(0,0,0,0.45)';
      ctx.fillRect(0, 0, cw, ch);
      ctx.clearRect(x, y, w, h);
      ctx.drawImage(img, x, y, w, h, x, y, w, h);
      ctx.strokeStyle = '#7c3aed';
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, w, h);

      // Rule of thirds guides
      ctx.strokeStyle = 'rgba(255,255,255,0.3)';
      ctx.lineWidth = 1;
      for (let i = 1; i < 3; i++) {
        ctx.beginPath(); ctx.moveTo(x + (w * i) / 3, y); ctx.lineTo(x + (w * i) / 3, y + h); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x, y + (h * i) / 3); ctx.lineTo(x + w, y + (h * i) / 3); ctx.stroke();
      }

      // Corner handles
      const hs = 8;
      ctx.fillStyle = '#7c3aed';
      [[x, y], [x + w - hs, y], [x, y + h - hs], [x + w - hs, y + h - hs]].forEach(([hx, hy]) => {
        ctx.fillRect(hx, hy, hs, hs);
      });
    }
  }

  function redraw(sel: CropSelection | null) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    drawOverlay(ctx, canvas.width, canvas.height, sel);
  }

  // Load image and draw
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const img = new Image();
    img.src = previewUrl;
    imgRef.current = img;
    img.onload = () => {
      const ctx = canvas.getContext('2d')!;
      canvas.width = canvas.offsetWidth;
      canvas.height = (canvas.offsetWidth * naturalH) / naturalW;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      drawOverlay(ctx, canvas.width, canvas.height, selection);
    };
  }, [previewUrl, naturalW, naturalH]); // eslint-disable-line react-hooks/exhaustive-deps

  function clientToRel(e: React.MouseEvent | React.TouchEvent) {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    return {
      rx: Math.max(0, Math.min(1, (clientX - rect.left) / canvas.width)),
      ry: Math.max(0, Math.min(1, (clientY - rect.top) / canvas.height)),
    };
  }

  function clampSel(s: CropSelection): CropSelection {
    const x = Math.max(0, Math.min(s.x, 1 - s.w));
    const y = Math.max(0, Math.min(s.y, 1 - s.h));
    return { ...s, x, y };
  }

  function applyAspect(sel: CropSelection, ratio: number | null): CropSelection {
    if (!ratio) return sel;
    // Adjust height to match ratio (accounting for natural dimensions)
    const pxW = sel.w * naturalW;
    const pxH = pxW / ratio;
    const newH = pxH / naturalH;
    return { ...sel, h: Math.min(newH, 1 - sel.y) };
  }

  function handlePointerDown(e: React.MouseEvent) {
    const { rx, ry } = clientToRel(e);
    const sel = selection;
    // Check if clicking inside existing selection (move mode)
    if (sel && rx >= sel.x && rx <= sel.x + sel.w && ry >= sel.y && ry <= sel.y + sel.h) {
      dragging.current = { startX: rx, startY: ry, mode: 'move', initSel: { ...sel }, initMX: rx, initMY: ry };
    } else {
      dragging.current = { startX: rx, startY: ry, mode: 'draw' };
    }
  }

  function handlePointerMove(e: React.MouseEvent) {
    if (!dragging.current) return;
    const { rx, ry } = clientToRel(e);
    const d = dragging.current;

    if (d.mode === 'move' && d.initSel && d.initMX !== undefined && d.initMY !== undefined) {
      const dx = rx - d.initMX;
      const dy = ry - d.initMY;
      const moved = clampSel({
        ...d.initSel,
        x: d.initSel.x + dx,
        y: d.initSel.y + dy,
      });
      redraw(moved);
      return;
    }

    // draw mode
    const x = Math.min(d.startX, rx);
    const y = Math.min(d.startY, ry);
    const w = Math.max(0.01, Math.abs(rx - d.startX));
    const h = Math.max(0.01, Math.abs(ry - d.startY));
    const newSel = applyAspect(clampSel({ x, y, w, h }), aspectRatio);
    redraw(newSel);
  }

  function handlePointerUp(e: React.MouseEvent) {
    if (!dragging.current) return;
    const { rx, ry } = clientToRel(e);
    const d = dragging.current;
    dragging.current = null;

    if (d.mode === 'move' && d.initSel && d.initMX !== undefined && d.initMY !== undefined) {
      const dx = rx - d.initMX;
      const dy = ry - d.initMY;
      const moved = clampSel({ ...d.initSel, x: d.initSel.x + dx, y: d.initSel.y + dy });
      onSelectionChange(moved);
      return;
    }

    const x = Math.min(d.startX, rx);
    const y = Math.min(d.startY, ry);
    const w = Math.max(0.01, Math.abs(rx - d.startX));
    const h = Math.max(0.01, Math.abs(ry - d.startY));
    const newSel = applyAspect(clampSel({ x, y, w, h }), aspectRatio);
    onSelectionChange(newSel);
  }

  // Re-draw when external selection changes
  useEffect(() => {
    redraw(selection);
  }, [selection]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <canvas
      ref={canvasRef}
      className="w-full rounded-lg cursor-crosshair touch-none select-none"
      style={{ maxHeight: '60vh', objectFit: 'contain' }}
      onMouseDown={handlePointerDown}
      onMouseMove={handlePointerMove}
      onMouseUp={handlePointerUp}
      onMouseLeave={handlePointerUp}
      aria-label="Crop selection canvas — drag to select crop area"
      role="img"
    />
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
    if (imgState) {
      revokeObjectUrl(imgState.previewUrl);
      if (imgState.outputUrl) revokeObjectUrl(imgState.outputUrl);
    }
    setImgState(null);
    setSelection(null);
  }, [imgState]);

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
