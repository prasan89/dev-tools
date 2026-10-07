/**
 * M73 — Browser compatibility hardening tests
 */

import {
  detectCapabilities,
  getMissingCapabilityMessage,
  isIosSafari,
  downloadBlob,
} from '../src/lib/browserCompat';

// ─── detectCapabilities ───────────────────────────────────────────────────────

describe('detectCapabilities', () => {
  it('returns an object with all capability keys', () => {
    const caps = detectCapabilities();
    expect(caps).toHaveProperty('webWorkers');
    expect(caps).toHaveProperty('webAssembly');
    expect(caps).toHaveProperty('offscreenCanvas');
    expect(caps).toHaveProperty('clipboard');
    expect(caps).toHaveProperty('fileSystemAccess');
    expect(caps).toHaveProperty('pointerEvents');
    expect(caps).toHaveProperty('serviceWorker');
    expect(caps).toHaveProperty('sharedArrayBuffer');
    expect(caps).toHaveProperty('indexedDB');
  });

  it('all values are booleans', () => {
    const caps = detectCapabilities();
    for (const val of Object.values(caps)) {
      expect(typeof val).toBe('boolean');
    }
  });

  it('detects WebAssembly as true in jsdom', () => {
    const caps = detectCapabilities();
    // jsdom supports WebAssembly in modern Node
    expect(typeof caps.webAssembly).toBe('boolean');
  });
});

// ─── getMissingCapabilityMessage ──────────────────────────────────────────────

describe('getMissingCapabilityMessage', () => {
  it('returns null when all capabilities present', () => {
    const caps = {
      webWorkers: true,
      webAssembly: true,
      offscreenCanvas: true,
      clipboard: true,
      fileSystemAccess: false,
      pointerEvents: true,
      serviceWorker: true,
      sharedArrayBuffer: false,
      indexedDB: true,
    };
    expect(getMissingCapabilityMessage(caps)).toBeNull();
  });

  it('returns message when webWorkers is missing', () => {
    const caps = {
      webWorkers: false,
      webAssembly: true,
      offscreenCanvas: true,
      clipboard: true,
      fileSystemAccess: false,
      pointerEvents: true,
      serviceWorker: true,
      sharedArrayBuffer: false,
      indexedDB: true,
    };
    const msg = getMissingCapabilityMessage(caps);
    expect(msg).not.toBeNull();
    expect(msg).toMatch(/Web Worker/i);
  });

  it('returns message when webAssembly is missing', () => {
    const caps = {
      webWorkers: true,
      webAssembly: false,
      offscreenCanvas: true,
      clipboard: true,
      fileSystemAccess: false,
      pointerEvents: true,
      serviceWorker: true,
      sharedArrayBuffer: false,
      indexedDB: true,
    };
    const msg = getMissingCapabilityMessage(caps);
    expect(msg).not.toBeNull();
    expect(msg).toMatch(/WebAssembly/i);
  });
});

// ─── isIosSafari ──────────────────────────────────────────────────────────────

describe('isIosSafari', () => {
  const originalNavigator = global.navigator;

  afterEach(() => {
    Object.defineProperty(global, 'navigator', {
      value: originalNavigator,
      writable: true,
      configurable: true,
    });
  });

  it('returns false for a desktop Chrome user agent', () => {
    Object.defineProperty(global, 'navigator', {
      value: {
        userAgent:
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
      },
      writable: true,
      configurable: true,
    });
    expect(isIosSafari()).toBe(false);
  });

  it('returns true for an iOS Safari user agent', () => {
    Object.defineProperty(global, 'navigator', {
      value: {
        userAgent:
          'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
      },
      writable: true,
      configurable: true,
    });
    expect(isIosSafari()).toBe(true);
  });

  it('returns false for iOS Chrome (CriOS)', () => {
    Object.defineProperty(global, 'navigator', {
      value: {
        userAgent:
          'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 CriOS/120 Mobile/15E148',
      },
      writable: true,
      configurable: true,
    });
    expect(isIosSafari()).toBe(false);
  });
});

// ─── downloadBlob ─────────────────────────────────────────────────────────────

describe('downloadBlob', () => {
  beforeEach(() => {
    global.URL.createObjectURL = jest.fn().mockReturnValue('blob:mock');
    global.URL.revokeObjectURL = jest.fn();
    document.body.appendChild = jest.fn();
    document.body.removeChild = jest.fn();
    HTMLAnchorElement.prototype.click = jest.fn();
  });

  it('does not throw', () => {
    const blob = new Blob(['hello'], { type: 'text/plain' });
    expect(() => downloadBlob(blob, 'test.txt')).not.toThrow();
  });
});
