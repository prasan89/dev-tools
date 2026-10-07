/**
 * M22 — PdfDropzone component tests (JSX)
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { PdfDropzone } from '../src/components/pdf/PdfDropzone';

// Mock URL APIs for jsdom
const mockObjectUrl = 'blob:mock://test-url';
global.URL.createObjectURL = jest.fn(() => mockObjectUrl);
global.URL.revokeObjectURL = jest.fn();

describe('PdfDropzone component', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the dropzone with correct role', () => {
    render(<PdfDropzone onFilesSelected={jest.fn()} />);
    const dropzone = screen.getByRole('button');
    expect(dropzone).toBeInTheDocument();
    expect(dropzone).toHaveAttribute('aria-label');
  });

  it('shows drag and drop text', () => {
    render(<PdfDropzone onFilesSelected={jest.fn()} />);
    expect(screen.getByText(/drag & drop pdf here/i)).toBeInTheDocument();
  });

  it('calls onFilesSelected with valid PDF file', () => {
    const onFilesSelected = jest.fn();
    render(<PdfDropzone onFilesSelected={onFilesSelected} />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['%PDF-1.4 fake content'], 'test.pdf', { type: 'application/pdf' });
    Object.defineProperty(input, 'files', { value: [file], configurable: true });
    fireEvent.change(input);

    expect(onFilesSelected).toHaveBeenCalledTimes(1);
    const calledWith = onFilesSelected.mock.calls[0][0];
    expect(calledWith).toHaveLength(1);
    expect(calledWith[0].name).toBe('test.pdf');
    expect(calledWith[0].size).toBe(file.size);
  });

  it('shows error for invalid file type', () => {
    const onFilesSelected = jest.fn();
    render(<PdfDropzone onFilesSelected={onFilesSelected} />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['fake content'], 'image.jpg', { type: 'image/jpeg' });
    Object.defineProperty(input, 'files', { value: [file], configurable: true });
    fireEvent.change(input);

    expect(onFilesSelected).not.toHaveBeenCalled();
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('shows error for empty file', () => {
    const onFilesSelected = jest.fn();
    render(<PdfDropzone onFilesSelected={onFilesSelected} />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File([], 'empty.pdf', { type: 'application/pdf' });
    Object.defineProperty(input, 'files', { value: [file], configurable: true });
    fireEvent.change(input);

    expect(onFilesSelected).not.toHaveBeenCalled();
    expect(screen.getByText(/is empty/i)).toBeInTheDocument();
  });

  it('is keyboard accessible (Enter key opens file picker)', () => {
    render(<PdfDropzone onFilesSelected={jest.fn()} />);
    const dropzone = screen.getByRole('button');
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const clickSpy = jest.spyOn(input, 'click');

    fireEvent.keyDown(dropzone, { key: 'Enter' });
    expect(clickSpy).toHaveBeenCalled();
  });

  it('is keyboard accessible (Space key opens file picker)', () => {
    render(<PdfDropzone onFilesSelected={jest.fn()} />);
    const dropzone = screen.getByRole('button');
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const clickSpy = jest.spyOn(input, 'click');

    fireEvent.keyDown(dropzone, { key: ' ' });
    expect(clickSpy).toHaveBeenCalled();
  });

  it('is disabled when disabled prop is true', () => {
    render(<PdfDropzone onFilesSelected={jest.fn()} disabled />);
    const dropzone = screen.getByRole('button');
    expect(dropzone).toHaveAttribute('aria-disabled', 'true');
  });

  it('handles drag over event by changing visual state', () => {
    render(<PdfDropzone onFilesSelected={jest.fn()} />);
    const dropzone = screen.getByRole('button');

    fireEvent.dragOver(dropzone);
    expect(screen.getByText(/drop pdf here/i)).toBeInTheDocument();

    fireEvent.dragLeave(dropzone);
    expect(screen.getByText(/drag & drop pdf here/i)).toBeInTheDocument();
  });

  it('handles drop with valid PDF', () => {
    const onFilesSelected = jest.fn();
    render(<PdfDropzone onFilesSelected={onFilesSelected} />);
    const dropzone = screen.getByRole('button');

    const file = new File(['%PDF-1.4'], 'dropped.pdf', { type: 'application/pdf' });
    const dataTransfer = { files: [file] };

    fireEvent.drop(dropzone, { dataTransfer });
    expect(onFilesSelected).toHaveBeenCalledTimes(1);
    expect(onFilesSelected.mock.calls[0][0][0].name).toBe('dropped.pdf');
  });

  it('limits files to maxFiles when multiple files selected', () => {
    const onFilesSelected = jest.fn();
    render(<PdfDropzone onFilesSelected={onFilesSelected} maxFiles={2} multiple />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const files = [
      new File(['%PDF-1.4'], 'a.pdf', { type: 'application/pdf' }),
      new File(['%PDF-1.4'], 'b.pdf', { type: 'application/pdf' }),
      new File(['%PDF-1.4'], 'c.pdf', { type: 'application/pdf' }),
    ];
    Object.defineProperty(input, 'files', { value: files, configurable: true });
    fireEvent.change(input);

    const calledWith = onFilesSelected.mock.calls[0][0];
    expect(calledWith).toHaveLength(2);
    expect(screen.getByText(/only the first 2/i)).toBeInTheDocument();
  });
});

// ─────────────────────────────────────────────
// PdfDropzone — object URL tracking
// ─────────────────────────────────────────────

describe('PdfDropzone object URL tracking', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('PdfFile includes an id from crypto.randomUUID', () => {
    const onFilesSelected = jest.fn();
    render(<PdfDropzone onFilesSelected={onFilesSelected} />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['%PDF-1.4 fake'], 'doc.pdf', { type: 'application/pdf' });
    Object.defineProperty(input, 'files', { value: [file], configurable: true });
    fireEvent.change(input);

    const pdfFile = onFilesSelected.mock.calls[0][0][0];
    expect(typeof pdfFile.id).toBe('string');
    expect(pdfFile.id.length).toBeGreaterThan(0);
  });

  it('PdfFile has correct metadata', () => {
    const onFilesSelected = jest.fn();
    render(<PdfDropzone onFilesSelected={onFilesSelected} />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['%PDF-1.4 content here'], 'myfile.pdf', { type: 'application/pdf' });
    Object.defineProperty(input, 'files', { value: [file], configurable: true });
    fireEvent.change(input);

    const pdfFile = onFilesSelected.mock.calls[0][0][0];
    expect(pdfFile.name).toBe('myfile.pdf');
    expect(pdfFile.size).toBe(file.size);
    expect(pdfFile.pageCount).toBeNull();
    expect(pdfFile.isPasswordProtected).toBe(false);
    expect(pdfFile.isCorrupted).toBe(false);
    expect(pdfFile.objectUrl).toBeNull();
    expect(pdfFile.loadedAt).toBeGreaterThan(0);
  });
});
