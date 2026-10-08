export type PasswordRequestCallback = (
  updatePassword: (password: string) => void,
  reason: 'required' | 'incorrect',
) => void;

type PdfjsLib = typeof import('pdfjs-dist');
type PDFDocumentProxy = import('pdfjs-dist').PDFDocumentProxy;

let pdfjsCache: PdfjsLib | null = null;

async function loadPdfjs(): Promise<PdfjsLib> {
  if (pdfjsCache) return pdfjsCache;
  const pdfjs = await import('pdfjs-dist');
  if (!pdfjs.GlobalWorkerOptions.workerPort) {
    pdfjs.GlobalWorkerOptions.workerPort = new Worker('/pdf.worker.min.mjs', { type: 'module' });
  }
  pdfjsCache = pdfjs;
  return pdfjs;
}

export async function loadPdfWithPassword(
  file: File,
  onPasswordRequest: PasswordRequestCallback,
  signal?: AbortSignal,
): Promise<{ doc: PDFDocumentProxy; objectUrl: string }> {
  const pdfjs = await loadPdfjs();

  const objectUrl = URL.createObjectURL(file);

  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Aborted'));
      return;
    }

    const loadingTask = pdfjs.getDocument({
      url: objectUrl,
      disableAutoFetch: true,
      disableStream: false,
      wasmUrl: '/wasm/',
    });

    // onPassword is set on the loadingTask (not in DocumentInitParameters)
    loadingTask.onPassword = (updatePassword: (password: string) => void, reason: number) => {
      // pdfjs reason: 1 = password required, 2 = incorrect password
      onPasswordRequest(updatePassword, reason === 2 ? 'incorrect' : 'required');
    };

    const abortHandler = () => {
      loadingTask.destroy().catch(() => {});
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Aborted'));
    };
    signal?.addEventListener('abort', abortHandler, { once: true });

    loadingTask.promise.then(
      (doc) => {
        signal?.removeEventListener('abort', abortHandler);
        resolve({ doc, objectUrl });
      },
      (err: unknown) => {
        signal?.removeEventListener('abort', abortHandler);
        URL.revokeObjectURL(objectUrl);
        reject(err);
      },
    );
  });
}
