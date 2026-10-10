import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CALCULATORS, getCalculator } from '@/lib/calculators/catalog';
import { CalculatorWorkbench } from '@/components/calculators/CalculatorWorkbench';
import { siteUrl } from '@/lib/seo/site-config';

interface CalculatorPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return CALCULATORS.map((calculator) => ({ slug: calculator.slug }));
}

export async function generateMetadata({ params }: CalculatorPageProps): Promise<Metadata> {
  const { slug } = await params;
  const calculator = getCalculator(slug);
  if (!calculator) return { title: 'Calculator not found' };
  return {
    title: calculator.name + ' — Free Online Calculator | DevToolsHub',
    description: calculator.description + ' Free, fast and browser-based with no sign-up.',
    alternates: { canonical: siteUrl('/calculators/' + slug) },
    openGraph: {
      title: calculator.name + ' | DevToolsHub',
      description: calculator.description,
      url: siteUrl('/calculators/' + slug),
      type: 'website',
    },
  };
}

export default async function CalculatorPage({ params }: CalculatorPageProps) {
  const { slug } = await params;
  const calculator = getCalculator(slug);
  if (!calculator) notFound();

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: calculator.name,
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'Any',
    description: calculator.description,
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 dark:bg-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <nav aria-label="Breadcrumb" className="mb-5 text-sm text-slate-500 dark:text-slate-400">
          <a href="/" className="hover:text-blue-700">Home</a><span className="mx-2">/</span><a href="/calculators" className="hover:text-blue-700">Calculators</a><span className="mx-2">/</span><span className="text-slate-700 dark:text-slate-200">{calculator.name}</span>
        </nav>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, '\\u003c') }} />
        <CalculatorWorkbench calculator={calculator} />
      </div>
    </main>
  );
}
