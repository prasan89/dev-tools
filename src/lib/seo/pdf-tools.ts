/**
 * SEO metadata for every PDF tool page.
 * Server-side only — never imported by client components.
 * Consumed by pdfToolMetadata() in each PDF tool page.tsx.
 */

import { siteUrl } from './site-config';

export interface PdfToolSeo {
  /** <title> value */
  title: string;
  /** <meta name="description"> */
  description: string;
  /** Canonical URL path, e.g. "/pdf-tools/merge-pdf" */
  path: string;
  /** H1 shown in PdfToolLayout */
  h1: string;
  /** Short subtitle shown in PdfToolLayout */
  subtitle: string;
  /** Keywords array */
  keywords: string[];
  /** Whether this page should be indexed by search engines */
  index: boolean;
}

const PDF_TOOLS_SEO: Record<string, PdfToolSeo> = {
  'merge-pdf': {
    title: 'Merge PDF Online — Combine PDF Files Free',
    description:
      'Combine multiple PDF files into one document online. Drag to reorder pages, then download the merged PDF. Free, fast, and runs entirely in your browser — nothing uploaded.',
    path: '/pdf-tools/merge-pdf',
    h1: 'Merge PDF',
    subtitle: 'Combine multiple PDF files into one document. Drag to reorder, then download.',
    keywords: ['merge pdf', 'combine pdf', 'join pdf', 'pdf merger online', 'merge pdf files'],
    index: true,
  },
  'split-pdf': {
    title: 'Split PDF Online — Extract Pages Free',
    description:
      'Split a PDF into individual pages or custom page ranges. Extract exactly the pages you need. Free and browser-based — your file is never uploaded to a server.',
    path: '/pdf-tools/split-pdf',
    h1: 'Split PDF',
    subtitle: 'Extract pages or split by range. Your file stays in your browser.',
    keywords: ['split pdf', 'divide pdf', 'extract pages from pdf', 'pdf splitter online'],
    index: true,
  },
  'compress-pdf': {
    title: 'Compress PDF Online — Reduce PDF File Size Free',
    description:
      'Reduce PDF file size online without losing quality. Choose compression level and see the size reduction instantly. Free, private, and runs in your browser.',
    path: '/pdf-tools/compress-pdf',
    h1: 'Compress PDF',
    subtitle: 'Reduce PDF file size. Choose your compression level and download.',
    keywords: ['compress pdf', 'reduce pdf size', 'pdf compressor', 'shrink pdf online', 'pdf file size reducer'],
    index: true,
  },
  'pdf-to-jpg': {
    title: 'PDF to JPG — Convert PDF Pages to Images Online',
    description:
      'Convert PDF pages to high-quality JPG or PNG images online. Choose resolution and format. Free, browser-based, no files uploaded.',
    path: '/pdf-tools/pdf-to-jpg',
    h1: 'PDF to JPG / PNG',
    subtitle: 'Convert PDF pages to images. Choose format and resolution, then download.',
    keywords: ['pdf to jpg', 'pdf to png', 'pdf to image', 'convert pdf to jpeg', 'pdf image converter'],
    index: true,
  },
  'jpg-png-to-pdf': {
    title: 'JPG to PDF — Convert Images to PDF Online Free',
    description:
      'Convert JPG, PNG, and other images to a PDF document online. Add multiple images and arrange them. Free and browser-based.',
    path: '/pdf-tools/jpg-png-to-pdf',
    h1: 'JPG / PNG to PDF',
    subtitle: 'Convert images to a PDF document. Add and arrange multiple images.',
    keywords: ['jpg to pdf', 'png to pdf', 'image to pdf', 'convert jpg to pdf online', 'photos to pdf'],
    index: true,
  },
  'organize-pdf': {
    title: 'Organize PDF — Reorder, Rotate & Delete Pages Online',
    description:
      'Reorder, rotate, and delete PDF pages with a visual drag-and-drop interface. Free, browser-based PDF page organizer.',
    path: '/pdf-tools/organize-pdf',
    h1: 'Organize PDF',
    subtitle: 'Drag to reorder pages, rotate, or delete. Then save your organized PDF.',
    keywords: ['organize pdf', 'reorder pdf pages', 'rotate pdf pages', 'delete pdf pages', 'pdf page organizer'],
    index: true,
  },
  'crop-pdf': {
    title: 'Crop PDF — Remove Margins & Whitespace Online',
    description:
      'Visually crop PDF pages to remove margins, whitespace, or unwanted areas. Draw a crop region and apply to all pages or individually. Free and browser-based.',
    path: '/pdf-tools/crop-pdf',
    h1: 'Crop PDF',
    subtitle: 'Draw a crop region to trim margins or whitespace from PDF pages.',
    keywords: ['crop pdf', 'trim pdf margins', 'pdf crop tool', 'remove pdf whitespace'],
    index: true,
  },
  'extract-pages': {
    title: 'Extract PDF Pages — Save Specific Pages as a New PDF',
    description:
      'Select and extract specific pages or page ranges from a PDF into a new file. Free, browser-based PDF page extractor.',
    path: '/pdf-tools/extract-pages',
    h1: 'Extract PDF Pages',
    subtitle: 'Choose pages or ranges to extract into a new PDF file.',
    keywords: ['extract pdf pages', 'pdf page extractor', 'save specific pdf pages', 'pdf range extract'],
    index: true,
  },
  'edit-pdf': {
    title: 'Edit PDF Online — Add Text, Images & Annotations',
    description:
      'Add text, images, shapes, highlights, and annotations to any PDF. Free online PDF editor that runs in your browser — no installation required.',
    path: '/pdf-tools/edit-pdf',
    h1: 'PDF Editor',
    subtitle: 'Add text, images, shapes, and annotations to any PDF page.',
    keywords: ['edit pdf online', 'pdf editor', 'annotate pdf', 'add text to pdf', 'pdf annotation tool'],
    index: true,
  },
  'fill-pdf': {
    title: 'Fill PDF Form — Complete PDF Forms Online',
    description:
      'Fill in interactive PDF forms online. Enter text, check boxes, and sign. Free, browser-based PDF form filler — your data never leaves your device.',
    path: '/pdf-tools/fill-pdf',
    h1: 'Fill PDF Form',
    subtitle: 'Fill in interactive PDF forms. Your data stays in your browser.',
    keywords: ['fill pdf form', 'pdf form filler', 'complete pdf form online', 'fill in pdf online'],
    index: true,
  },
  'create-pdf-form': {
    title: 'Create PDF Form — Add Form Fields to PDF Online',
    description:
      'Add text fields, checkboxes, radio buttons, and dropdowns to any PDF to create a fillable form. Free, browser-based PDF form creator.',
    path: '/pdf-tools/create-pdf-form',
    h1: 'Create PDF Form',
    subtitle: 'Add fillable fields to any PDF — text, checkboxes, radio buttons, dropdowns.',
    keywords: ['create pdf form', 'pdf form creator', 'fillable pdf online', 'add form fields to pdf'],
    index: true,
  },
  'pdf-to-html': {
    title: 'PDF to HTML — Convert PDF to Web Page Online',
    description:
      'Convert PDF documents to HTML web pages online. Renders each page as an image embedded in clean HTML. Free and browser-based.',
    path: '/pdf-tools/pdf-to-html',
    h1: 'PDF to HTML',
    subtitle: 'Convert PDF pages to an HTML document you can view in any browser.',
    keywords: ['pdf to html', 'convert pdf to html', 'pdf to web page', 'pdf html converter'],
    index: true,
  },
  'pdf-to-svg': {
    title: 'PDF to SVG — Convert PDF Pages to SVG Online',
    description:
      'Convert PDF pages to scalable SVG vector graphics online. Free, browser-based PDF to SVG converter.',
    path: '/pdf-tools/pdf-to-svg',
    h1: 'PDF to SVG',
    subtitle: 'Convert PDF pages to SVG vector format.',
    keywords: ['pdf to svg', 'convert pdf to svg', 'pdf svg converter'],
    index: true,
  },
  'pdf-to-webp': {
    title: 'PDF to WebP — Convert PDF Pages to WebP Images',
    description:
      'Convert PDF pages to WebP format for smaller file sizes. Free, browser-based PDF to WebP converter.',
    path: '/pdf-tools/pdf-to-webp',
    h1: 'PDF to WebP',
    subtitle: 'Convert PDF pages to WebP images for smaller file sizes.',
    keywords: ['pdf to webp', 'convert pdf to webp', 'pdf webp converter'],
    index: true,
  },
  'html-to-pdf': {
    title: 'HTML to PDF — Convert HTML Content to PDF Online',
    description:
      'Convert HTML content to a PDF document online. Paste HTML or a URL and download as PDF. Free, browser-based.',
    path: '/pdf-tools/html-to-pdf',
    h1: 'HTML to PDF',
    subtitle: 'Convert HTML content to a PDF. Paste HTML or enter a URL.',
    keywords: ['html to pdf', 'convert html to pdf', 'webpage to pdf', 'html pdf converter'],
    index: true,
  },
  'webpage-to-pdf': {
    title: 'Webpage to PDF — Save Any Web Page as PDF',
    description:
      'Enter a URL and save any web page as a PDF document. Free, browser-based webpage to PDF converter.',
    path: '/pdf-tools/webpage-to-pdf',
    h1: 'Webpage to PDF',
    subtitle: 'Enter a URL to capture and save a web page as PDF.',
    keywords: ['webpage to pdf', 'web page to pdf', 'url to pdf', 'save website as pdf'],
    index: true,
  },
  'pdf-to-word': {
    title: 'PDF to Word — Convert PDF to DOCX Online Free',
    description:
      'Convert PDF documents to editable Word (DOCX) format online. Extracts text and basic formatting. Free, browser-based PDF to Word converter.',
    path: '/pdf-tools/pdf-to-word',
    h1: 'PDF to Word',
    subtitle: 'Convert PDF to editable DOCX format. Text and basic formatting extracted.',
    keywords: ['pdf to word', 'pdf to docx', 'convert pdf to word', 'pdf word converter online'],
    index: true,
  },
  'pdf-to-excel': {
    title: 'PDF to Excel — Extract Tables from PDF to Spreadsheet',
    description:
      'Extract tables and data from PDF documents to Excel (XLSX) spreadsheet format. Free, browser-based PDF to Excel converter.',
    path: '/pdf-tools/pdf-to-excel',
    h1: 'PDF to Excel',
    subtitle: 'Extract tables and data from PDF into a downloadable spreadsheet.',
    keywords: ['pdf to excel', 'pdf to xlsx', 'extract table from pdf', 'pdf spreadsheet converter'],
    index: true,
  },
  'pdf-to-powerpoint': {
    title: 'PDF to PowerPoint — Convert PDF to PPTX Online',
    description:
      'Convert PDF documents to PowerPoint (PPTX) presentation format online. Each page becomes a slide. Free and browser-based.',
    path: '/pdf-tools/pdf-to-powerpoint',
    h1: 'PDF to PowerPoint',
    subtitle: 'Convert PDF pages to PowerPoint slides. Each page becomes a slide.',
    keywords: ['pdf to powerpoint', 'pdf to pptx', 'convert pdf to presentation', 'pdf pptx converter'],
    index: true,
  },
  'word-to-pdf': {
    title: 'Word to PDF — Convert DOCX to PDF Online Free',
    description:
      'Convert Word documents (DOCX, DOC) to PDF online. Free, browser-based Word to PDF converter.',
    path: '/pdf-tools/word-to-pdf',
    h1: 'Word to PDF',
    subtitle: 'Convert Word documents to PDF. Upload DOCX or DOC and download as PDF.',
    keywords: ['word to pdf', 'docx to pdf', 'convert word to pdf', 'word pdf converter online'],
    index: true,
  },
  'excel-to-pdf': {
    title: 'Excel to PDF — Convert Spreadsheets to PDF Online',
    description:
      'Convert Excel spreadsheets (XLSX, XLS) to PDF online. Free, browser-based Excel to PDF converter.',
    path: '/pdf-tools/excel-to-pdf',
    h1: 'Excel to PDF',
    subtitle: 'Convert Excel spreadsheets to PDF. Upload XLSX and download as PDF.',
    keywords: ['excel to pdf', 'xlsx to pdf', 'convert excel to pdf', 'spreadsheet to pdf'],
    index: true,
  },
  'powerpoint-to-pdf': {
    title: 'PowerPoint to PDF — Convert Presentations to PDF Online',
    description:
      'Convert PowerPoint presentations (PPTX, PPT) to PDF online. Free, browser-based PowerPoint to PDF converter.',
    path: '/pdf-tools/powerpoint-to-pdf',
    h1: 'PowerPoint to PDF',
    subtitle: 'Convert PowerPoint presentations to PDF. Upload PPTX and download.',
    keywords: ['powerpoint to pdf', 'pptx to pdf', 'convert presentation to pdf', 'ppt to pdf online'],
    index: true,
  },
  'watermark-pdf': {
    title: 'Watermark PDF — Add Text or Image Watermark Online',
    description:
      'Add text or image watermarks to PDF pages online. Control opacity, position, size, and rotation. Free, browser-based PDF watermark tool.',
    path: '/pdf-tools/watermark-pdf',
    h1: 'Watermark PDF',
    subtitle: 'Add text or image watermarks. Control opacity, position, and rotation.',
    keywords: ['watermark pdf', 'add watermark to pdf', 'pdf watermark tool', 'stamp pdf online'],
    index: true,
  },
  'page-numbers': {
    title: 'Add Page Numbers to PDF — Number PDF Pages Online',
    description:
      'Add page numbers to PDF documents online. Choose position, format, font, and which pages to number. Free, browser-based.',
    path: '/pdf-tools/page-numbers',
    h1: 'Add Page Numbers to PDF',
    subtitle: 'Number PDF pages. Choose position, format, and range.',
    keywords: ['add page numbers to pdf', 'pdf page numbering', 'number pdf pages online'],
    index: true,
  },
  'pdf-metadata': {
    title: 'PDF Metadata Editor — View & Edit PDF Properties',
    description:
      'View and edit PDF metadata — title, author, subject, keywords, and more. Free, browser-based PDF metadata editor.',
    path: '/pdf-tools/pdf-metadata',
    h1: 'PDF Metadata Editor',
    subtitle: 'Read and edit title, author, subject, and keywords in any PDF.',
    keywords: ['pdf metadata editor', 'edit pdf properties', 'pdf metadata viewer', 'pdf document properties'],
    index: true,
  },
  'protect-pdf': {
    title: 'Password Protect PDF — Lock PDF with Password',
    description:
      'Add password protection to PDF documents online. Lock PDFs to prevent unauthorized access. Free, browser-based PDF protection tool.',
    path: '/pdf-tools/protect-pdf',
    h1: 'Password Protect PDF',
    subtitle: 'Lock a PDF with a password to restrict access.',
    keywords: ['password protect pdf', 'lock pdf with password', 'encrypt pdf online', 'secure pdf'],
    index: true,
  },
  'unlock-pdf': {
    title: 'Unlock PDF — Remove PDF Password Online',
    description:
      'Remove password protection from PDF files you own. Enter the password to unlock and download an unprotected PDF. Free, browser-based.',
    path: '/pdf-tools/unlock-pdf',
    h1: 'Unlock PDF',
    subtitle: 'Remove the password from a PDF you own. Enter the password to unlock.',
    keywords: ['unlock pdf', 'remove pdf password', 'pdf password remover', 'decrypt pdf online'],
    index: true,
  },
  'redact-pdf': {
    title: 'Redact PDF — Cover Sensitive Content in PDF Online',
    description:
      'Draw black boxes over sensitive text or images in PDF documents. Visual cover-based redaction tool. Free and browser-based.',
    path: '/pdf-tools/redact-pdf',
    h1: 'Redact PDF',
    subtitle: 'Draw redaction boxes over sensitive areas. Visual cover applied to PDF pages.',
    keywords: ['redact pdf', 'black out pdf text', 'pdf redaction tool', 'hide pdf content'],
    index: true,
  },
  'pdf-to-text': {
    title: 'PDF to Text — Extract Text from PDF Online',
    description:
      'Extract plain text from PDF documents online. Copies text from all pages. Free, browser-based PDF text extractor.',
    path: '/pdf-tools/pdf-to-text',
    h1: 'PDF to Text',
    subtitle: 'Extract plain text from all pages of a PDF document.',
    keywords: ['pdf to text', 'extract text from pdf', 'pdf text extractor', 'copy text from pdf'],
    index: true,
  },
  'pdf-to-markdown': {
    title: 'PDF to Markdown — Convert PDF to Markdown Online',
    description:
      'Convert PDF text content to Markdown format online. Useful for documentation and content migration. Free, browser-based.',
    path: '/pdf-tools/pdf-to-markdown',
    h1: 'PDF to Markdown',
    subtitle: 'Extract PDF content and convert to Markdown format.',
    keywords: ['pdf to markdown', 'convert pdf to markdown', 'pdf markdown converter'],
    index: true,
  },
  'ocr': {
    title: 'PDF OCR — Extract Text from Scanned PDFs Online',
    description:
      'Run optical character recognition on scanned PDFs and images. Extract text from scanned documents using OCR. Free, browser-based.',
    path: '/pdf-tools/ocr',
    h1: 'PDF OCR',
    subtitle: 'Recognize and extract text from scanned PDFs using OCR.',
    keywords: ['pdf ocr', 'ocr pdf online', 'scan to text', 'extract text from scanned pdf'],
    index: true,
  },
  'ocr-searchable-pdf': {
    title: 'OCR to Searchable PDF — Make Scanned PDFs Searchable',
    description:
      'Add an invisible searchable text layer to scanned PDFs using OCR. Makes scanned documents searchable and selectable. Free, browser-based.',
    path: '/pdf-tools/ocr-searchable-pdf',
    h1: 'OCR to Searchable PDF',
    subtitle: 'Add a searchable text layer to scanned PDFs using OCR recognition.',
    keywords: ['ocr searchable pdf', 'make pdf searchable', 'pdf searchable text layer', 'ocr pdf'],
    index: true,
  },
  'ocr-text': {
    title: 'OCR to Text — Extract Text from Images & Scans Online',
    description:
      'Use OCR to extract text from scanned images and PDF pages. Supports multiple languages. Free, browser-based OCR text extractor.',
    path: '/pdf-tools/ocr-text',
    h1: 'OCR to Text',
    subtitle: 'Extract text from scanned images and PDF pages using OCR.',
    keywords: ['ocr to text', 'image to text', 'scan to text online', 'ocr text extractor'],
    index: true,
  },
  'create-pdf': {
    title: 'Create PDF — Build a PDF from Scratch Online',
    description:
      'Create a new PDF document from scratch online. Add text, images, and basic formatting. Free, browser-based PDF creator.',
    path: '/pdf-tools/create-pdf',
    h1: 'Create PDF',
    subtitle: 'Build a new PDF document from scratch. Add text, images, and formatting.',
    keywords: ['create pdf online', 'make pdf', 'build pdf from scratch', 'free pdf creator'],
    index: true,
  },
  'scan-to-pdf': {
    title: 'Scan to PDF — Convert Camera Scans to PDF Online',
    description:
      'Use your camera or upload scanned images to create a PDF. Apply auto-enhancement for cleaner scans. Free, browser-based.',
    path: '/pdf-tools/scan-to-pdf',
    h1: 'Scan to PDF',
    subtitle: 'Capture or upload scanned images and save them as a PDF document.',
    keywords: ['scan to pdf', 'camera scan to pdf', 'mobile scan pdf', 'photograph to pdf'],
    index: true,
  },
  'compare-pdf': {
    title: 'Compare PDF — Find Differences Between PDF Files',
    description:
      'Compare two PDF documents side by side and highlight the differences. Free, browser-based PDF comparison tool.',
    path: '/pdf-tools/compare-pdf',
    h1: 'Compare PDF',
    subtitle: 'View two PDF documents side by side and spot the differences.',
    keywords: ['compare pdf', 'pdf diff', 'pdf comparison tool', 'find differences in pdf'],
    index: true,
  },
  'repair-pdf': {
    title: 'Repair PDF — Fix Corrupted PDF Files Online',
    description:
      'Try to recover and repair corrupted or damaged PDF files online. Free, browser-based PDF repair tool.',
    path: '/pdf-tools/repair-pdf',
    h1: 'Repair PDF',
    subtitle: 'Attempt to recover and repair a corrupted or damaged PDF file.',
    keywords: ['repair pdf', 'fix corrupted pdf', 'pdf repair tool', 'recover damaged pdf'],
    index: true,
  },
  'pdf-a': {
    title: 'PDF/A Converter — Convert PDF to PDF/A for Archiving',
    description:
      'Convert PDF documents to PDF/A format for long-term archiving and compliance. Free, browser-based PDF/A converter.',
    path: '/pdf-tools/pdf-a',
    h1: 'PDF/A Converter',
    subtitle: 'Convert PDF to PDF/A archival format for long-term compliance.',
    keywords: ['pdf/a converter', 'pdf to pdfa', 'pdf archiving format', 'pdfa online'],
    index: true,
  },
  'batch': {
    title: 'Batch PDF Processing — Process Multiple PDFs at Once',
    description:
      'Apply operations like compression, watermarking, or page numbering to multiple PDF files at once. Free, browser-based batch PDF processor.',
    path: '/pdf-tools/batch',
    h1: 'Batch PDF Processing',
    subtitle: 'Apply operations to multiple PDF files at once.',
    keywords: ['batch pdf', 'process multiple pdfs', 'pdf batch processing'],
    index: true,
  },
  // Internal/utility pages — not indexed
  'viewer': {
    title: 'PDF Viewer — DevToolsHub',
    description: 'View PDF files in your browser.',
    path: '/pdf-tools/viewer',
    h1: 'PDF Viewer',
    subtitle: 'View and navigate PDF files directly in your browser.',
    keywords: [],
    index: false,
  },
  'workers': {
    title: 'PDF Workers — DevToolsHub',
    description: 'PDF worker management.',
    path: '/pdf-tools/workers',
    h1: 'PDF Workers',
    subtitle: '',
    keywords: [],
    index: false,
  },
  'workflows': {
    title: 'PDF Workflows — DevToolsHub',
    description: 'PDF workflow tools.',
    path: '/pdf-tools/workflows',
    h1: 'PDF Workflows',
    subtitle: 'Combine multiple PDF operations into a single workflow.',
    keywords: [],
    index: false,
  },
  'performance': {
    title: 'PDF Performance — DevToolsHub',
    description: 'PDF performance benchmarks.',
    path: '/pdf-tools/performance',
    h1: 'PDF Performance',
    subtitle: '',
    keywords: [],
    index: false,
  },
};

export function getPdfToolSeo(slug: string): PdfToolSeo | null {
  return PDF_TOOLS_SEO[slug] ?? null;
}

export function getAllIndexablePdfToolPaths(): string[] {
  return Object.values(PDF_TOOLS_SEO)
    .filter((t) => t.index)
    .map((t) => t.path);
}

/**
 * Build Next.js Metadata for a PDF tool page.
 * Returns null for unknown slugs so callers can handle gracefully.
 */
export function pdfToolMetadata(slug: string) {
  const seo = getPdfToolSeo(slug);
  if (!seo) return null;

  return {
    title: { absolute: seo.title },
    description: seo.description,
    keywords: seo.keywords,
    robots: seo.index ? { index: true, follow: true } : { index: false, follow: false },
    alternates: { canonical: siteUrl(seo.path) },
    openGraph: {
      title: seo.title,
      description: seo.description,
      url: siteUrl(seo.path),
      siteName: 'DevToolsHub',
      type: 'website' as const,
    },
    twitter: {
      card: 'summary_large_image' as const,
      title: seo.title,
      description: seo.description,
    },
  };
}
