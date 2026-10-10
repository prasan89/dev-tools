'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import type { CalculatorEntry } from '@/lib/calculators/catalog';
import { getCalculatorsByCategory } from '@/lib/calculators/catalog';
import { calculate, getCalculatorFields, type CalculatorValues } from '@/lib/calculators/engine';

function initialValues(calculator: CalculatorEntry): CalculatorValues {
  return Object.fromEntries(getCalculatorFields(calculator).map((field) => [
    field.key,
    field.defaultValue ?? (field.kind === 'date' ? new Date().toISOString().slice(0, 10) : ''),
  ]));
}

export function CalculatorWorkbench({ calculator }: { calculator: CalculatorEntry }) {
  const [values, setValues] = useState<CalculatorValues>(() => initialValues(calculator));
  const [copied, setCopied] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const fields = useMemo(() => getCalculatorFields(calculator), [calculator]);
  const result = useMemo(() => calculate(calculator.slug, values), [calculator.slug, values, refresh]);
  const related = getCalculatorsByCategory(calculator.category).filter((item) => item.slug !== calculator.slug).slice(0, 4);

  function update(key: string, value: string) {
    setValues((previous) => ({ ...previous, [key]: value }));
    setCopied(false);
  }

  async function copyResult() {
    const text = [result.title, ...result.lines].join('\n');
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
      <section className="min-w-0">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-7">
          <div className="mb-6">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-950 dark:text-blue-300">{calculator.category}</span>
              <span className="text-xs text-slate-500">Free · Browser-based · No sign-up</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-3xl">{calculator.name}</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">{calculator.description}</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {fields.map((field) => (
              <label key={field.key} className={field.kind === 'textarea' ? 'sm:col-span-2' : 'block'}>
                <span className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200">{field.label}</span>
                {field.kind === 'select' ? (
                  <select
                    value={String(values[field.key] ?? '')}
                    onChange={(event) => update(field.key, event.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:ring-blue-950"
                  >
                    {(field.options ?? []).map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                  </select>
                ) : field.kind === 'textarea' ? (
                  <textarea
                    value={String(values[field.key] ?? '')}
                    onChange={(event) => update(field.key, event.target.value)}
                    rows={3}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 font-mono text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:ring-blue-950"
                  />
                ) : (
                  <input
                    type={field.kind === 'date' ? 'date' : field.kind === 'text' ? 'text' : 'number'}
                    value={String(values[field.key] ?? '')}
                    min={field.min}
                    max={field.max}
                    step={field.step ?? 'any'}
                    onChange={(event) => update(field.key, event.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:ring-blue-950"
                  />
                )}
                {field.hint && <span className="mt-1 block text-xs text-slate-500">{field.hint}</span>}
              </label>
            ))}
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <button type="button" onClick={() => setRefresh((value) => value + 1)} className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2">
              Calculate
            </button>
            <button type="button" onClick={() => { setValues(initialValues(calculator)); setCopied(false); }} className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">
              Reset
            </button>
            {calculator.slug === 'password-generator' && <button type="button" onClick={() => setRefresh((value) => value + 1)} className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-200">Generate again</button>}
          </div>

          <section aria-live="polite" aria-atomic="true" className="mt-7 rounded-2xl border border-blue-100 bg-blue-50/70 p-5 dark:border-blue-900 dark:bg-blue-950/40">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <h2 className="text-lg font-bold text-slate-950 dark:text-white">{result.title}</h2>
              <button type="button" onClick={copyResult} className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
                {copied ? 'Copied' : 'Copy result'}
              </button>
            </div>
            <div className="mt-3 space-y-2">
              {result.lines.map((line, index) => <p key={index} className={index === 0 ? 'break-words text-base font-semibold text-blue-800 dark:text-blue-200' : 'break-words text-sm leading-6 text-slate-700 dark:text-slate-300'}>{line}</p>)}
            </div>
          </section>
          <p className="mt-4 text-xs leading-5 text-slate-500 dark:text-slate-400">Results are estimates for general information. Verify important financial, health, engineering or safety decisions with an appropriate qualified professional. Formulas and assumptions may not reflect every jurisdiction or individual circumstance.</p>
        </div>

        <article className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 sm:p-7">
          <h2 className="text-lg font-bold text-slate-950 dark:text-white">About this calculator</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{calculator.description} Change the inputs to explore different scenarios. Calculations run locally in your browser, so values entered here are not sent to a calculator API.</p>
          <h3 className="mt-5 text-sm font-semibold text-slate-900 dark:text-white">How to use it</h3>
          <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm leading-6 text-slate-600 dark:text-slate-300">
            <li>Enter values in the fields above using the displayed units.</li>
            <li>Select any available options that match your situation.</li>
            <li>Choose Calculate to refresh the result, then copy it if needed.</li>
          </ol>
        </article>
      </section>

      <aside className="space-y-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="font-semibold text-slate-900 dark:text-white">More {calculator.category} calculators</h2>
          <div className="mt-3 divide-y divide-slate-100 dark:divide-slate-800">
            {related.map((item) => <Link key={item.slug} href={'/calculators/' + item.slug} className="block py-3 text-sm font-medium text-slate-700 hover:text-blue-700 dark:text-slate-300 dark:hover:text-blue-300">{item.name}<span className="mt-1 block text-xs font-normal text-slate-500">{item.description}</span></Link>)}
          </div>
          <Link href="/calculators" className="mt-3 inline-flex text-sm font-semibold text-blue-700 hover:underline dark:text-blue-300">Browse all calculators →</Link>
        </div>
        <div className="rounded-2xl bg-slate-950 p-5 text-white">
          <p className="text-sm font-semibold">Fast by design</p>
          <p className="mt-2 text-sm leading-6 text-slate-300">No account, no calculation API and no page reload. Results are computed on your device.</p>
        </div>
      </aside>
    </div>
  );
}
