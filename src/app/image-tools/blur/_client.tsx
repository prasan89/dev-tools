'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { ImageToolLayout } from '@/components/image-tools/ImageToolLayout';
import { ImageDropzone } from '@/components/image-tools/ImageDropzone';
import { ImageDownloadButton } from '@/components/image-tools/ImageDownloadButton';
import { createObjectUrl, revokeObjectUrl, formatFileSize } from '@/lib/image-tools/engine';

// ─── Types ────────────────────────────────────────────────────────────────────

type BlurMode = 'full' | 'face' | 'manual';
type BlurStyle = 'blur' | 'pixelate';
type OutputFormat = 'jpeg' | 'png' | 'webp';

interface Region {
  id: string;
  // All values 0–1 relative to source image dimensions
  x: number;
  y: number;
  w: number;
  h: number;
  source: 'face' | 'manual';
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function expandBox(
  x: number, y: number, w: number, h: number,
  pct: number,
): { x: number; y: number; w: number; h: number } {
  const pad = pct / 100;
  const nx = Math.max(0, x - w * pad);
  const ny = Math.max(0, y - h * pad);
  const nr = Math.min(1, x + w + w * pad);
  const nb = Math.min(1, y + h + h * pad);
  return { x: nx, y: ny, w: nr - nx, h: nb - ny };
}

function blurRegion(
  ctx: CanvasRenderingContext2D,
  srcBitmap: ImageBitmap,
  region: { x: number; y: number; w: number; h: number },
  imgW: number, imgH: number,
  style: BlurStyle,
  strength: number,
): void {
  const rx = Math.round(region.x * imgW);
  const ry = Math.round(region.y * imgH);
  const rw = Math.max(1, Math.round(region.w * imgW));
  const rh = Math.max(1, Math.round(region.h * imgH));
  if (rw < 1 || rh < 1) return;

  const tmp = document.createElement('canvas');
  tmp.width = rw;
  tmp.height = rh;
  const tc = tmp.getContext('2d');
  if (!tc) return;

  if (style === 'blur') {
    tc.filter = `blur(${strength}px)`;
    tc.drawImage(srcBitmap, rx, ry, rw, rh, 0, 0, rw, rh);
    tc.drawImage(srcBitmap, rx, ry, rw, rh, 0, 0, rw, rh);
  } else {
    const bs = Math.max(1, Math.min(strength * 2, Math.min(rw, rh)));
    const sw = Math.max(1, Math.floor(rw / bs));
    const sh = Math.max(1, Math.floor(rh / bs));
    const tiny = document.createElement('canvas');
    tiny.width = sw;
    tiny.height = sh;
    const tc2 = tiny.getContext('2d');
    if (tc2) {
      tc2.drawImage(srcBitmap, rx, ry, rw, rh, 0, 0, sw, sh);
      tc.imageSmoothingEnabled = false;
      tc.drawImage(tiny, 0, 0, rw, rh);
    }
  }

  ctx.drawImage(tmp, 0, 0, rw, rh, rx, ry, rw, rh);
}

// ─── Overlay canvas ────────────────────────────────────────────────────────────

interface OverlayCanvasProps {
  imageUrl: string;
  imgW: number;
  imgH: number;
  regions: Region[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onAdd: (region: Omit<Region, 'id' | 'source'>) => void;
  onMove: (id: string, dx: number, dy: number) => void;
  disabled?: boolean;
}

function OverlayCanvas({
  imageUrl, imgW, imgH, regions, selectedId,
  onSelect, onAdd, onMove, disabled,
}: OverlayCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const dragging = useRef<{
    id: string | null;
    startX: number; startY: number;
    origX: number; origY: number; origW: number; origH: number;
  } | null>(null);

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img || !img.complete) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const cw = canvas.width;
    const ch = canvas.height;
    ctx.clearRect(0, 0, cw, ch);
    ctx.drawImage(img, 0, 0, cw, ch);

