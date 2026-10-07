describe('PDF tools hub SEO', () => {
  it('hub page metadata has title', async () => {
    const mod = await import('../src/app/pdf-tools/page');
    expect(mod.metadata).toBeDefined();
    expect(String(mod.metadata.title)).toMatch(/PDF Tools/i);
  });

  it('hub page has canonical', async () => {
    const mod = await import('../src/app/pdf-tools/page');
    expect(mod.metadata.alternates?.canonical).toBeTruthy();
  });

  it('pdf-to-word layout has canonical', async () => {
    const mod = await import('../src/app/pdf-tools/pdf-to-word/layout');
    expect(mod.metadata.alternates?.canonical).toBeTruthy();
  });

  it('pdf-to-excel layout has canonical', async () => {
    const mod = await import('../src/app/pdf-tools/pdf-to-excel/layout');
    expect(mod.metadata.alternates?.canonical).toBeTruthy();
  });

  it('word-to-pdf layout has canonical', async () => {
    const mod = await import('../src/app/pdf-tools/word-to-pdf/layout');
    expect(mod.metadata.alternates?.canonical).toBeTruthy();
  });

  it('batch layout has canonical', async () => {
    const mod = await import('../src/app/pdf-tools/batch/layout');
    expect(mod.metadata.alternates?.canonical).toBeTruthy();
  });
});
