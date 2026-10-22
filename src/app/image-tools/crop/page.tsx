import type { Metadata } from 'next';
import { siteUrl } from '@/lib/seo/site-config';
import CropClient from './_client';

export const metadata: Metadata = {
  title: 'Crop Image Online — Free Image Cropper',
  description:
    'Crop JPEG, PNG, and WebP images interactively. Select freeform or preset aspect ratios. Enter exact pixel coordinates. Browser-based — your images never leave your device.',
  alternates: { canonical: siteUrl('/image-tools/crop') },
  keywords: ['crop image', 'image cropper', 'crop photo online', 'trim image', 'cut image online'],
  openGraph: {
    title: 'Crop Image Online — DevToolsHub',
    description: 'Crop images free and privately in your browser.',
    url: siteUrl('/image-tools/crop'),
    type: 'website',
  },
};

export default function CropPage() {
  return <CropClient />;
}
