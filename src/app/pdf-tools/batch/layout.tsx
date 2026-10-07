import type { Metadata } from 'next';
import { siteUrl } from '@/lib/seo/site-config';

export const metadata: Metadata = {
  title: 'Batch PDF Processing — Process Multiple PDFs at Once | DevToolsHub',
  description:
    'Process multiple PDF files at once in your browser. Compress, watermark, clean metadata, or add page numbers to batches of PDFs. Download individually or as a ZIP. 100% private — no uploads.',
  keywords: [
    'batch PDF processing',
    'process multiple PDFs',
    'bulk PDF tools',
    'batch PDF compressor',
    'bulk PDF watermark',
    'PDF batch operations',
    'batch PDF free',
    'process PDFs in bulk',
    'multiple PDF processor',
    'PDF batch download',
  ],
  alternates: { canonical: siteUrl('/pdf-tools/batch') },
  openGraph: {
    title: 'Batch PDF Processing | DevToolsHub',
    description:
      'Process multiple PDFs at once — compress, watermark, clean metadata, add page numbers. Download as ZIP. Never uploaded.',
    url: siteUrl('/pdf-tools/batch'),
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Batch PDF Processing Free | DevToolsHub',
    description: 'Process multiple PDFs in bulk. Browser-based, no upload.',
  },
};

export default function BatchLayout({ children }: { children: React.ReactNode }) {
  return children;
}
