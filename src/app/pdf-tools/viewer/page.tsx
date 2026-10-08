import type { Metadata } from 'next';
import { pdfToolMetadata } from '@/lib/seo/pdf-tools';

export const metadata: Metadata = pdfToolMetadata('viewer') ?? {};

export { default } from './_client';
