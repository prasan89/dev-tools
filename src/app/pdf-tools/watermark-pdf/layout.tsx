import type { Metadata } from 'next';
import { siteUrl } from '@/lib/seo/site-config';

export const metadata: Metadata = {
  title: 'Watermark PDF — Add Text or Image Watermark Online Free | DevToolsHub',
  description:
    'Add text or image watermarks to PDF pages directly in your browser. Choose position, opacity, rotation, and which pages to watermark. 100% private — your PDF never leaves your device.',
  keywords: [
    'watermark PDF',
    'add watermark to PDF',
    'PDF watermark online',
    'text watermark PDF',
    'image watermark PDF',
    'add confidential watermark',
    'PDF stamp online',
    'watermark PDF free',
    'PDF watermark no upload',
    'add watermark browser',
  ],
  alternates: {
    canonical: siteUrl('/pdf-tools/watermark-pdf'),
  },
  openGraph: {
    title: 'Watermark PDF — Add Text or Image Watermark | DevToolsHub',
    description:
      'Add text or image watermarks to PDF pages in your browser. Position, opacity, rotation, page selection. Never uploaded.',
    url: siteUrl('/pdf-tools/watermark-pdf'),
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Watermark PDF Online Free | DevToolsHub',
    description:
      'Add text or image watermarks to any PDF page. Choose position, opacity, rotation. Export locally — never uploaded.',
  },
};

export default function WatermarkPdfLayout({ children }: { children: React.ReactNode }) {
  return children;
}
