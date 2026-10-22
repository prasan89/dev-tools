import type { Metadata } from 'next';
import { siteUrl } from '@/lib/seo/site-config';
import ConvertClient from './_client';

export const metadata: Metadata = {
  title: 'Convert Image Format Online — JPEG, PNG, WebP Converter',
  description:
    'Convert images between JPEG, PNG, and WebP formats free in your browser. Control output quality and see transparency warnings. Your files stay on your device.',
  alternates: { canonical: siteUrl('/image-tools/convert') },
  keywords: ['convert image', 'image converter', 'jpg to png', 'png to jpg', 'png to webp', 'jpg to webp', 'webp converter'],
  openGraph: {
    title: 'Convert Image Format Online — DevToolsHub',
    description: 'Convert images between JPEG, PNG, and WebP free in your browser.',
    url: siteUrl('/image-tools/convert'),
    type: 'website',
  },
};

export default function ConvertPage() {
  return <ConvertClient />;
}
