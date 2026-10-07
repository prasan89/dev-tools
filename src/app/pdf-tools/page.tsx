import type { Metadata } from 'next';
import Link from 'next/link';
import { siteUrl } from '@/lib/seo/site-config';

export const metadata: Metadata = {
  title: 'PDF Tools — Free Online PDF Utilities | DevToolsHub',
  description:
    'Free online PDF tools that run entirely in your browser. View, inspect, and work with PDF files — no uploads, no servers, complete privacy.',
  alternates: {
    canonical: siteUrl('/pdf-tools'),
  },
  openGraph: {
    title: 'PDF Tools — Free Online PDF Utilities | DevToolsHub',
    description:
      'Free online PDF tools that run entirely in your browser. View, inspect, and work with PDF files — no uploads, no servers, complete privacy.',
    url: siteUrl('/pdf-tools'),
    siteName: 'DevToolsHub',
    type: 'website',
  },
};

const UPCOMING_TOOLS = [
  {
    title: 'PDF Viewer',
    description: 'View and navigate PDF files directly in your browser.',
    href: '/pdf-tools/viewer',
    available: true,
  },
  {
    title: 'Merge PDF',
    description: 'Combine multiple PDF files into one document.',
    href: '/pdf-tools/merge-pdf',
    available: true,
  },
  {
    title: 'Split PDF',
    description: 'Extract pages, split by range, or separate every page into its own file.',
    href: '/pdf-tools/split-pdf',
    available: true,
  },
  {
    title: 'Compress PDF',
    description: 'Reduce PDF file size using browser-based structural optimization.',
    href: '/pdf-tools/compress-pdf',
    available: true,
  },
  {
    title: 'PDF to Images',
    description: 'Export PDF pages as JPG or PNG images at custom resolution.',
    href: '/pdf-tools/pdf-to-jpg',
    available: true,
  },
  {
    title: 'JPG / PNG to PDF',
    description: 'Convert JPG and PNG images to PDF. Combine multiple images into one document.',
    href: '/pdf-tools/jpg-png-to-pdf',
    available: true,
  },
  {
    title: 'Organize PDF',
    description: 'Rotate, delete, and reorder PDF pages. Drag and drop to rearrange.',
    href: '/pdf-tools/organize-pdf',
    available: true,
  },
  {
    title: 'Crop PDF',
    description: 'Visually crop PDF pages to remove margins or whitespace.',
    href: '/pdf-tools/crop-pdf',
    available: true,
  },
  {
    title: 'Extract Pages',
    description: 'Extract specific pages or page ranges from a PDF into a new file.',
    href: '/pdf-tools/extract-pages',
    available: true,
  },
  {
    title: 'Edit PDF',
    description: 'Add text, images, shapes, highlights, and annotations to any PDF page.',
    href: '/pdf-tools/edit-pdf',
    available: true,
  },
  {
    title: 'Fill PDF Form',
    description: 'Fill AcroForm PDF fields — text, checkboxes, radio buttons, and dropdowns.',
    href: '/pdf-tools/fill-pdf',
    available: true,
  },
  {
    title: 'Create PDF Form',
    description: 'Add interactive form fields to any PDF — text boxes, checkboxes, radio buttons, and dropdowns.',
    href: '/pdf-tools/create-pdf-form',
    available: true,
  },
  {
    title: 'PDF Watermark',
    description: 'Add text or image watermarks to PDF pages.',
    href: '/pdf-tools/watermark-pdf',
    available: true,
  },
  {
    title: 'Add Page Numbers',
    description: 'Add customizable page numbers to any PDF — choose format, position, font, and page selection.',
    href: '/pdf-tools/page-numbers',
    available: true,
  },
  {
    title: 'PDF Metadata Editor',
    description: 'View, edit, or remove PDF document properties — title, author, subject, keywords, and dates.',
    href: '/pdf-tools/pdf-metadata',
    available: true,
  },
  {
    title: 'Password Protect PDF',
    description: 'Add a password to your PDF to prevent unauthorized access. 100% browser-based.',
    href: '/pdf-tools/protect-pdf',
    available: true,
  },
  {
    title: 'Unlock PDF',
    description: 'Remove the password from a PDF you own. Enter your password and export a decrypted copy.',
    href: '/pdf-tools/unlock-pdf',
    available: true,
  },
];

export default function PdfToolsPage() {
  const available = UPCOMING_TOOLS.filter((t) => t.available);
  const upcoming = UPCOMING_TOOLS.filter((t) => !t.available);

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Hero */}
      <section>
        <div className="flex items-center gap-3 mb-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400" aria-hidden="true">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </span>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">PDF Tools</h1>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 max-w-2xl">
          Free PDF utilities that run entirely in your browser. Your files never leave your device — no uploads, no servers, no accounts required.
        </p>

        {/* Privacy badge */}
        <aside
          className="mt-4 inline-flex items-center gap-2 rounded-lg border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/20 px-3 py-2 text-xs text-green-800 dark:text-green-400"
          role="note"
          aria-label="Privacy notice"
        >
          <svg className="h-3.5 w-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          100% browser-based — PDFs are never uploaded to our servers
        </aside>
      </section>

      {/* Available tools */}
      {available.length > 0 && (
        <section aria-labelledby="available-heading">
          <h2
            id="available-heading"
            className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400"
          >
            Available Now
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {available.map((tool) => (
              <Link
                key={tool.href}
                href={tool.href}
                className="group flex flex-col gap-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-sm transition-all"
              >
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400" aria-hidden="true">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </span>
                  <span className="font-medium text-sm text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {tool.title}
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">{tool.description}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Coming soon */}
      <section aria-labelledby="upcoming-heading">
        <h2
          id="upcoming-heading"
          className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400"
        >
          Coming Soon
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {upcoming.map((tool) => (
            <div
              key={tool.href}
              className="flex flex-col gap-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 p-4 opacity-60"
              aria-label={`${tool.title} — coming soon`}
            >
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600" aria-hidden="true">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </span>
                <span className="font-medium text-sm text-gray-700 dark:text-gray-400">{tool.title}</span>
                <span className="ml-auto rounded-full bg-gray-100 dark:bg-gray-800 px-2 py-0.5 text-xs text-gray-500 dark:text-gray-500">Soon</span>
              </div>
              <p className="text-xs text-gray-400 dark:text-gray-500">{tool.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Why browser-based */}
      <section className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6">
        <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4">Why browser-based PDF tools?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="font-medium text-gray-800 dark:text-gray-200 mb-1">Complete privacy</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Your PDF files never leave your device. No uploads, no cloud storage, no risk of data leaks.</p>
          </div>
          <div>
            <p className="font-medium text-gray-800 dark:text-gray-200 mb-1">Works offline</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Once the page loads, PDF processing works without an internet connection.</p>
          </div>
          <div>
            <p className="font-medium text-gray-800 dark:text-gray-200 mb-1">No account required</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">No sign-up, no login, no subscription. Just open and use.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
