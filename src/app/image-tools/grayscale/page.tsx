import type { Metadata } from 'next';
import GrayscaleClient from './_client';
import { siteUrl } from '@/lib/seo/site-config';

export const metadata: Metadata = {
  title: 'Grayscale Image Converter Online Free | DevToolsHub',
  description: 'Convert images to grayscale online with adjustable intensity. Blend from full color to black and white. No uploads — processed in your browser.',
  alternates: { canonical: siteUrl('/image-tools/grayscale') },
};

export default function GrayscalePage() { return <GrayscaleClient />; }
