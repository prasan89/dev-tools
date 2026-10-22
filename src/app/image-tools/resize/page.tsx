import type { Metadata } from 'next';
import { siteUrl } from '@/lib/seo/site-config';
import ResizeClient from './_client';

export const metadata: Metadata = {
  title: 'Resize Image Online — Free Image Resizer',
  description:
    'Resize JPEG, PNG, and WebP images by pixel dimensions or percentage. Lock aspect ratio or set custom sizes. Browser-based — your images never leave your device.',
  alternates: { canonical: siteUrl('/image-tools/resize') },
  keywords: ['resize image', 'image resizer', 'scale image', 'change image dimensions', 'resize photo online'],
  openGraph: {
    title: 'Resize Image Online — DevToolsHub',
    description: 'Resize images free in your browser.',
    url: siteUrl('/image-tools/resize'),
    type: 'website',
  },
};

export default function ResizePage() {
  return <ResizeClient />;
}