    for (const r of regions) {
      const x = r.x * cw;
      const y = r.y * ch;
      const w = r.w * cw;
      const h = r.h * ch;
      ctx.save();
      ctx.fillStyle = r.source === 'face' ? 'rgba(139,92,246,0.15)' : 'rgba(59,130,246,0.15)';
      ctx.fillRect(x, y, w, h);
      ctx.strokeStyle = r.id === selectedId
        ? '#f59e0b'
        : r.source === 'face' ? '#7c3aed' : '#3b82f6';
      ctx.lineWidth = r.id === selectedId ? 2.5 : 1.5;
      ctx.strokeRect(x, y, w, h);
      ctx.fillStyle = r.id === selectedId ? '#f59e0b' : (r.source === 'face' ? '#7c3aed' : '#3b82f6');
      ctx.font = `bold ${Math.max(10, Math.min(14, h * 0.18))}px system-ui`;
      ctx.fillText(r.source === 'face' ? 'Face' : 'Manual', x + 4, y + 14);
      ctx.restore();
    }
  }, [regions, selectedId]);

  useEffect(() => {
    let cancelled = false;
    const img = new Image();
    img.onload = () => {
      if (cancelled) return;
      imgRef.current = img;
      redraw();
    };
    img.src = imageUrl;
    return () => { cancelled = true; };
  }, [imageUrl]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { redraw(); }, [redraw]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const obs = new ResizeObserver(() => {
      const rect = canvas.getBoundingClientRect();
      if (!rect.width) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const aspect = imgW / imgH;
      const cssH = rect.width / aspect;
      canvas.style.height = `${cssH}px`;
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(cssH * dpr);
      redraw();
    });
    obs.observe(canvas);
    return () => obs.disconnect();
  }, [imgW, imgH, redraw]);

  const toRelative = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    return {
      x: Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)),
      y: Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height)),
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (disabled || e.button !== 0) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    const { x, y } = toRelative(e);
    const hit = [...regions].reverse().find(
      (r) => x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h,
    );
    if (hit) {
      onSelect(hit.id);
      dragging.current = {
        id: hit.id,
        startX: x, startY: y,
        origX: hit.x, origY: hit.y, origW: hit.w, origH: hit.h,
      };
    } else {
      onSelect(null);
      dragging.current = { id: null, startX: x, startY: y, origX: x, origY: y, origW: 0, origH: 0 };
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const d = dragging.current;
    if (!d) return;
    e.preventDefault();
    const { x, y } = toRelative(e);
    if (d.id) {
      const dx = x - d.startX;
      const dy = y - d.startY;
      onMove(d.id, dx, dy);
      d.startX = x;
      d.startY = y;
    } else {
      const canvas = canvasRef.current;
      const img = imgRef.current;
      if (!canvas || !img) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const cw = canvas.width;
      const ch = canvas.height;
      ctx.clearRect(0, 0, cw, ch);
      ctx.drawImage(img, 0, 0, cw, ch);
      for (const r of regions) {
        ctx.strokeStyle = r.source === 'face' ? '#7c3aed' : '#3b82f6';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(r.x * cw, r.y * ch, r.w * cw, r.h * ch);
      }
      const lx = Math.min(d.startX, x) * cw;
      const ly = Math.min(d.startY, y) * ch;
      const lw = Math.abs(x - d.startX) * cw;
      const lh = Math.abs(y - d.startY) * ch;
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 3]);
      ctx.strokeRect(lx, ly, lw, lh);
      ctx.setLineDash([]);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const d = dragging.current;
    dragging.current = null;
    if (!d || d.id) return;
    const { x, y } = toRelative(e);
    const w = Math.abs(x - d.startX);
    const h = Math.abs(y - d.startY);
    if (w < 0.01 || h < 0.01) return;
    onAdd({
      x: Math.min(d.startX, x),
      y: Math.min(d.startY, y),
      w, h,
    });
  };

  return (
    <canvas
      ref={canvasRef}
      className="block w-full rounded-lg cursor-crosshair touch-none select-none"
      style={{ maxHeight: '60vh' }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={() => { dragging.current = null; }}
      role="img"
      aria-label="Image with blur region overlay. Drag to add a manual blur region."
      tabIndex={0}
    />
  );
}

// ─── Main component ────────────────────────────────────────────────────────────

