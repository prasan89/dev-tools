/**
 * Browser capability detection utilities.
 * Used to gracefully degrade when optional browser APIs are unavailable.
 */

export interface BrowserCapabilities {
  webWorkers: boolean;
  webAssembly: boolean;
  offscreenCanvas: boolean;
  clipboard: boolean;
  fileSystemAccess: boolean;
  pointerEvents: boolean;
  serviceWorker: boolean;
  sharedArrayBuffer: boolean;
  indexedDB: boolean;
}

export function detectCapabilities(): BrowserCapabilities {
  const isClient = typeof window !== 'undefined';

  return {
    webWorkers: isClient && typeof Worker !== 'undefined',
    webAssembly: isClient && typeof WebAssembly !== 'undefined',
    offscreenCanvas: isClient && typeof OffscreenCanvas !== 'undefined',
    clipboard: isClient && typeof navigator !== 'undefined' && !!navigator.clipboard,
    fileSystemAccess: isClient && typeof (window as Window & { showOpenFilePicker?: unknown }).showOpenFilePicker === 'function',
    pointerEvents: isClient && typeof window.PointerEvent !== 'undefined',
    serviceWorker: isClient && typeof navigator !== 'undefined' && 'serviceWorker' in navigator,
    sharedArrayBuffer: isClient && typeof SharedArrayBuffer !== 'undefined',
    indexedDB: isClient && typeof indexedDB !== 'undefined',
  };
}

// Returns a user-friendly message if a critical capability is missing.
export function getMissingCapabilityMessage(caps: BrowserCapabilities): string | null {
  if (!caps.webWorkers) {
    return 'Your browser does not support Web Workers. Some operations may be slower. Please update your browser for the best experience.';
  }
  if (!caps.webAssembly) {
    return 'Your browser does not support WebAssembly. OCR and some advanced features may not be available. Please update your browser.';
  }
  return null;
}

// Checks if the browser is iOS Safari (for known download behavior differences)
export function isIosSafari(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent;
  return /iP(hone|od|ad)/.test(ua) && /WebKit/.test(ua) && !/CriOS/.test(ua);
}

// Download a blob safely across browsers including iOS
export function downloadBlob(blob: Blob, filename: string): void {
  if (typeof window === 'undefined') return;
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  // Revoke after a short delay to allow the download to start
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// Returns whether the clipboard API is available for writing text
export async function canWriteToClipboard(): Promise<boolean> {
  if (typeof navigator === 'undefined' || !navigator.clipboard) return false;
  try {
    // Check permissions if available
    if (navigator.permissions) {
      const result = await navigator.permissions.query({ name: 'clipboard-write' as PermissionName });
      return result.state !== 'denied';
    }
    return true;
  } catch {
    return true; // assume available if permissions API is not supported
  }
}
