export default function WorkersPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
        PDF Web Worker Architecture
      </h1>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Heavy PDF operations — OCR, compression, batch processing, image conversion — run inside
        Web Workers so the browser UI stays responsive at all times.
      </p>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-gray-800 dark:text-gray-200">
          Zero-server architecture
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          All processing happens on your device. Workers run the same JavaScript environment as the
          main thread — they have no network access to our servers and cannot transmit your files.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-gray-800 dark:text-gray-200">Worker job lifecycle</h2>
        <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400">
          <li>Main thread creates a job with a unique ID and transfers the ArrayBuffer to the Worker.</li>
          <li>Worker posts progress messages back (0–100%).</li>
          <li>On completion the Worker transfers the result buffer back to the main thread.</li>
          <li>Main thread cleans up the Worker when the job is done or cancelled.</li>
        </ol>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-gray-800 dark:text-gray-200">Message protocol</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Every message between the main thread and a Worker is validated against a strict schema —
          <code className="mx-1 font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 rounded">type</code>
          and
          <code className="mx-1 font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 rounded">jobId</code>
          are required strings. Unrecognised messages are silently dropped.
        </p>
      </section>
    </div>
  );
}
