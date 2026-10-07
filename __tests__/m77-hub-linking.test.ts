describe('PDF hub categorization', () => {
  it('hub page exports a default component', async () => {
    const mod = await import('../src/app/pdf-tools/page');
    expect(mod.default).toBeDefined();
    expect(typeof mod.default).toBe('function');
  });
});

describe('All tool hrefs start with /pdf-tools/', () => {
  it('no tool has an external href', () => {
    const fs = require('fs');
    const path = require('path');
    const content = fs.readFileSync(
      path.resolve(__dirname, '../src/app/pdf-tools/page.tsx'),
      'utf8'
    );
    const hrefMatches = content.match(/href:\s*['"]([^'"]+)['"]/g) ?? [];
    for (const m of hrefMatches) {
      const url = m.match(/['"]([^'"]+)['"]/)?.[1] ?? '';
      if (url) expect(url).toMatch(/^\/pdf-tools\//);
    }
  });
});