export default function BlurClient() {
  const [file, setFile] = useState<File | null>(null);
  const [source, setSource] = useState('');
  const [output, setOutput] = useState('');
  const [outputBlob, setOutputBlob] = useState<Blob | null>(null);
  const [imgW, setImgW] = useState(0);
  const [imgH, setImgH] = useState(0);
  const [mode, setMode] = useState<BlurMode>('full');
  const [blurStyle, setBlurStyle] = useState<BlurStyle>('blur');
  const [strength, setStrength] = useState(12);
  const [padding, setPadding] = useState(20);
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('jpeg');
  const [regions, setRegions] = useState<Region[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detecting, setDetecting] = useState(false);
  const [detectorState, setDetectorState] = useState<'idle' | 'loading' | 'ready' | 'failed'>('idle');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [statusMsg, setStatusMsg] = useState('');

  const sourceRef = useRef('');
  const outputRef = useRef('');
  const detectorRef = useRef<import('@mediapipe/tasks-vision').FaceDetector | null>(null);
  const bitmapRef = useRef<ImageBitmap | null>(null);

  useEffect(() => () => {
    if (sourceRef.current) revokeObjectUrl(sourceRef.current);
    if (outputRef.current) revokeObjectUrl(outputRef.current);
    bitmapRef.current?.close();
    bitmapRef.current = null;
  }, []);

  const onFiles = useCallback((files: File[]) => {
    const next = files[0];
    if (!next) return;
    if (sourceRef.current) revokeObjectUrl(sourceRef.current);
    if (outputRef.current) revokeObjectUrl(outputRef.current);
    bitmapRef.current?.close();
    bitmapRef.current = null;
    const url = createObjectUrl(next);
    sourceRef.current = url;
    outputRef.current = '';
    setFile(next);
    setSource(url);
    setOutput('');
    setOutputBlob(null);
    setRegions([]);
    setSelectedId(null);
    setError('');
    setStatusMsg('');
    if (next.type === 'image/png') setOutputFormat('png');
    else if (next.type === 'image/webp') setOutputFormat('webp');
    else setOutputFormat('jpeg');
    createImageBitmap(next).then((bm) => {
      setImgW(bm.width);
      setImgH(bm.height);
      bitmapRef.current = bm;
    }).catch(() => setError('Could not decode this image.'));
  }, []);

  const reset = useCallback(() => {
    if (sourceRef.current) revokeObjectUrl(sourceRef.current);
    if (outputRef.current) revokeObjectUrl(outputRef.current);
    bitmapRef.current?.close();
    bitmapRef.current = null;
    sourceRef.current = '';
    outputRef.current = '';
    setFile(null);
    setSource('');
    setOutput('');
    setOutputBlob(null);
    setImgW(0);
    setImgH(0);
    setRegions([]);
    setSelectedId(null);
    setError('');
    setStatusMsg('');
  }, []);

  const loadDetector = useCallback(async () => {
    if (detectorRef.current) return detectorRef.current;
    setDetectorState('loading');
    setStatusMsg('Loading face detection model…');
    try {
      const { FaceDetector, FilesetResolver } = await import('@mediapipe/tasks-vision');
      const vision = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.1.1/wasm',
      );
      const detector = await FaceDetector.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath:
            'https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite',
          delegate: 'CPU',
        },
        runningMode: 'IMAGE',
        minDetectionConfidence: 0.5,
        minSuppressionThreshold: 0.3,
      });
      detectorRef.current = detector;
      setDetectorState('ready');
      setStatusMsg('');
      return detector;
    } catch (e) {
      setDetectorState('failed');
      setStatusMsg('');
      throw new Error(
        'Face detection model failed to load. Check your internet connection and try again. ' +
        (e instanceof Error ? e.message : String(e)),
      );
    }
  }, []);

  const detectFaces = useCallback(async () => {
    if (!file || imgW === 0) return;
    setDetecting(true);
    setError('');
    setStatusMsg('Detecting faces…');
    try {
      const detector = await loadDetector();
      const img = document.createElement('img');
      img.src = sourceRef.current;
      await new Promise<void>((res, rej) => {
        img.onload = () => res();
        img.onerror = () => rej(new Error('Could not load image for detection.'));
      });
      const result = detector.detect(img);
      const detections = result.detections ?? [];
      const newRegions: Region[] = detections.flatMap((d) => {
        const bb = d.boundingBox;
        if (!bb) return [];
        const rel = expandBox(
          bb.originX / imgW,
          bb.originY / imgH,
          bb.width / imgW,
          bb.height / imgH,
          padding,
        );
        return [{
          id: crypto.randomUUID(),
          source: 'face' as const,
          ...rel,
        }];
      });

      setRegions((prev) => [
        ...prev.filter((r) => r.source === 'manual'),
        ...newRegions,
      ]);
      setStatusMsg(
        detections.length === 0
          ? 'No faces detected. You can add manual regions.'
          : `${detections.length} face${detections.length !== 1 ? 's' : ''} detected.`,
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Face detection failed.');
      setStatusMsg('');
    } finally {
      setDetecting(false);
    }
  }, [file, imgW, imgH, padding, loadDetector]);

  const addRegion = useCallback((region: Omit<Region, 'id' | 'source'>) => {
    setRegions((prev) => [
      ...prev,
      { ...region, id: crypto.randomUUID(), source: 'manual' },
    ]);
  }, []);

  const moveRegion = useCallback((id: string, dx: number, dy: number) => {
    setRegions((prev) => prev.map((r) => {
      if (r.id !== id) return r;
      return {
        ...r,
        x: Math.max(0, Math.min(1 - r.w, r.x + dx)),
        y: Math.max(0, Math.min(1 - r.h, r.y + dy)),
      };
    }));
  }, []);

  const removeRegion = useCallback((id: string) => {
    setRegions((prev) => prev.filter((r) => r.id !== id));
    setSelectedId((s) => s === id ? null : s);
  }, []);

  const applyBlur = useCallback(async () => {
    if (!file) return;
    setProcessing(true);
    setError('');
    const bitmap = await createImageBitmap(file).catch(() => null);
    if (!bitmap) {
      setError('Could not decode this image.');
      setProcessing(false);
      return;
    }
    try {
      const { width, height } = bitmap;
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas is not available.');

      if (mode === 'full') {
        if (blurStyle === 'blur') {
          ctx.filter = `blur(${strength}px)`;
          ctx.drawImage(bitmap, 0, 0);
        } else {
          const bs = Math.max(1, strength * 2);
          const sw = Math.max(1, Math.floor(width / bs));
          const sh = Math.max(1, Math.floor(height / bs));
          const tiny = document.createElement('canvas');
          tiny.width = sw;
          tiny.height = sh;
          const tc = tiny.getContext('2d');
          if (tc) { tc.drawImage(bitmap, 0, 0, sw, sh); }
          ctx.imageSmoothingEnabled = false;
          ctx.drawImage(tiny, 0, 0, width, height);
        }
      } else {
        ctx.drawImage(bitmap, 0, 0);
        for (const r of regions) {
          blurRegion(ctx, bitmap, r, width, height, blurStyle, strength);
        }
      }

      const mime =
        outputFormat === 'png' ? 'image/png' :
        outputFormat === 'webp' ? 'image/webp' :
        'image/jpeg';

      const blob = await new Promise<Blob>((resolve, reject) =>
        canvas.toBlob(
          (b) => (b ? resolve(b) : reject(new Error('Could not export image.'))),
          mime, 0.92,
        ),
      );

      if (outputRef.current) revokeObjectUrl(outputRef.current);
      const url = createObjectUrl(blob);
      outputRef.current = url;
      setOutput(url);
      setOutputBlob(blob);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not blur this image.');
    } finally {
      bitmap.close();
      setProcessing(false);
    }
  }, [file, mode, blurStyle, strength, regions, outputFormat]);

  const outputName = file
    ? file.name.replace(/\.[^.]+$/, '') + '-blurred' +
      (outputFormat === 'png' ? '.png' : outputFormat === 'webp' ? '.webp' : '.jpg')
    : '';

  const canApply = mode === 'full' || regions.length > 0;

  return (
    <ImageToolLayout
      title="Blur Image"
      description="Blur entire images, automatically detect and blur faces, or manually select regions to blur. All processing is local — nothing is uploaded."
    >
      <div className="space-y-5">
        {!file && <ImageDropzone onFiles={onFiles} />}

        {file && (
          <>
            {/* File info */}
            <div className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{file.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {imgW > 0 && <>{imgW} × {imgH}px · </>}
                  {formatFileSize(file.size)}
                  {outputBlob && <> · Output: {formatFileSize(outputBlob.size)}</>}
                </p>
              </div>
              <button onClick={reset} className="text-sm text-violet-600 dark:text-violet-400 hover:underline shrink-0">
                Choose another
              </button>
            </div>

            {/* Mode selector */}
            <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4">
              <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3">Blur mode</p>
              <div className="flex flex-wrap gap-2">
                {([
                  { v: 'full' as const, label: 'Blur entire image' },
                  { v: 'face' as const, label: 'Auto-detect faces' },
                  { v: 'manual' as const, label: 'Select regions manually' },
                ]).map(({ v, label }) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => { setMode(v); setOutput(''); setOutputBlob(null); }}
                    className={`rounded-lg border-2 px-3 py-1.5 text-xs font-medium transition-all ${
                      mode === v
                        ? 'border-violet-500 bg-violet-50 dark:bg-violet-950/30 text-violet-700 dark:text-violet-300'
                        : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-violet-300 dark:hover:border-violet-700'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Preview / overlay */}
            <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-4">
              {mode === 'full' ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={output || source}
                  alt="Blur preview"
                  className="w-full max-h-[60vh] object-contain rounded"
                />
              ) : (
                <OverlayCanvas
                  imageUrl={source}
                  imgW={imgW}
                  imgH={imgH}
                  regions={regions}
                  selectedId={selectedId}
                  onSelect={setSelectedId}
                  onAdd={addRegion}
                  onMove={moveRegion}
                  disabled={processing || detecting}
                />
              )}
            </div>

            {/* Output preview (face/manual modes) */}
            {output && mode !== 'full' && (
              <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-4">
                <p className="text-xs font-medium text-gray-500 mb-2">Output preview</p>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={output} alt="Blurred output" className="w-full max-h-[60vh] object-contain rounded" />
              </div>
            )}

            {/* Controls */}
            <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5 space-y-5">
              {/* Face detection controls */}
              {mode === 'face' && (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 flex-wrap">
                    <button
                      type="button"
                      onClick={() => void detectFaces()}
                      disabled={detecting || processing}
                      className="rounded-lg bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 text-sm font-medium transition-colors disabled:opacity-60 flex items-center gap-2"
                    >
                      {detecting && (
                        <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" aria-hidden="true" />
                      )}
                      {detecting ? 'Detecting…' : detectorState === 'loading' ? 'Loading model…' : 'Detect faces'}
                    </button>
                    {detectorState === 'failed' && (
                      <span className="text-xs text-red-600 dark:text-red-400">Model failed — check internet connection</span>
                    )}
                    {statusMsg && !error && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">{statusMsg}</span>
                    )}
                  </div>
                  <div>
                    <label htmlFor="blur-padding" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Bounding box padding: {padding}%
                    </label>
                    <input
                      id="blur-padding"
                      type="range"
                      min={0}
                      max={50}
                      value={padding}
                      onChange={(e) => setPadding(Number(e.target.value))}
                      className="w-full accent-violet-600"
                    />
                    <p className="text-xs text-gray-400 mt-0.5">Expands each detected face box before blurring.</p>
                  </div>
                  <p className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 rounded-lg px-3 py-2">
                    Face detection may miss faces or produce false positives. Review detected regions before exporting.
                    Blur does not guarantee irreversible anonymization.
                  </p>
                </div>
              )}

              {/* Manual mode hint */}
              {mode === 'manual' && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Drag on the preview to add a blur region. Click a region to select it, then drag to move or remove it below.
                </p>
              )}

              {/* Region list */}
              {mode !== 'full' && regions.length > 0 && (
                <div className="space-y-1">
                  <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    Blur regions ({regions.length})
                  </p>
                  {regions.map((r) => (
                    <div
                      key={r.id}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2 text-xs cursor-pointer transition-colors ${
                        r.id === selectedId
                          ? 'bg-amber-50 dark:bg-amber-950/20 border border-amber-300 dark:border-amber-700'
                          : 'bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
                      }`}
                      onClick={() => setSelectedId((s) => s === r.id ? null : r.id)}
                    >
                      <span className={`rounded px-1.5 py-0.5 text-white text-xs ${r.source === 'face' ? 'bg-violet-600' : 'bg-blue-500'}`}>
                        {r.source === 'face' ? 'Face' : 'Manual'}
                      </span>
                      <span className="text-gray-600 dark:text-gray-400 flex-1">
                        {Math.round(r.w * 100)}% × {Math.round(r.h * 100)}%
                        {' at '}({Math.round(r.x * 100)}%, {Math.round(r.y * 100)}%)
                      </span>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); removeRegion(r.id); }}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                        aria-label="Remove region"
                      >
                        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Effect style */}
              <div>
                <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Effect style</p>
                <div className="flex gap-2">
                  {([
                    { v: 'blur' as const, label: 'Gaussian blur' },
                    { v: 'pixelate' as const, label: 'Pixelate' },
                  ]).map(({ v, label }) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setBlurStyle(v)}
                      className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                        blurStyle === v
                          ? 'border-violet-500 bg-violet-50 dark:bg-violet-950/20 text-violet-700 dark:text-violet-300'
                          : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-violet-300'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Strength */}
              <div>
                <label htmlFor="blur-strength" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {blurStyle === 'blur' ? `Blur strength: ${strength}px` : `Pixelation block: ${strength * 2}px`}
                </label>
                <input
                  id="blur-strength"
                  type="range"
                  min={2}
                  max={24}
                  value={strength}
                  onChange={(e) => setStrength(Number(e.target.value))}
                  className="w-full accent-violet-600"
                />
              </div>

              {/* Output format */}
              <div>
                <label htmlFor="blur-fmt" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Output format
                </label>
                <select
                  id="blur-fmt"
                  value={outputFormat}
                  onChange={(e) => setOutputFormat(e.target.value as OutputFormat)}
                  className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                >
                  <option value="jpeg">JPEG</option>
                  <option value="png">PNG</option>
                  <option value="webp">WebP</option>
                </select>
              </div>

              {/* Apply / download */}
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => void applyBlur()}
                  disabled={processing || !canApply}
                  className="rounded-lg bg-violet-600 hover:bg-violet-700 text-white px-5 py-2.5 text-sm font-medium transition-colors disabled:opacity-60 flex items-center gap-2"
                >
                  {processing && (
                    <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" aria-hidden="true" />
                  )}
                  {processing ? 'Processing…' : mode === 'full' ? 'Apply blur' : 'Apply blur to regions'}
                </button>
                {output && (
                  <ImageDownloadButton
                    url={output}
                    filename={outputName}
                    label="Download"
                    size={outputBlob ? formatFileSize(outputBlob.size) : undefined}
                  />
                )}
              </div>

              {!canApply && (
                <p className="text-xs text-gray-400">
                  {mode === 'face'
                    ? 'Run face detection or add manual regions first.'
                    : 'Drag on the preview to add a blur region.'}
                </p>
              )}
            </div>

            {error && (
              <p role="alert" className="rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-700 dark:text-red-400">
                {error}
              </p>
            )}
          </>
        )}

        <section className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5 space-y-3">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Privacy and limitations</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            All image processing and face detection run entirely in your browser using the
            MediaPipe Face Detector model. Your images are never uploaded to any server.
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            The face detection model identifies face regions — it does not perform identity
            recognition. Detection accuracy varies with image quality, angle, lighting, and
            occlusion. Always review detected regions before exporting.
          </p>
          <p className="text-xs text-amber-600 dark:text-amber-400">
            Blur and pixelation are reversible visual effects and may not be sufficient for
            sensitive privacy use cases. For robust anonymization, use opaque masking.
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            The face detection model (~4 MB) is downloaded from Google Storage on first use
            and cached by your browser. Subsequent uses and offline use work without re-downloading.
          </p>
        </section>
      </div>
    </ImageToolLayout>
  );
}
