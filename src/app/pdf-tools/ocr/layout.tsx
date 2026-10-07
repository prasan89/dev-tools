import type { Metadata } from 'next';
import { siteUrl } from '@/lib/seo/site-config';

export const metadata: Metadata = {
  title: 'OCR — Image to Text Online Free | DevToolsHub',
  description:
    'Extract text from images using optical character recognition (OCR). Supports PNG, JPEG, WebP, and TIFF. All processing in your browser — no uploads.',
  keywords: [
    'OCR online',
    'image to text',
    'optical character recognition',
    'extract text from image',
    'OCR free',
    'photo to text',
    'scan to text',
    'text recognition',
    'OCR tool browser',
    'Tesseract OCR online',
  ],
  alternates: {
    canonical: siteUrl('/pdf-tools/ocr'),
  },
  openGraph: {
    title: 'OCR — Image to Text Online | DevToolsHub',
    description: 'Extract text from images with OCR. Browser-based, no uploads, complete privacy.',
    url: siteUrl('/pdf-tools/ocr'),
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'OCR Image to Text Online Free | DevToolsHub',
    description: 'Extract text from images using Tesseract OCR. All processing in your browser.',
  },
};

export default function OcrLayout({ children }: { children: React.ReactNode }) {
  return children;
}
