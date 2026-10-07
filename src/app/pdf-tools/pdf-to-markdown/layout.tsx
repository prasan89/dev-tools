import type { Metadata } from 'next';
import { siteUrl } from '@/lib/seo/site-config';

export const metadata: Metadata = {
  title: 'PDF to Markdown — Convert PDF to Markdown Online Free | DevToolsHub',
  description:
    'Convert a PDF file to Markdown format in your browser. Structure is inferred from text formatting. No uploads, complete privacy.',
  keywords: [
    'PDF to markdown',
    'convert PDF to markdown',
    'PDF markdown extractor',
    'PDF to MD',
    'PDF to markdown online',
    'extract markdown from PDF',
    'PDF markdown converter',
    'PDF to structured text',
    'PDF markdown no upload',
  ],
  alternates: {
    canonical: siteUrl('/pdf-tools/pdf-to-markdown'),
  },
  openGraph: {
    title: 'PDF to Markdown — Convert PDF to Markdown | DevToolsHub',
    description:
      'Convert PDF to Markdown in your browser. Download as .md. Never uploaded.',
    url: siteUrl('/pdf-tools/pdf-to-markdown'),
    type: 'website',
  },
};

export default function PdfToMarkdownLayout({ children }: { children: React.ReactNode }) {
  return children;
}
