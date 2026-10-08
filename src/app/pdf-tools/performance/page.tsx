import type { Metadata } from 'next';
import { pdfToolMetadata } from '@/lib/seo/pdf-tools';

export const metadata: Metadata = pdfToolMetadata('performance') ?? {};

export default function PerformancePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
        Fast, Free &amp; Private PDF Tools
      </h1>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Every PDF operation runs directly in your browser — no uploads, no servers, complete
        privacy. Here is how we keep things fast.
      </p>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-gray-800 dark:text-gray-200">Lazy loading</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          PDF.js, OCR (Tesseract WASM), DOCX/XLSX/PPTX libraries and image codecs are loaded only
          when you open the tool that needs them. The initial page load stays lean.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-gray-800 dark:text-gray-200">Web Workers</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Heavy operations — OCR, batch processing, image conversion, ZIP generation — run inside
          Web Workers so the browser UI never freezes. ArrayBuffers are transferred (not copied)
          between threads where possible.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-gray-800 dark:text-gray-200">Memory management</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Pages are rendered one at a time. Canvas and image buffers are released as soon as they
          are no longer needed. Object URLs are revoked promptly to prevent leaks.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-gray-800 dark:text-gray-200">Privacy guarantee</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Your PDF files are processed locally in your browser and are not uploaded to any server.
          No document contents, extracted text or passwords leave your device.
        </p>
      </section>
    </div>
  );
}
