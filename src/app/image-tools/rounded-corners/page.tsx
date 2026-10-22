import type { Metadata } from 'next';
import RoundedCornersClient from './_client';
import { siteUrl } from '@/lib/seo/site-config';

export const metadata: Metadata = {
  title: 'Round Image Corners Online Free | DevToolsHub',
  description: 'Add rounded corners to images with adjustable radius. Export as PNG with transparent corners or JPEG with a custom background. No uploads needed.',
  alternates: { canonical: siteUrl('/image-tools/rounded-corners') },
};

export default function RoundedCornersPage() { return <RoundedCornersClient />; }
