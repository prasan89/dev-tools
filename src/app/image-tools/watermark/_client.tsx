'use client';

import { useEffect, useState } from 'react';
import { ImageToolLayout } from '@/components/image-tools/ImageToolLayout';
import { ImageDropzone } from '@/components/image-tools/ImageDropzone';
import { ImageDownloadButton } from '@/components/image-tools/ImageDownloadButton';
import { createObjectUrl, revokeObjectUrl } from '@/lib/image-tools/engine';

export default function WatermarkClient() {
  const [file, setFile] = useState<File | null>(null);
  const [source, setSource] = useState('');
  const [text, setText] = useState('© Your Brand');
  const [color, setColor] = useState('#ffffff');
  const [opacity, setOpacity] = useState(65);
  const [size, setSize] = useState(36);
  const [position, setPosition] = useState('bottom-right');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');

  useEffect(() => () => { if (source) revokeObjectUrl(source); if (output) revokeObjectUrl(output); }, [source, output]);

  const process = async () => {
    if (!file || !text.trim()) { setError('Choose an image and enter watermark text.'); return; }
    setError('');
    try {
      const bitmap = await createImageBitmap(file);
      try {
        const canvas = document.createElement('canvas'); canvas.width = bitmap.width; canvas.height = bitmap.height;
        const ctx = canvas.getContext('2d'); if (!ctx) throw new Error('Canvas is not available.');
        ctx.drawImage(bitmap, 0, 0);
        const px = Math.max(8, Math.round(size * Math.min(bitmap.width, bitmap.height) / 800));
        ctx.font = '600 ' + px + 'px Arial, sans-serif';
        ctx.fillStyle = color; ctx.globalAlpha = opacity / 100;
        ctx.textBaseline = 'middle';
        const metrics = ctx.measureText(text);
        const pad = Math.max(12, px * 0.6);
        let x = pad, y = bitmap.height - pad;
        if (position.includes('right')) x = bitmap.width - metrics.width - pad;
        if (position.includes('center')) { x = (bitmap.width - metrics.width) / 2; y = bitmap.height / 2; }
        if (position.includes('top')) y = pad + px / 2;
        ctx.fillText(text, Math.max(0, x), Math.max(px / 2, y));
        const mime = file.type === 'image/png' || file.type === 'image/webp' ? file.type : 'image/jpeg';
        const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob(b => b ? resolve(b) : reject(new Error('Could not export image.')), mime, 0.92));
        if (output) revokeObjectUrl(output);
        setOutput(createObjectUrl(blob));
      } finally { bitmap.close(); }
    } catch (e) { setError(e instanceof Error ? e.message : 'Watermark failed.'); }
  };

  const onFiles = (files: File[]) => {
    const next = files[0]; if (!next) return;
    if (source) revokeObjectUrl(source); if (output) revokeObjectUrl(output);
    setFile(next); setSource(createObjectUrl(next)); setOutput(''); setError('');
  };

  return <ImageToolLayout title="Watermark Image" description="Add a customizable text watermark to protect or brand your images. Everything runs locally in your browser.">
    <div className="space-y-5">
      {!file && <ImageDropzone onFiles={onFiles} />}
      {file && <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900"><span className="truncate text-sm">{file.name}</span><button className="text-sm text-violet-600" onClick={() => { if(source) revokeObjectUrl(source); if(output) revokeObjectUrl(output); setFile(null); setSource(''); setOutput(''); }}>Choose another image</button></div>}
      {source && <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px]"><div className="flex min-h-64 items-center justify-center rounded-xl border border-gray-200 bg-gray-100 p-4 dark:border-gray-700 dark:bg-gray-800"><img src={output || source} alt="Watermarked image preview" className="max-h-[600px] max-w-full object-contain" /></div>
      <section className="space-y-4 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
        <label className="block text-sm">Watermark text<input value={text} onChange={e=>setText(e.target.value)} maxLength={120} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-800" /></label>
        <label className="block text-sm">Color<input type="color" value={color} onChange={e=>setColor(e.target.value)} className="mt-1 h-10 w-full" /></label>
        <label className="block text-sm">Opacity: {opacity}%<input type="range" min="10" max="100" value={opacity} onChange={e=>setOpacity(Number(e.target.value))} className="mt-2 w-full" /></label>
        <label className="block text-sm">Size<input type="range" min="12" max="72" value={size} onChange={e=>setSize(Number(e.target.value))} className="mt-2 w-full" /></label>
        <label className="block text-sm">Position<select value={position} onChange={e=>setPosition(e.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-800"><option value="top-left">Top left</option><option value="top-right">Top right</option><option value="center">Center</option><option value="bottom-left">Bottom left</option><option value="bottom-right">Bottom right</option></select></label>
        <button onClick={() => void process()} className="w-full rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-700">Apply watermark</button>
        {output && <ImageDownloadButton url={output} filename={file.name.replace(/\.[^.]+$/, '') + '-watermarked.' + (file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg')} className="w-full justify-center" />}
        {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
      </section></div>}
      <p className="text-xs text-gray-500">For best results, choose a watermark color with enough contrast. Image files are never uploaded.</p>
    </div>
  </ImageToolLayout>;
}
