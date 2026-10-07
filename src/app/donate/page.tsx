import type { Metadata } from 'next';
import { DonationForm } from '@/components/donations/DonationForm';
import { SupportersWall } from '@/components/donations/SupportersWall';
import { TierList } from '@/components/donations/TierList';
import { getWallSupporters } from '@/lib/donations';
import { siteUrl } from '@/lib/seo/site-config';

export const metadata: Metadata = {
  title: { absolute: 'Support ToolBook — Help Keep Developer Tools Free' },
  description:
    'Support ToolBook and help keep free developer tools available for developers around the world.',
  alternates: { canonical: siteUrl('/donate') },
  openGraph: {
    title: 'Support ToolBook — Help Keep Developer Tools Free',
    description:
      'Support ToolBook and help keep free developer tools available for developers around the world.',
    url: siteUrl('/donate'),
  },
};

export default function DonatePage() {
  const supporters = getWallSupporters();

  return (
    <main className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left: creator message + form */}
        <div>
          {/* Creator section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              ❤️ Support ToolBook
            </h1>
            <div className="prose prose-sm dark:prose-invert max-w-none text-gray-600 dark:text-gray-400 space-y-3">
              <p>
                Hi, I&apos;m <strong className="text-gray-900 dark:text-gray-100">Prasanna</strong> — the developer behind ToolBook.
              </p>
              <p>
                I built ToolBook to make everyday development tasks faster and easier, with free
                tools that developers can use without unnecessary friction.
              </p>
              <p>
                If ToolBook has saved you time or helped you solve a problem, you can support the
                project with a small contribution.
              </p>
              <p>
                Your support helps me keep the tools free, improve the platform, maintain the
                infrastructure, and build new tools for developers around the world.
              </p>
              <p>
                Thank you for supporting an independent developer. 🙏
              </p>
            </div>
          </div>

          {/* Donation form */}
          <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 shadow-sm">
            <DonationForm />
          </div>
        </div>

        {/* Right: tiers + supporters wall */}
        <div className="space-y-10">
          {/* Supporter tiers */}
          <section aria-labelledby="tiers-heading">
            <h2 id="tiers-heading" className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
              Supporter Tiers
            </h2>
            <TierList />
          </section>

          {/* Supporters wall */}
          <SupportersWall supporters={supporters} />
        </div>
      </div>
    </main>
  );
}
