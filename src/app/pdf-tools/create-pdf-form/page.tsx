import type { Metadata } from 'next';
import { pdfToolMetadata } from '@/lib/seo/pdf-tools';

export const metadata: Metadata = pdfToolMetadata('create-pdf-form') ?? {};

export { default } from './_client';
