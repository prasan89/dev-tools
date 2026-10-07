import type { Metadata } from 'next';
import Link from 'next/link';
import { siteUrl } from '@/lib/seo/site-config';

export const metadata: Metadata = {
  title: 'Fast, Free & Private PDF Tools — DevToolsHub',
  description:
    'Free online PDF tools that run entirely in your browser. Merge, split, compress, edit, convert and OCR PDFs — your files stay on your device, never uploaded.',
  alternates: {
    canonical: siteUrl('/pdf-tools'),
  },
  openGraph: {
    title: 'Fast, Free & Private PDF Tools — DevToolsHub',
    description:
      'Free online PDF tools that run entirely in your browser. Merge, split, compress, edit, convert and OCR PDFs — your files stay on your device, never uploaded.',
    url: siteUrl('/pdf-tools'),
    siteName: 'DevToolsHub',
    type: 'website',
  },
};

interface ToolEntry {
  title: string;
  description: string;
  href: string;
  available: boolean;
}

interface ToolCategory {
  label: string;
  tools: ToolEntry[];
}

const TOOL_CATEGORIES: ToolCategory[] = [
  {
    label: 'Organize & Edit',
    tools: [
      { title: 'PDF Viewer', description: 'View and navigate PDF files directly in your browser.', href: '/pdf-tools/viewer', available: true },
      { title: 'Merge PDF', description: 'Combine multiple PDF files into one document.', href: '/pdf-tools/merge-pdf', available: true },
      { title: 'Split PDF', description: 'Extract pages, split by range, or separate every page into its own file.', href: '/pdf-tools/split-pdf', available: true },
      { title: 'Organize PDF', description: 'Rotate, delete, and reorder PDF pages. Drag and drop to rearrange.', href: '/pdf-tools/organize-pdf', available: true },
      { title: 'Crop PDF', description: 'Visually crop PDF pages to remove margins or whitespace.', href: '/pdf-tools/crop-pdf', available: true },
      { title: 'Extract Pages', description: 'Extract specific pages or page ranges from a PDF into a new file.', href: '/pdf-tools/extract-pages', available: true },
      { title: 'Edit PDF', description: 'Add text, images, shapes, highlights, and annotations to any PDF page.', href: '/pdf-tools/edit-pdf', available: true },
      { title: 'Fill PDF Form', description: 'Fill AcroForm PDF fields — text, checkboxes, radio buttons, and dropdowns.', href: '/pdf-tools/fill-pdf', available: true },
      { title: 'Create PDF Form', description: 'Add interactive form fields to any PDF — text boxes, checkboxes, radio buttons, and dropdowns.', href: '/pdf-tools/create-pdf-form', available: true },
    ],
  },
  {
    label: 'Convert PDF',
    tools: [
      { title: 'Compress PDF', description: 'Reduce PDF file size using browser-based structural optimization.', href: '/pdf-tools/compress-pdf', available: true },
      { title: 'PDF to Images', description: 'Export PDF pages as JPG or PNG images at custom resolution.', href: '/pdf-tools/pdf-to-jpg', available: true },
      { title: 'JPG / PNG to PDF', description: 'Convert JPG and PNG images to PDF. Combine multiple images into one document.', href: '/pdf-tools/jpg-png-to-pdf', available: true },
      { title: 'PDF to HTML', description: 'Convert PDF pages to a standalone HTML file with embedded page images.', href: '/pdf-tools/pdf-to-html', available: true },
      { title: 'PDF to SVG', description: 'Convert PDF pages to SVG vector files. Download each page as an individual SVG.', href: '/pdf-tools/pdf-to-svg', available: true },
      { title: 'PDF to WebP', description: 'Export PDF pages as WebP images at custom scale and quality. No uploads required.', href: '/pdf-tools/pdf-to-webp', available: true },
      { title: 'HTML to PDF', description: 'Convert an HTML snippet or paste HTML and print it to PDF using your browser.', href: '/pdf-tools/html-to-pdf', available: true },
      { title: 'Web Page to PDF', description: 'Enter a URL and open the page for printing to PDF directly in your browser.', href: '/pdf-tools/webpage-to-pdf', available: true },
    ],
  },
  {
    label: 'Office Conversions',
    tools: [
      { title: 'PDF to Word', description: 'Convert PDF to editable Word DOCX. Text extracted directly in your browser.', href: '/pdf-tools/pdf-to-word', available: true },
      { title: 'PDF to Excel', description: 'Convert PDF tables to Excel XLSX. Rows and columns detected automatically.', href: '/pdf-tools/pdf-to-excel', available: true },
      { title: 'PDF to PowerPoint', description: 'Convert PDF pages to PowerPoint slides. Each page becomes a full-page image slide.', href: '/pdf-tools/pdf-to-powerpoint', available: true },
      { title: 'Word to PDF', description: 'Convert Word DOCX documents to PDF. Upload your .docx and download a PDF.', href: '/pdf-tools/word-to-pdf', available: true },
      { title: 'Excel to PDF', description: 'Convert Excel XLSX spreadsheets to PDF with tabular layout.', href: '/pdf-tools/excel-to-pdf', available: true },
      { title: 'PowerPoint to PDF', description: 'Convert PowerPoint PPTX files to PDF. Slide text and layout preserved.', href: '/pdf-tools/powerpoint-to-pdf', available: true },
    ],
  },
  {
    label: 'Security & Privacy',
    tools: [
      { title: 'PDF Watermark', description: 'Add text or image watermarks to PDF pages.', href: '/pdf-tools/watermark-pdf', available: true },
      { title: 'Add Page Numbers', description: 'Add customizable page numbers to any PDF — choose format, position, font, and page selection.', href: '/pdf-tools/page-numbers', available: true },
      { title: 'PDF Metadata Editor', description: 'View, edit, or remove PDF document properties — title, author, subject, keywords, and dates.', href: '/pdf-tools/pdf-metadata', available: true },
      { title: 'Password Protect PDF', description: 'Add a password to your PDF to prevent unauthorized access. 100% browser-based.', href: '/pdf-tools/protect-pdf', available: true },
      { title: 'Unlock PDF', description: 'Remove the password from a PDF you own. Enter your password and export a decrypted copy.', href: '/pdf-tools/unlock-pdf', available: true },
      { title: 'Redact PDF', description: 'Black out sensitive text and regions in a PDF. Draw redaction boxes over any area.', href: '/pdf-tools/redact-pdf', available: true },
    ],
  },
  {
    label: 'OCR & Text',
    tools: [
      { title: 'PDF to Text', description: 'Extract all text from a PDF. Copy or download the plain text. Your file stays in the browser.', href: '/pdf-tools/pdf-to-text', available: true },
      { title: 'PDF to Markdown', description: 'Convert PDF text content to Markdown format with headings and lists inferred from structure.', href: '/pdf-tools/pdf-to-markdown', available: true },
      { title: 'OCR — Scan to Text', description: 'Run optical character recognition on a scanned PDF using Tesseract.js. No server, full privacy.', href: '/pdf-tools/ocr', available: true },
      { title: 'OCR to Searchable PDF', description: 'Add a hidden text layer to a scanned PDF so it becomes searchable and copyable.', href: '/pdf-tools/ocr-searchable-pdf', available: true },
      { title: 'OCR to Extracted Text', description: 'Extract text from a scanned PDF via OCR and download as a plain .txt file.', href: '/pdf-tools/ocr-text', available: true },
    ],
  },
  {
    label: 'Create & Fix',
    tools: [
      { title: 'Create PDF', description: 'Create a blank PDF document with custom page size, orientation, and count.', href: '/pdf-tools/create-pdf', available: true },
      { title: 'Scan / Image to PDF', description: 'Convert scanned images and photos to a PDF. Reorder pages, rotate, and apply grayscale.', href: '/pdf-tools/scan-to-pdf', available: true },
      { title: 'Compare PDFs', description: 'Compare two PDF documents side by side and highlight text differences page by page.', href: '/pdf-tools/compare-pdf', available: true },
      { title: 'Repair PDF', description: 'Re-serialize a PDF to fix minor structural issues and cross-reference table errors.', href: '/pdf-tools/repair-pdf', available: true },
      { title: 'Convert to PDF/A', description: 'Convert a PDF to PDF/A format for long-term archiving. Best-effort browser-based conversion.', href: '/pdf-tools/pdf-a', available: true },
    ],
  },
  {
    label: 'Advanced',
    tools: [
      { title: 'Batch PDF Processing', description: 'Process multiple PDFs at once — compress, watermark, or clean metadata in bulk.', href: '/pdf-tools/batch', available: true },
      { title: 'PDF Workflows', description: 'Chain multiple PDF operations into an automated workflow pipeline.', href: '/pdf-tools/workflows', available: true },
    ],
  },
];

function ToolCard({ tool }: { tool: ToolEntry }) {
  if (tool.available) {
    return (
      <Link
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
    );
  }

  return (
    <div
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
  );
}

export default function PdfToolsPage() {
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Fast, Free &amp; Private PDF Tools</h1>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 max-w-2xl">
          Merge, split, compress, edit, convert and OCR PDFs directly in your browser. Your files stay on your device.
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

      {/* Tool categories */}
      {TOOL_CATEGORIES.map((category) => (
        <section key={category.label} aria-labelledby={`cat-${category.label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}>
          <h2
            id={`cat-${category.label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
            className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400"
          >
            {category.label}
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {category.tools.map((tool) => (
              <ToolCard key={tool.href} tool={tool} />
            ))}
          </div>
        </section>
      ))}

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
