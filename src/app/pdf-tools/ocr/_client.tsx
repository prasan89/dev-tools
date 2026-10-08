'use client';

import { useState, useRef } from 'react';
import { recognizeImage } from '@/lib/pdf/ocrEngine';
import type { OcrLanguage, OcrResult } from '@/lib/pdf/ocrEngine';

const LANGUAGE_OPTIONS: { value: OcrLanguage; label: string }[] = [
  { value: 'eng', label: 'English' },
  { value: 'fra', label: 'French' },
  { value: 'deu', label: 'German' },
  { value: 'spa', label: 'Spanish' },
  { value: 'ita', label: 'Italian' },
  { value: 'por', label: 'Portuguese' },
  { value: 'chi_sim', label: 'Chinese (Simplified)' },
];

export default function OcrPage() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [language, setLanguage] = useState<OcrLanguage>('eng');
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<OcrResult | null>(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (file: File) => {
    setImageFile(file);
    setResult(null);
    setError('');
    const url = URL.createObjectURL(file);
    setImagePreview(url);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFileChange(file);
  };

  const handleRecognize = async () => {
    if (!imageFile) return;
    setProcessing(true);
    setProgress(0);
    setError('');
    setResult(null);
    try {
      const res = await recognizeImage(imageFile, language);
      if (res.success && res.result) {
        setResult(res.result);
      } else {
        setError(res.error ?? 'OCR failed');
      }
    } finally {
      setProcessing(false);
      setProgress(100);
    }
  };

  const handleCopy = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(result.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">OCR — Image to Text</h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Extract text from images using Optical Character Recognition. All processing happens in your browser.
        </p>
      </div>

      {/* Dropzone */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => inputRef.current?.click()}
        role="button"
        aria-label="Upload image for OCR"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
        className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/50 p-10 cursor-pointer hover:border-blue-400 transition-colors"
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/tiff"
          className="hidden"
          onChange={(e) => { if (e.target.files?.[0]) handleFileChange(e.target.files[0]); }}
        />
        {imagePreview ? (
          <img src={imagePreview} alt="Selected image preview" className="max-h-48 rounded object-contain" />
        ) : (
          <>
            <svg className="h-10 w-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-sm text-gray-600 dark:text-gray-400">Drop an image or click to upload</p>
            <p className="text-xs text-gray-500 dark:text-gray-500">PNG, JPEG, WebP, TIFF</p>
          </>
        )}
      </div>

      {imageFile && (
        <p className="text-xs text-gray-500 dark:text-gray-400">{imageFile.name} — {(imageFile.size / 1024).toFixed(1)} KB</p>
      )}

      {/* Language selector */}
      <div className="flex items-center gap-3">
        <label htmlFor="lang-select" className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
          Language:
        </label>
        <select
          id="lang-select"
          value={language}
          onChange={(e) => setLanguage(e.target.value as OcrLanguage)}
          className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {LANGUAGE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* Progress */}
      {processing && (
        <div className="space-y-1">
          <p className="text-sm text-gray-600 dark:text-gray-400">Recognizing text…</p>
          <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
              role="progressbar"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
        </div>
      )}

      <button
        onClick={handleRecognize}
        disabled={!imageFile || processing}
        className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {processing ? 'Processing…' : 'Extract Text'}
      </button>

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">{error}</p>
      )}

      {result && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Confidence: <span className="font-medium">{result.confidence.toFixed(1)}%</span>
              {' · '}
              {result.words.length} words detected
            </p>
            <button
              onClick={handleCopy}
              className="text-xs rounded-md bg-gray-100 dark:bg-gray-700 px-3 py-1.5 font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              {copied ? 'Copied!' : 'Copy to Clipboard'}
            </button>
          </div>
          <textarea
            readOnly
            value={result.text}
            rows={10}
            aria-label="Extracted text"
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      )}
    </div>
  );
}
