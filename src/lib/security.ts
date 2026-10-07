/**
 * Security utilities for PDFTools.
 * Provides safe text sanitization for user-facing content.
 * User documents are never transmitted; this module handles display-time safety.
 */

// Sanitize extracted text for safe display in the DOM.
// Strips HTML tags and encodes special characters.
// NEVER use innerHTML/dangerouslySetInnerHTML with unsanitized OCR/PDF content.
export function sanitizeExtractedText(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

// Strip all HTML tags from a string (for plain-text display).
export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '');
}

// Sanitize a filename to prevent path traversal and injection.
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[/\\:*?"<>|]/g, '_')
    .replace(/\.{2,}/g, '.')
    .trim()
    .slice(0, 255);
}

// Validate that a URL is safe to use (http/https only, no javascript: or data: schemes).
export function isSafeUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

// Validate that a Worker message has a safe structure.
// Returns false if the message structure looks malicious or unexpected.
export function isValidWorkerPayload(payload: unknown): boolean {
  if (payload === null || payload === undefined) return true;
  if (typeof payload === 'string' || typeof payload === 'number' || typeof payload === 'boolean') {
    return true;
  }
  if (payload instanceof ArrayBuffer || payload instanceof Uint8Array) return true;
  if (typeof payload === 'object' && !Array.isArray(payload)) {
    // Reject payloads with function values
    for (const val of Object.values(payload as Record<string, unknown>)) {
      if (typeof val === 'function') return false;
    }
    return true;
  }
  if (Array.isArray(payload)) return true;
  return false;
}

// Ensure metadata values are plain strings (no HTML injection).
export function sanitizeMetadataValue(value: unknown): string {
  if (typeof value !== 'string') return '';
  return sanitizeExtractedText(value.slice(0, 1000));
}

// Check that a password was not accidentally included in an analytics event.
// (Passwords should never appear in any analytics payload.)
export function containsPassword(obj: Record<string, unknown>): boolean {
  const keys = Object.keys(obj).map((k) => k.toLowerCase());
  return keys.some((k) => k.includes('password') || k.includes('passwd') || k.includes('secret'));
}
