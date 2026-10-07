import type { Metadata } from 'next';
import { siteUrl } from '@/lib/seo/site-config';

export const metadata: Metadata = {
  title: 'JPG to PDF — PNG to PDF Converter | DevToolsHub',
  description:
    'Convert JPG and PNG images to PDF instantly in your browser. Combine multiple images into one PDF, control page size, margins, and image placement. No upload — your images stay on your device.',
  keywords: [
    'jpg to pdf',
    'png to pdf',
    'image to pdf',
    'convert jpg to pdf',
    'convert png to pdf',
    'photos to pdf',
    'browser pdf converter',
    'offline image to pdf',
    'multiple images to pdf',
  ],
  alternates: {
    canonical: siteUrl('/pdf-tools/jpg-png-to-pdf'),
  },
  openGraph: {
    title: 'JPG to PDF — PNG to PDF Converter | DevToolsHub',
    description:
      'Combine JPG and PNG images into a PDF entirely in your browser. Control page size, orientation, margins, and image placement. No server upload.',
    url: siteUrl('/pdf-tools/jpg-png-to-pdf'),
    siteName: 'DevToolsHub',
    type: 'website',
  },
};

export default function JpgPngToPdfLayout({ children }: { children: React.ReactNode }) {
  return children;
}
