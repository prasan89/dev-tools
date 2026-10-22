/**
 * Image processing queue — manages a bounded set of file processing jobs.
 * Each job goes through: queued → processing → completed | failed | cancelled.
 */

import type { QueueItem, QueueItemStatus } from './types';

export type QueueEventType = 'added' | 'changed' | 'removed';

export interface QueueEvent<TOptions, TResult> {
  type: QueueEventType;
  item: QueueItem<TOptions, TResult>;
}

export type QueueListener<TOptions, TResult> = (
  event: QueueEvent<TOptions, TResult>,
) => void;

export interface QueueOptions {
  /** Max concurrent processing jobs. Default: 2 */
  concurrency?: number;
}

type Processor<TOptions, TResult> = (
  item: QueueItem<TOptions, TResult>,
  onProgress: (pct: number) => void,
  signal: AbortSignal,
) => Promise<TResult>;

export class ImageQueue<TOptions, TResult> {
  private readonly concurrency: number;
  private items = new Map<string, QueueItem<TOptions, TResult>>();
  private active = new Map<string, AbortController>();
  private pending: string[] = [];
  private listeners: QueueListener<TOptions, TResult>[] = [];
  private processor: Processor<TOptions, TResult> | null = null;

  constructor(opts: QueueOptions = {}) {
    this.concurrency = Math.max(1, opts.concurrency ?? 2);
  }

  setProcessor(p: Processor<TOptions, TResult>): void {
    this.processor = p;
  }

  subscribe(fn: QueueListener<TOptions, TResult>): () => void {
    this.listeners.push(fn);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== fn);
    };
  }

  getAll(): QueueItem<TOptions, TResult>[] {
    return Array.from(this.items.values());
  }

  get(id: string): QueueItem<TOptions, TResult> | undefined {
    return this.items.get(id);
  }

  add(id: string, file: File, options: TOptions): void {
    const item: QueueItem<TOptions, TResult> = {
      id,
      file,
      options,
      status: 'queued',
      progress: 0,
    };
    this.items.set(id, item);
    this.pending.push(id);
    this._emit('added', item);
    this._drain();
  }

  remove(id: string): void {
    this.cancel(id);
    this.items.delete(id);
    this.pending = this.pending.filter((i) => i !== id);
  }

  cancel(id: string): void {
    const ctrl = this.active.get(id);
    if (ctrl) {
      ctrl.abort();
      this.active.delete(id);
    }
    this._update(id, { status: 'cancelled', progress: 0 });
    this.pending = this.pending.filter((i) => i !== id);
  }

  retry(id: string, options?: TOptions): void {
    const item = this.items.get(id);
    if (!item) return;
    const updated: QueueItem<TOptions, TResult> = {
      ...item,
      options: options ?? item.options,
      status: 'queued',
      progress: 0,
      result: undefined,
      error: undefined,
      outputUrl: undefined,
    };
    this.items.set(id, updated);
    this.pending.push(id);
    this._emit('changed', updated);
    this._drain();
  }

  clear(): void {
    for (const id of this.active.keys()) this.cancel(id);
    this.items.clear();
    this.pending = [];
  }

  private _drain(): void {
    if (!this.processor) return;
    while (this.active.size < this.concurrency && this.pending.length > 0) {
      const id = this.pending.shift()!;
      const item = this.items.get(id);
      if (!item || item.status !== 'queued') continue;
      this._run(item);
    }
  }

  private _run(item: QueueItem<TOptions, TResult>): void {
    const ctrl = new AbortController();
    this.active.set(item.id, ctrl);
    this._update(item.id, { status: 'processing', progress: 0 });

    this.processor!(
      item,
      (pct) => this._update(item.id, { progress: pct }),
      ctrl.signal,
    )
      .then((result) => {
        this.active.delete(item.id);
        this._update(item.id, { status: 'completed', progress: 100, result });
        this._drain();
      })
      .catch((err: unknown) => {
        this.active.delete(item.id);
        if (ctrl.signal.aborted) {
          this._update(item.id, { status: 'cancelled', progress: 0 });
        } else {
          this._update(item.id, {
            status: 'failed',
            error: err instanceof Error ? err.message : String(err),
          });
        }
        this._drain();
      });
  }

  private _update(id: string, patch: Partial<QueueItem<TOptions, TResult>>): void {
    const item = this.items.get(id);
    if (!item) return;
    const updated = { ...item, ...patch } as QueueItem<TOptions, TResult>;
    this.items.set(id, updated);
    this._emit('changed', updated);
  }

  private _emit(type: QueueEventType, item: QueueItem<TOptions, TResult>): void {
    for (const fn of this.listeners) {
      try {
        fn({ type, item });
      } catch {
        // listener errors must not crash the queue
      }
    }
  }
}

// ─── Status helpers ────────────────────────────────────────────────────────────

export function isTerminal(status: QueueItemStatus): boolean {
  return status === 'completed' || status === 'failed' || status === 'cancelled';
}

export function allDone<T, R>(items: QueueItem<T, R>[]): boolean {
  return items.length > 0 && items.every((i) => isTerminal(i.status));
}
