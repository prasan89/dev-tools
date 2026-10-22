import type { Metadata } from 'next';
import { siteUrl } from '@/lib/seo/site-config';
import RotateFlipClient from './_client';

export const metadata: Metadata = {
  title: 'Rotate & Flip Image Online — Free Image Rotator',
  description:
    'Rotate images 90°, 180°, or 270°. Flip horizontally or vertically. Batch processing supported. Browser-based — your images never leave your device.',
  alternates: { canonical: siteUrl('/image-tools/rotate-flip') },
  keywords: ['rotate image', 'flip image', 'image rotator', 'rotate photo online', 'flip photo', 'mirror image'],
  openGraph: {
    title: 'Rotate & Flip Image Online — DevToolsHub',
    description: 'Rotate and flip images free in your browser.',
    url: siteUrl('/image-tools/rotate-flip'),
    type: 'website',
  },
};

export default function RotateFlipPage() {
  return <RotateFlipClient />;
}
