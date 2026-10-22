import type { Metadata } from 'next';
import { siteUrl } from '@/lib/seo/site-config';
import CompressClient from './_client';

export const metadata: Metadata = {
  title: 'Compress Image Online — Reduce Image File Size Free',
  description:
    'Reduce JPEG, PNG, and WebP image file size online. Adjust quality, set max dimensions, or target a specific file size. Browser-based — your images never leave your device.',
  alternates: { canonical: siteUrl('/image-tools/compress') },
  keywords: ['compress image', 'reduce image size', 'image optimizer', 'jpeg compressor', 'png compressor', 'webp compressor'],
  openGraph: {
    title: 'Compress Image Online — DevToolsHub',
    description: 'Reduce image file size free in your browser.',
    url: siteUrl('/image-tools/compress'),
    type: 'website',
  },
};

export default function CompressPage() {
  return <CompressClient />;
}
