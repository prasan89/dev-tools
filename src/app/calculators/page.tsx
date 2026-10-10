import type { Metadata } from 'next';
import Link from 'next/link';
import { CALCULATORS, CALCULATOR_CATEGORIES, getCalculatorsByCategory } from '@/lib/calculators/catalog';
import { siteUrl } from '@/lib/seo/site-config';

export const metadata: Metadata = {
  title: 'Free Online Calculators | DevToolsHub',
  description: 'Explore 75 free online calculators for finance, health, mathematics and everyday tasks. Fast, private, browser-based calculations with no sign-up.',
  alternates: { canonical: siteUrl('/calculators') },
  openGraph: {
    title: 'Free Online Calculators | DevToolsHub',
    description: '75 free browser-based calculators for finance, health, math and everyday tasks.',
    url: siteUrl('/calculators'),
    type: 'website',
  },
};

const categoryDetails: Record<string, { description: string; icon: string }> = {
  Financial: { description: 'Loans, interest, investing, budgets and personal finance.', icon: '↗' },
  'Fitness & Health': { description: 'Body metrics, nutrition, exercise and pregnancy date estimates.', icon: '♡' },
  Math: { description: 'Scientific, percentage, fraction, geometry and statistics tools.', icon: '∑' },
  Other: { description: 'Dates, time, conversions, engineering and everyday utilities.', icon: '◷' },
};

export default function CalculatorsPage() {
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <section className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
          <div className="max-w-3xl">
            <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-950 dark:text-blue-300">Free · Private · Browser-based</span>
            <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-5xl">Calculators for everyday decisions.</h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300">Quick answers for money, health, maths and everyday planning. Change an input and explore the result — calculations run locally in your browser.</p>
            <div className="mt-6 flex flex-wrap gap-3 text-sm text-slate-600 dark:text-slate-300">
              <span className="rounded-lg border border-slate-200 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-950">75 calculators</span>
              <span className="rounded-lg border border-slate-200 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-950">4 categories</span>
              <span className="rounded-lg border border-slate-200 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-950">No sign-up</span>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <nav aria-label="Calculator categories" className="mb-10 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {CALCULATOR_CATEGORIES.map((category) => {
            const details = categoryDetails[category];
            return <a key={category} href={'#' + category.toLowerCase().replace(/[^a-z]+/g, '-')} className="group rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-700">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-xl text-blue-700 dark:bg-blue-950 dark:text-blue-300">{details.icon}</span>
              <h2 className="mt-4 font-semibold text-slate-950 group-hover:text-blue-700 dark:text-white dark:group-hover:text-blue-300">{category}</h2>
              <p className="mt-1 text-sm leading-5 text-slate-600 dark:text-slate-400">{details.description}</p>
              <p className="mt-3 text-xs font-semibold text-slate-500">{getCalculatorsByCategory(category).length} calculators →</p>
            </a>;
          })}
        </nav>

        <div className="space-y-12">
          {CALCULATOR_CATEGORIES.map((category) => (
            <section key={category} id={category.toLowerCase().replace(/[^a-z]+/g, '-')} aria-labelledby={'heading-' + category.toLowerCase().replace(/[^a-z]+/g, '-')}>
              <div className="mb-4 flex items-end justify-between gap-3">
                <div>
                  <h2 id={'heading-' + category.toLowerCase().replace(/[^a-z]+/g, '-')} className="text-2xl font-bold tracking-tight text-slate-950 dark:text-white">{category}</h2>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{categoryDetails[category].description}</p>
                </div>
                <span className="shrink-0 text-sm text-slate-500">{getCalculatorsByCategory(category).length} tools</span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {getCalculatorsByCategory(category).map((calculator) => (
                  <Link key={calculator.slug} href={'/calculators/' + calculator.slug} className="group rounded-xl border border-slate-200 bg-white p-4 transition hover:border-blue-300 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-800">
                    <span className="font-semibold text-slate-900 group-hover:text-blue-700 dark:text-white dark:group-hover:text-blue-300">{calculator.name}</span>
                    <span className="mt-1.5 block text-sm leading-5 text-slate-600 dark:text-slate-400">{calculator.description}</span>
                    <span className="mt-3 inline-flex text-xs font-semibold text-blue-700 dark:text-blue-300">Open calculator →</span>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
        <p className="mt-12 border-t border-slate-200 pt-6 text-xs leading-5 text-slate-500 dark:border-slate-800 dark:text-slate-400">Calculations are provided for general information. Financial, health and engineering results may rely on simplified assumptions and should be checked before making important decisions.</p>
      </div>
    </main>
  );
}
