import type { Metadata } from 'next';
import { pdfToolMetadata } from '@/lib/seo/pdf-tools';

export const metadata: Metadata = pdfToolMetadata('merge-pdf') ?? {};

export { default } from './_client';
