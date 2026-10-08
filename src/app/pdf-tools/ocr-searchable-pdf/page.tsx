import type { Metadata } from 'next';
import { pdfToolMetadata } from '@/lib/seo/pdf-tools';

export const metadata: Metadata = pdfToolMetadata('ocr-searchable-pdf') ?? {};

export { default } from './_client';
