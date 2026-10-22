import type { Metadata } from 'next';
import PixelateClient from './_client';
import { siteUrl } from '@/lib/seo/site-config';

export const metadata: Metadata = {
  title: 'Pixelate Image Online Free | DevToolsHub',
  description: 'Pixelate images with adjustable block size for privacy, art, or effect. Nearest-neighbor scaling preserves crisp pixel blocks. No uploads required.',
  alternates: { canonical: siteUrl('/image-tools/pixelate') },
};

export default function PixelatePage() { return <PixelateClient />; }
