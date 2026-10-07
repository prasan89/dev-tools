/**
 * M72 — PWA support tests
 */

describe('manifest route', () => {
  it('exports a default function', async () => {
    const mod = await import('../src/app/manifest');
    expect(typeof mod.default).toBe('function');
  });

  it('manifest has required PWA fields', async () => {
    const mod = await import('../src/app/manifest');
    const manifest = mod.default();
    expect(manifest).toHaveProperty('name');
    expect(manifest).toHaveProperty('short_name');
    expect(manifest).toHaveProperty('start_url');
    expect(manifest).toHaveProperty('display');
    expect(manifest).toHaveProperty('icons');
  });

  it('manifest display is standalone', async () => {
    const mod = await import('../src/app/manifest');
    const manifest = mod.default();
    expect(manifest.display).toBe('standalone');
  });

  it('manifest has at least one icon', async () => {
    const mod = await import('../src/app/manifest');
    const manifest = mod.default();
    expect(Array.isArray(manifest.icons)).toBe(true);
    expect((manifest.icons as unknown[]).length).toBeGreaterThan(0);
  });

  it('start_url points to pdf-tools', async () => {
    const mod = await import('../src/app/manifest');
    const manifest = mod.default();
    expect(manifest.start_url).toContain('/pdf-tools');
  });

  it('prefer_related_applications is false', async () => {
    const mod = await import('../src/app/manifest');
    const manifest = mod.default();
    expect(manifest.prefer_related_applications).toBe(false);
  });
});

describe('ServiceWorkerRegistration component', () => {
  it('exports ServiceWorkerRegistration', async () => {
    const mod = await import('../src/components/pwa/ServiceWorkerRegistration');
    expect(typeof mod.ServiceWorkerRegistration).toBe('function');
  });
});

describe('service worker file', () => {
  it('sw.js exists in public/', () => {
    const fs = require('fs');
    const path = require('path');
    const swPath = path.resolve(__dirname, '../public/sw.js');
    expect(fs.existsSync(swPath)).toBe(true);
  });

  it('sw.js does not cache user documents', () => {
    const fs = require('fs');
    const path = require('path');
    const sw = fs.readFileSync(path.resolve(__dirname, '../public/sw.js'), 'utf8');
    expect(sw).not.toMatch(/user.pdf|document\.pdf|file\.pdf/i);
  });
});
