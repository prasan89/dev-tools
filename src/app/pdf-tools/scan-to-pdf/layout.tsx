import type { Metadata } from 'next';
import { siteUrl } from '@/lib/seo/site-config';

export const metadata: Metadata = {
  title: 'Scan to PDF — Convert Images to PDF Online Free | DevToolsHub',
  description:
    'Convert scanned images to PDF directly in your browser. Reorder pages, rotate, apply grayscale or B&W. Supports JPG, PNG, and WebP. No uploads — 100% private.',
  keywords: [
    'scan to PDF',
    'image to PDF',
    'convert image to PDF',
    'photo to PDF',
    'JPG to PDF',
    'PNG to PDF',
    'scan document to PDF',
    'scanned image PDF',
    'multi-page scan PDF',
    'scan to PDF free',
    'convert scan to PDF browser',
  ],
  alternates: {
    canonical: siteUrl('/pdf-tools/scan-to-pdf'),
  },
  openGraph: {
    title: 'Scan to PDF — Convert Images to PDF Online | DevToolsHub',
    description:
      'Turn scanned images into a PDF. Reorder, rotate, grayscale or B&W. Browser-based — never uploaded.',
    url: siteUrl('/pdf-tools/scan-to-pdf'),
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Scan to PDF Online Free | DevToolsHub',
    description:
      'Convert scanned images to PDF. Reorder, rotate, apply grayscale. 100% browser-based.',
  },
};

export default function ScanToPdfLayout({ children }: { children: React.ReactNode }) {
  return children;
}
