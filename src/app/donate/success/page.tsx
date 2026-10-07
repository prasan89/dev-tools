import type { Metadata } from 'next';
import Link from 'next/link';
import { SUPPORTER_TIERS, type SupporterTierId } from '@/lib/donations';

export const metadata: Metadata = {
  title: { absolute: 'Thank You — ToolBook Supporters' },
  robots: { index: false, follow: false },
};

interface SuccessPageProps {
  searchParams: Promise<{ tier?: string; wall?: string; name?: string }>;
}

export default async function DonateSuccessPage({ searchParams }: SuccessPageProps) {
  const params = await searchParams;
  const tierId = (params.tier || 'supporter') as SupporterTierId;
  const showOnWall = params.wall === '1';
  const displayName = params.name;

  const tier = SUPPORTER_TIERS.find((t) => t.id === tierId) ?? SUPPORTER_TIERS[SUPPORTER_TIERS.length - 1];

  return (
    <main className="mx-auto max-w-lg px-4 sm:px-6 py-16 text-center">
      <div className="text-5xl mb-6" aria-hidden="true">❤️</div>

      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-3">
        Thank You!
      </h1>

      <p className="text-gray-600 dark:text-gray-400 mb-8">
        Thank you for supporting ToolBook.
      </p>

      {/* Tier badge */}
      <div className="inline-flex items-center gap-3 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900 px-6 py-4 mb-8">
        <span className="text-3xl" aria-hidden="true">{tier.emoji}</span>
        <div className="text-left">
          <div className="text-xs text-blue-500 dark:text-blue-400 uppercase tracking-wider font-medium mb-0.5">
            Supporter tier
          </div>
          <div className="text-lg font-bold text-blue-700 dark:text-blue-300">
            {tier.label}
          </div>
        </div>
      </div>

      {/* Wall status */}
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
        {showOnWall && displayName
          ? `Your name "${displayName}" may appear on the ToolBook Supporters Wall.`
          : showOnWall
          ? 'Your name may appear on the ToolBook Supporters Wall.'
          : 'Your donation will remain private.'}
      </p>

      {/* Message */}
      <div className="text-gray-600 dark:text-gray-400 text-sm space-y-1 mb-10">
        <p>Keep building.</p>
        <p>Keep learning.</p>
        <p>Keep shipping. 🚀</p>
      </div>

      <Link
        href="/"
        className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 transition-colors"
      >
        Continue Using ToolBook
      </Link>
    </main>
  );
}
