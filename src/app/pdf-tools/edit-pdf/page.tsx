import type { Metadata } from 'next';
import { pdfToolMetadata } from '@/lib/seo/pdf-tools';
import EditPdfClient from './_client';

export const metadata: Metadata = pdfToolMetadata('edit-pdf') ?? {};

export default function EditPdfPage() {
  return <EditPdfClient />;
}
