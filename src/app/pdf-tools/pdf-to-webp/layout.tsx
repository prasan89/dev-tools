import type { Metadata } from 'next';
import { siteUrl } from '@/lib/seo/site-config';

export const metadata: Metadata = {
  title: 'PDF to WebP — Convert PDF Pages to WebP Images Online Free | DevToolsHub',
  description:
    'Convert PDF pages to WebP images directly in your browser. Choose quality, scale, and page range. 100% private — your PDF never leaves your device.',
  keywords: [
    'PDF to WebP',
    'convert PDF to WebP',
    'PDF WebP converter',
    'PDF to image WebP',
    'export PDF as WebP',
    'PDF WebP online',
    'PDF to WebP free',
    'PDF image converter',
    'PDF to WebP no upload',
    'browser PDF converter',
  ],
  alternates: { canonical: siteUrl('/pdf-tools/pdf-to-webp') },
  openGraph: {
    title: 'PDF to WebP — Convert PDF Pages to WebP Images | DevToolsHub',
    description: 'Convert PDF pages to WebP images in your browser. No uploads, complete privacy.',
    url: siteUrl('/pdf-tools/pdf-to-webp'),
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'PDF to WebP Online Free | DevToolsHub',
    description: 'Convert PDF to WebP images. Browser-based, no upload.',
  },
};

export default function PdfToWebpLayout({ children }: { children: React.ReactNode }) {
  return children;
}
