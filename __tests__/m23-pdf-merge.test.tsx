/**
 * M23 — MergePdfPage component tests
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import MergePdfPage from '../src/app/pdf-tools/merge-pdf/page';
import type { PdfFile } from '../src/types/pdf';

// Mock URL APIs
global.URL.createObjectURL = jest.fn(() => 'blob:mock://merged');
global.URL.revokeObjectURL = jest.fn();

// Mock mergePdfFiles to avoid full pdf-lib in component tests
jest.mock('../src/lib/pdf/merge', () => ({
  mergePdfFiles: jest.fn(),
}));

function makePdfFile(name: string, pageCount: number | null = null): PdfFile {
  return {
    id: `id-${name}-${Math.random()}`,
    name,
    size: 1024,
    file: new File(['%PDF-1.4'], name, { type: 'application/pdf' }),
    objectUrl: null,
    pageCount,
    isPasswordProtected: false,
    isCorrupted: false,
    loadedAt: Date.now(),
  };
}

import { mergePdfFiles } from '../src/lib/pdf/merge';
const mockMergePdfFiles = mergePdfFiles as jest.MockedFunction<typeof mergePdfFiles>;

describe('MergePdfPage component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the dropzone when no files selected', () => {
    render(<MergePdfPage />);
    expect(screen.getByRole('button', { name: /drag.*pdf|select.*pdf/i })).toBeInTheDocument();
  });

  it('shows "Add at least 2 PDFs" hint when only 1 file added', () => {
    render(<MergePdfPage />);
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['%PDF-1.4'], 'one.pdf', { type: 'application/pdf' });
    Object.defineProperty(input, 'files', { value: [file], configurable: true });
    fireEvent.change(input);

    expect(screen.getByText(/at least 2/i)).toBeInTheDocument();
  });

  it('shows file list when files are selected', () => {
    render(<MergePdfPage />);
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const files = [
      new File(['%PDF-1.4'], 'first.pdf', { type: 'application/pdf' }),
      new File(['%PDF-1.4'], 'second.pdf', { type: 'application/pdf' }),
    ];
    Object.defineProperty(input, 'files', { value: files, configurable: true });
    fireEvent.change(input);

    expect(screen.getByText('first.pdf')).toBeInTheDocument();
    expect(screen.getByText('second.pdf')).toBeInTheDocument();
  });

  it('shows clear all button when files are loaded', () => {
    render(<MergePdfPage />);
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const files = [
      new File(['%PDF-1.4'], 'a.pdf', { type: 'application/pdf' }),
      new File(['%PDF-1.4'], 'b.pdf', { type: 'application/pdf' }),
    ];
    Object.defineProperty(input, 'files', { value: files, configurable: true });
    fireEvent.change(input);

    expect(screen.getByText(/clear all/i)).toBeInTheDocument();
  });

  it('removes a file when remove button clicked', () => {
    render(<MergePdfPage />);
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const files = [
      new File(['%PDF-1.4'], 'keep.pdf', { type: 'application/pdf' }),
      new File(['%PDF-1.4'], 'remove-me.pdf', { type: 'application/pdf' }),
    ];
    Object.defineProperty(input, 'files', { value: files, configurable: true });
    fireEvent.change(input);

    const removeBtn = screen.getByLabelText(/remove remove-me\.pdf/i);
    fireEvent.click(removeBtn);

    expect(screen.queryByText('remove-me.pdf')).not.toBeInTheDocument();
    expect(screen.getByText('keep.pdf')).toBeInTheDocument();
  });

  it('clears all files when Clear all clicked', () => {
    render(<MergePdfPage />);
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const files = [
      new File(['%PDF-1.4'], 'a.pdf', { type: 'application/pdf' }),
      new File(['%PDF-1.4'], 'b.pdf', { type: 'application/pdf' }),
    ];
    Object.defineProperty(input, 'files', { value: files, configurable: true });
    fireEvent.change(input);

    fireEvent.click(screen.getByText(/clear all/i));

    expect(screen.queryByText('a.pdf')).not.toBeInTheDocument();
    expect(screen.queryByText('b.pdf')).not.toBeInTheDocument();
  });

  it('shows merge button when 2+ files selected', () => {
    render(<MergePdfPage />);
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const files = [
      new File(['%PDF-1.4'], 'a.pdf', { type: 'application/pdf' }),
      new File(['%PDF-1.4'], 'b.pdf', { type: 'application/pdf' }),
    ];
    Object.defineProperty(input, 'files', { value: files, configurable: true });
    fireEvent.change(input);

    expect(screen.getByRole('button', { name: /merge 2 pdfs/i })).toBeInTheDocument();
  });

  it('shows success state after successful merge', async () => {
    mockMergePdfFiles.mockResolvedValue({
      success: true,
      blob: new Blob(['%PDF-1.4 merged'], { type: 'application/pdf' }),
      filename: 'merged.pdf',
      pageCount: 4,
      sizeBytes: 16384,
    });

    render(<MergePdfPage />);
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const files = [
      new File(['%PDF-1.4'], 'a.pdf', { type: 'application/pdf' }),
      new File(['%PDF-1.4'], 'b.pdf', { type: 'application/pdf' }),
    ];
    Object.defineProperty(input, 'files', { value: files, configurable: true });
    fireEvent.change(input);

    fireEvent.click(screen.getByRole('button', { name: /merge 2 pdfs/i }));

    await waitFor(() => {
      expect(screen.getByText(/PDFs merged successfully/i)).toBeInTheDocument();
    });
    expect(screen.getByText('4')).toBeInTheDocument(); // page count
  });

  it('shows error state when merge fails', async () => {
    mockMergePdfFiles.mockResolvedValue({
      success: false,
      error: 'File is corrupted',
      fileIndex: 0,
      filename: 'bad.pdf',
    });

    render(<MergePdfPage />);
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const files = [
      new File(['%PDF-1.4'], 'bad.pdf', { type: 'application/pdf' }),
      new File(['%PDF-1.4'], 'good.pdf', { type: 'application/pdf' }),
    ];
    Object.defineProperty(input, 'files', { value: files, configurable: true });
    fireEvent.change(input);

    fireEvent.click(screen.getByRole('button', { name: /merge 2 pdfs/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
    expect(screen.getByText(/File is corrupted/i)).toBeInTheDocument();
  });

  it('does not add duplicate filenames', () => {
    render(<MergePdfPage />);
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const files = [
      new File(['%PDF-1.4'], 'same.pdf', { type: 'application/pdf' }),
    ];
    Object.defineProperty(input, 'files', { value: files, configurable: true });
    fireEvent.change(input);
    // Try adding same file again
    fireEvent.change(input);

    const items = screen.getAllByText('same.pdf');
    expect(items.length).toBe(1);
  });

  it('reorders files with move up/down buttons', () => {
    render(<MergePdfPage />);
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const files = [
      new File(['%PDF-1.4'], 'alpha.pdf', { type: 'application/pdf' }),
      new File(['%PDF-1.4'], 'beta.pdf', { type: 'application/pdf' }),
    ];
    Object.defineProperty(input, 'files', { value: files, configurable: true });
    fireEvent.change(input);

    // Move beta up (index 1 → 0)
    const moveUpBtn = screen.getByLabelText(/move beta\.pdf up/i);
    fireEvent.click(moveUpBtn);

    const items = screen.getAllByRole('listitem');
    expect(items[0]).toHaveTextContent('beta.pdf');
    expect(items[1]).toHaveTextContent('alpha.pdf');
  });

  it('disables move up for first file', () => {
    render(<MergePdfPage />);
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const files = [
      new File(['%PDF-1.4'], 'first.pdf', { type: 'application/pdf' }),
      new File(['%PDF-1.4'], 'second.pdf', { type: 'application/pdf' }),
    ];
    Object.defineProperty(input, 'files', { value: files, configurable: true });
    fireEvent.change(input);

    const moveUpBtn = screen.getByLabelText(/move first\.pdf up/i);
    expect(moveUpBtn).toBeDisabled();
  });

  it('disables move down for last file', () => {
    render(<MergePdfPage />);
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const files = [
      new File(['%PDF-1.4'], 'first.pdf', { type: 'application/pdf' }),
      new File(['%PDF-1.4'], 'last.pdf', { type: 'application/pdf' }),
    ];
    Object.defineProperty(input, 'files', { value: files, configurable: true });
    fireEvent.change(input);

    const moveDownBtn = screen.getByLabelText(/move last\.pdf down/i);
    expect(moveDownBtn).toBeDisabled();
  });

  it('shows "Merge another set" after successful merge', async () => {
    mockMergePdfFiles.mockResolvedValue({
      success: true,
      blob: new Blob(['%PDF-1.4'], { type: 'application/pdf' }),
      filename: 'merged.pdf',
      pageCount: 2,
      sizeBytes: 8192,
    });

    render(<MergePdfPage />);
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const files = [
      new File(['%PDF-1.4'], 'x.pdf', { type: 'application/pdf' }),
      new File(['%PDF-1.4'], 'y.pdf', { type: 'application/pdf' }),
    ];
    Object.defineProperty(input, 'files', { value: files, configurable: true });
    fireEvent.change(input);
    fireEvent.click(screen.getByRole('button', { name: /merge 2 pdfs/i }));

    await waitFor(() => {
      expect(screen.getByText(/Merge another set/i)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText(/Merge another set/i));
    // Should reset to empty state
    expect(screen.getByRole('button', { name: /drag.*pdf|select.*pdf/i })).toBeInTheDocument();
  });

  it('calls URL.revokeObjectURL on cleanup', async () => {
    mockMergePdfFiles.mockResolvedValue({
      success: true,
      blob: new Blob(['%PDF-1.4'], { type: 'application/pdf' }),
      filename: 'merged.pdf',
      pageCount: 2,
      sizeBytes: 8192,
    });

    render(<MergePdfPage />);
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const files = [
      new File(['%PDF-1.4'], 'p.pdf', { type: 'application/pdf' }),
      new File(['%PDF-1.4'], 'q.pdf', { type: 'application/pdf' }),
    ];
    Object.defineProperty(input, 'files', { value: files, configurable: true });
    fireEvent.change(input);
    fireEvent.click(screen.getByRole('button', { name: /merge 2 pdfs/i }));

    await waitFor(() => screen.getByText(/PDFs merged successfully/i));

    // Clicking "Merge another set" should revoke the blob URL
    fireEvent.click(screen.getByText(/Merge another set/i));
    expect(URL.revokeObjectURL).toHaveBeenCalled();
  });
});
