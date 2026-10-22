'use client';

import { useCallback, useRef, useState } from 'react';

interface BeforeAfterSliderProps {
  beforeUrl: string;
  afterUrl: string;
  beforeLabel?: string;
  afterLabel?: string;
  alt?: string;
}

/**
 * Drag-based before/after image comparison slider.
 * Uses CSS clip-path so no canvas needed.
 */
export function BeforeAfterSlider({
  beforeUrl,
  afterUrl,
  beforeLabel = 'Before',
  afterLabel = 'After',
  alt = '',
}: BeforeAfterSliderProps) {
  const [position, setPosition] = useState(50); // 0–100
  const containerRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const updatePosition = useCallback((clientX: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const pct = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
    setPosition(pct);
  }, []);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    dragging.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    updatePosition(e.clientX);
  }, [updatePosition]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging.current) return;
    updatePosition(e.clientX);
  }, [updatePosition]);

  const handlePointerUp = useCallback(() => {
    dragging.current = false;
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full select-none overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 cursor-col-resize"
      style={{ userSelect: 'none' }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      aria-label={`Before/after comparison. Drag to compare.`}
      role="img"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={beforeUrl}
        alt={alt}
        draggable={false}
        className="block w-full h-auto pointer-events-none"
      />

      {/* After image clipped to right side */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ clipPath: `inset(0 0 0 ${position}%)` }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={afterUrl}
          alt=""
          aria-hidden="true"
          draggable={false}
          className="block w-full h-auto pointer-events-none"
        />
      </div>

      {/* Divider line */}
      <div
        className="absolute inset-y-0 w-0.5 bg-white shadow-md pointer-events-none"
        style={{ left: `${position}%`, transform: 'translateX(-50%)' }}
      >
        {/* Handle */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-white shadow-lg border border-gray-200 flex items-center justify-center">
          <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l-3 3 3 3M16 9l3 3-3 3" />
          </svg>
        </div>
      </div>

      {/* Labels */}
      <div className="absolute bottom-2 left-2 rounded bg-black/60 px-2 py-0.5 text-xs text-white pointer-events-none" aria-hidden="true">
        {beforeLabel}
      </div>
      <div className="absolute bottom-2 right-2 rounded bg-black/60 px-2 py-0.5 text-xs text-white pointer-events-none" aria-hidden="true">
        {afterLabel}
      </div>
    </div>
  );
}
